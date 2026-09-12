import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CACHE_POLICIES = ["immutable", "short", "swr", "none"];

function buildEndpointMatrixArtifact(rows) {
  const normalizedRows = rows
    .map((row) => ({
      endpoint: row.endpoint,
      method: String(row.method).toUpperCase(),
      expectedStatus: row.expectedStatus,
      cachePolicy: row.cachePolicy,
      proofTag: row.proofTag,
    }))
    .sort((a, b) => {
      if (a.endpoint !== b.endpoint) return a.endpoint.localeCompare(b.endpoint);
      if (a.method !== b.method) return a.method.localeCompare(b.method);
      return a.proofTag.localeCompare(b.proofTag);
    });

  const byCachePolicy = Object.fromEntries(CACHE_POLICIES.map((key) => [key, 0]));
  for (const row of normalizedRows) byCachePolicy[row.cachePolicy] += 1;

  return {
    schemaVersion: "1.0",
    generatedBy: "skygrid-auto-drill",
    rows: normalizedRows,
    summary: {
      totalEndpoints: normalizedRows.length,
      byCachePolicy,
    },
  };
}

const rootDir = process.cwd();
const inputPath = process.env.ENDPOINT_MATRIX_INPUT
  ? path.resolve(rootDir, process.env.ENDPOINT_MATRIX_INPUT)
  : path.resolve(rootDir, "artifacts/endpoint-matrix.input.json");
const outputPath = process.env.ENDPOINT_MATRIX_OUTPUT
  ? path.resolve(rootDir, process.env.ENDPOINT_MATRIX_OUTPUT)
  : path.resolve(rootDir, "artifacts/endpoint-matrix.json");

const raw = await readFile(inputPath, "utf8");
const rows = JSON.parse(raw);
const artifact = buildEndpointMatrixArtifact(rows);
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");
console.log(`endpoint matrix artifact written: ${path.relative(rootDir, outputPath)}`);
