// File: /components/CodeExample.tsx

import React from "react";
import CopyIcon from "./icons/CopyIcon";

interface CodeExampleProps {
  /** Markdown content to display; falls back to default example if not provided */
  code?: string;
  /** Optional URL for "View on GitHub" link */
  href?: string;
  /** If true, render only the code block without the section wrapper */
  compact?: boolean;
  /** Override Tailwind height classes for the <pre> block */
  heightClass?: string;

  /**
   * When true, vertically center the content and copy button – useful for
   * single-line shell commands shown inside a short container (e.g. FAQ).
   */
  centerVertically?: boolean;
}

export const HERO_AGENTS_MD = `# AGENTS.md

## Setup commands
- Install deps: \`pnpm install\`
- Start dev server: \`pnpm dev\`
- Run tests: \`pnpm test\`

## Code style
- TypeScript strict mode
- Single quotes, no semicolons
- Use functional patterns where possible`;

const EXAMPLE_AGENTS_MD = `# Sample AGENTS.md file

## Dev environment tips
- Use \`pnpm dlx turbo run where <project_name>\` to jump to a package instead \
of scanning with \`ls\`.
- Run \`pnpm install --filter <project_name>\` to add the package to your \
workspace so Vite, ESLint, and TypeScript can see it.
- Use \`pnpm create vite@latest <project_name> -- --template react-ts\` to \
spin up a new React + Vite package with TypeScript checks ready.
- Check the name field inside each package's package.json to confirm the \
right name—skip the top-level one.

## Testing instructions
- Find the CI plan in the .github/workflows folder.
- Run \`pnpm turbo run test --filter <project_name>\` to run every check \
defined for that package.
- From the package root you can just call \`pnpm test\`. The commit should \
pass all tests before you merge.
- To focus on one step, add the Vitest pattern: \`pnpm vitest run -t "<test \
name>"\`.
- Fix any test or type errors until the whole suite is green.
- After moving files or changing imports, run \`pnpm lint --filter \
<project_name>\` to be sure ESLint and TypeScript rules still pass.
- Add or update tests for the code you change, even if nobody asked.

## PR instructions
- Title format: [<project_name>] <Title>
- Always run \`pnpm lint\` and \`pnpm test\` before committing.`;

/**
 * Very lightly highlight the Markdown without fully parsing it.
 */
function parseMarkdown(md: string): React.ReactNode[] {
  const lines = md.split("\n");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle headers
    if (line.startsWith("# ") || line.startsWith("## ") || line.startsWith("### ")) {
      elements.push(
        <div key={i} className="font-bold">
          {line}
        </div>
      );
      continue;
    }

    // Handle list items with inline code
    if (line.startsWith("- ")) {
      elements.push(<div key={i}>{renderLineWithInlineCode(line)}</div>);
      continue;
    }

    // Handle empty lines
    if (line.trim() === "") {
      elements.push(<div key={i}>&nbsp;</div>);
      continue;
    }

    // Handle regular lines with inline code
    elements.push(<div key={i}>{renderLineWithInlineCode(line)}</div>);
  }

  return elements;
}

/**
 * Render a line with inline code highlighting
 */
function renderLineWithInlineCode(line: string): React.ReactNode {
  const parts = line.split(/(`[^`]+`)/g);

  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <span key={index} className="rounded bg-gray-200 px-1 dark:bg-gray-800">
          {part}
        </span>
      );
    }
    return part;
  });
}

/**
 * Markdown block for AGENTS.md examples.
 */
export default function CodeExample({
  code,
  href,
  compact = false,
  heightClass,
  centerVertically = false,
}: CodeExampleProps) {
  const md = code ?? EXAMPLE_AGENTS_MD;
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (err) {
       
      console.error("Failed to copy to clipboard:", err);
    }
  };

  const topControlClass = centerVertically ? "top-1/2 -translate-y-1/2" : "top-3";

  const content = (
    <div className="relative">
      {/* ✅ No nested interactive controls:
          Keep button + link as siblings in a non-interactive container. */}
      <div className={`absolute right-3 ${topControlClass} z-10 flex items-center gap-3`}>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline hover:no-underline text-gray-600 dark:text-gray-300"
          >
            View on GitHub
          </a>
        ) : null}

        <button
          type="button"
          onClick={copyToClipboard}
          className="rounded-md bg-transparent p-2 text-gray-800 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 cursor-pointer"
          aria-label={copied ? "Copied" : "Copy to clipboard"}
        >
          {copied ? (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <CopyIcon className="h-4 w-4" />
          )}
        </button>
      </div>

      <pre
        className={`relative rounded-lg bg-white p-4 text-xs leading-6 text-gray-800 dark:bg-black dark:text-gray-100 overflow-x-auto border border-gray-200 dark:border-gray-700 shadow-sm ${
          centerVertically ? "flex items-center" : ""
        } ${heightClass ? heightClass : compact ? "" : "min-h-[250px] max-h-[500px]"}`}
      >
        <code>{parseMarkdown(md)}</code>
      </pre>
    </div>
  );

  if (compact) {
    return <div className="w-full">{content}</div>;
  }

  return (
    <section className="bg-gray-50 px-6 pb-24 pt-10 dark:bg-gray-900/40">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <h2 className="text-3xl font-semibold tracking-tight">AGENTS.md in action</h2>
        {content}
      </div>
    </section>
  );
}
