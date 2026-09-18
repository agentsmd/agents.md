#!/usr/bin/env python3
"""Batch source files, run a pilot batch, and merge final output."""

from __future__ import annotations

import argparse
from functools import partial
import logging
import sys
import time
from pathlib import Path
from typing import Callable, Iterable


LOGGER = logging.getLogger("batch_source")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Process source files in batches with a pilot run, retries, and final merge output."
        )
    )
    parser.add_argument("source_dir", type=Path, help="Directory containing source files.")
    parser.add_argument("output_file", type=Path, help="Path for merged output.")
    parser.add_argument(
        "--pattern",
        default="**/*",
        help="Glob pattern used to select source files (default: **/*).",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=10,
        help="Maximum files per batch (default: 10).",
    )
    parser.add_argument(
        "--max-bytes",
        type=int,
        default=200_000,
        help="Max cumulative bytes per batch (default: 200000, set 0 to disable).",
    )
    parser.add_argument(
        "--retries",
        type=int,
        default=3,
        help="Retries per batch on failure (default: 3).",
    )
    parser.add_argument(
        "--retry-delay",
        type=float,
        default=0.5,
        help="Initial retry delay in seconds (default: 0.5).",
    )
    parser.add_argument(
        "--log-level",
        default="INFO",
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
        help="Logging level (default: INFO).",
    )
    return parser.parse_args()


def resolve_sources(source_dir: Path, pattern: str) -> list[Path]:
    if not source_dir.exists() or not source_dir.is_dir():
        raise ValueError(f"Source directory does not exist or is not a directory: {source_dir}")
    files = [p for p in source_dir.glob(pattern) if p.is_file()]
    files.sort()
    if not files:
        raise ValueError(f"No source files matched pattern '{pattern}' under {source_dir}")
    return files


def build_batches(files: Iterable[Path], batch_size: int, max_bytes: int) -> list[list[Path]]:
    if batch_size <= 0:
        raise ValueError("--batch-size must be greater than 0")
    if max_bytes < 0:
        raise ValueError("--max-bytes must be >= 0")

    batches: list[list[Path]] = []
    current: list[Path] = []
    current_bytes = 0

    for file in files:
        file_size = file.stat().st_size
        max_bytes_would_exceed = max_bytes > 0 and (current_bytes + file_size > max_bytes)
        if current and (len(current) >= batch_size or max_bytes_would_exceed):
            batches.append(current)
            current = []
            current_bytes = 0

        current.append(file)
        current_bytes += file_size

    if current:
        batches.append(current)

    return batches


def process_batch(batch_index: int, batch: list[Path], batch_output_dir: Path, source_root: Path) -> Path:
    out_path = batch_output_dir / f"batch_{batch_index:04d}.txt"
    with out_path.open("w", encoding="utf-8") as out:
        for source_file in batch:
            relative = source_file.relative_to(source_root)
            content = source_file.read_text(encoding="utf-8")
            out.write(f"\n===== BEGIN {relative} =====\n")
            out.write(content)
            if not content.endswith("\n"):
                out.write("\n")
            out.write(f"===== END {relative} =====\n")
    return out_path


def run_with_retries(
    batch_index: int,
    retries: int,
    delay: float,
    process_fn: Callable[[], Path],
) -> Path:
    """Run a batch processor with exponential-backoff retries."""
    attempt = 0
    current_delay = delay
    max_attempts = retries + 1
    while True:
        attempt += 1
        try:
            LOGGER.info("Processing batch %s (attempt %s)", batch_index, attempt)
            return process_fn()
        except Exception as exc:  # noqa: BLE001
            if attempt >= max_attempts:
                LOGGER.error("Batch %s failed after %s attempts: %s", batch_index, attempt, exc)
                raise
            LOGGER.warning(
                "Batch %s failed on attempt %s/%s: %s. Retrying in %.2fs",
                batch_index,
                attempt,
                max_attempts,
                exc,
                current_delay,
            )
            time.sleep(current_delay)
            current_delay *= 2


def run_pilot_batch(first_batch: list[Path], batch_output_dir: Path, source_root: Path) -> Path:
    """Process the first batch as a pilot to validate output and performance."""
    start = time.perf_counter()
    output_path = process_batch(1, first_batch, batch_output_dir, source_root)
    duration = time.perf_counter() - start
    LOGGER.info(
        "Pilot batch complete: files=%s size=%sB duration=%.3fs output=%s",
        len(first_batch),
        output_path.stat().st_size,
        duration,
        output_path,
    )
    return output_path


def merge_batch_outputs(batch_outputs: list[Path], output_file: Path) -> None:
    """Merge all batch output fragments into one final output file."""
    output_file.parent.mkdir(parents=True, exist_ok=True)
    with output_file.open("w", encoding="utf-8") as merged:
        for batch_output in batch_outputs:
            merged.write(batch_output.read_text(encoding="utf-8"))
    LOGGER.info("Merged %s batch outputs into %s", len(batch_outputs), output_file)


def main() -> int:
    args = parse_args()
    logging.basicConfig(
        level=getattr(logging, args.log_level),
        format="%(asctime)s %(levelname)s %(message)s",
    )

    try:
        files = resolve_sources(args.source_dir, args.pattern)
        batches = build_batches(files, args.batch_size, args.max_bytes)
        if not batches:
            raise ValueError("No batches were created from the selected source files")
        LOGGER.info(
            "Batch configuration initialized: total_files=%s total_batches=%s batch_size=%s max_bytes=%s",
            len(files),
            len(batches),
            args.batch_size,
            args.max_bytes,
        )

        temp_dir = args.output_file.parent / ".batch_source"
        temp_dir.mkdir(parents=True, exist_ok=True)

        batch_outputs: list[Path] = []

        # Pilot run
        pilot_output = run_pilot_batch(batches[0], temp_dir, args.source_dir)
        batch_outputs.append(pilot_output)

        # Scale across remaining batches with retries
        for idx, batch in enumerate(batches[1:], start=2):
            output = run_with_retries(
                idx,
                retries=args.retries,
                delay=args.retry_delay,
                process_fn=partial(process_batch, idx, batch, temp_dir, args.source_dir),
            )
            batch_outputs.append(output)

        merge_batch_outputs(batch_outputs, args.output_file)
        return 0
    except Exception as exc:  # noqa: BLE001
        LOGGER.error("Batch source processing failed: %s", exc)
        return 1


if __name__ == "__main__":
    sys.exit(main())
