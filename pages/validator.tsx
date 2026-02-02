import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Footer from '@/components/Footer';
import ValidatorInput from '@/components/ValidatorInput';
import ValidatorResults from '@/components/ValidatorResults';
import ValidatorPreview from '@/components/ValidatorPreview';
import { validateAgentsMd } from '@/lib/validator';

const EXAMPLE_CONTENT = `# AGENTS.md

## Setup
- Install dependencies: \`pnpm install\`
- Start dev server: \`pnpm dev\`
- Build for production: \`pnpm build\`

## Testing
- Run all tests: \`pnpm test\`
- Run specific test: \`pnpm test -- <pattern>\`
- Lint code: \`pnpm lint\`

## Code style
- TypeScript strict mode enabled
- Use functional components with hooks
- Single quotes, no semicolons
- Prefer named exports over default exports

## Architecture
- Next.js 16 with Pages Router
- React 19 for UI components
- Tailwind CSS 4 for styling
- TypeScript 5 for type safety

## Git workflow
- Create feature branches from main
- Run tests before committing
- Write clear commit messages
- Open PR for review before merging`;

const DEBOUNCE_MS = 300;

export default function ValidatorPage() {
  const [content, setContent] = useState('');
  const [debouncedContent, setDebouncedContent] = useState('');

  // Debounce content changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedContent(content);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [content]);

  // Validate content
  const validationResult = useMemo(() => {
    return validateAgentsMd(debouncedContent);
  }, [debouncedContent]);

  const loadExample = () => {
    setContent(EXAMPLE_CONTENT);
  };

  const clearContent = () => {
    setContent('');
  };

  return (
    <>
      <Head>
        <title>AGENTS.md Validator - Validate Your AGENTS.md File</title>
        <meta
          name="description"
          content="Validate your AGENTS.md file with helpful suggestions to improve clarity and usefulness for AI coding agents."
        />
      </Head>

      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="px-6 py-6 bg-gray-50 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <Link
                href="/"
                className="text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity"
              >
                AGENTS.md
              </Link>
              <Link
                href="/"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                ← Back to home
              </Link>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                AGENTS.md Validator
              </h1>
              <p className="text-gray-700 dark:text-gray-300 max-w-2xl">
                Get helpful suggestions to improve your AGENTS.md file. All feedback is
                non-blocking - use what helps your project.
              </p>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 px-6 py-8 bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto">
            {/* Action buttons */}
            <div className="flex gap-3 mb-6 flex-wrap">
              <button
                onClick={loadExample}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Load Example
              </button>
              <button
                onClick={clearContent}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Clear
              </button>
            </div>

            {/* Two-column layout: Input + Preview on left, Results on right */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-280px)] min-h-[600px]">
              {/* Left column: Input and Preview */}
              <div className="lg:col-span-2 flex flex-col gap-6 h-full">
                {/* Input */}
                <div className="flex-1 min-h-0">
                  <ValidatorInput
                    value={content}
                    onChange={setContent}
                    placeholder="Paste your AGENTS.md content here..."
                  />
                </div>

                {/* Preview */}
                <div className="flex-1 min-h-0">
                  <ValidatorPreview content={content} />
                </div>
              </div>

              {/* Right column: Results */}
              <div className="h-full">
                <ValidatorResults
                  suggestions={validationResult.suggestions}
                  score={validationResult.score}
                  summary={validationResult.summary}
                />
              </div>
            </div>

            {/* Info section */}
            <div className="mt-12 max-w-3xl">
              <h2 className="text-xl font-semibold mb-3">About the Validator</h2>
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <p>
                  This validator provides <strong>suggestions, not rules</strong>. AGENTS.md is
                  intentionally flexible - there are no required fields or strict schemas.
                </p>
                <p>
                  Use the suggestions that make sense for your project and ignore the rest. The
                  goal is to help you create a clear, useful guide for AI coding agents.
                </p>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
