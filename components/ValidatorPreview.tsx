import React from 'react';

interface ValidatorPreviewProps {
  content: string;
}

/**
 * Live preview of AGENTS.md content with syntax highlighting
 */
export default function ValidatorPreview({ content }: ValidatorPreviewProps) {
  /**
   * Very lightly highlight the Markdown without fully parsing it.
   */
  function parseMarkdown(md: string): React.ReactNode[] {
    const lines = md.split('\n');
    const elements: React.ReactNode[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Handle headers
      if (line.startsWith('# ') || line.startsWith('## ') || line.startsWith('### ')) {
        elements.push(
          <div key={i} className="font-bold">
            {line}
          </div>
        );
      } else if (line.startsWith('- ')) {
        // Handle list items with inline code
        elements.push(<div key={i}>{renderLineWithInlineCode(line)}</div>);
      } else if (line.trim() === '') {
        // Handle empty lines
        elements.push(<div key={i}>&nbsp;</div>);
      } else {
        // Handle regular lines with inline code
        elements.push(<div key={i}>{renderLineWithInlineCode(line)}</div>);
      }
    }

    return elements;
  }

  /**
   * Render a line with inline code highlighting
   */
  function renderLineWithInlineCode(line: string): React.ReactNode {
    const parts = line.split(/(`[^`]+`)/g);

    return parts.map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        // This is inline code
        return (
          <span key={index} className="bg-gray-200 dark:bg-gray-800 px-1 rounded">
            {part}
          </span>
        );
      }
      // Regular text
      return part;
    });
  }

  if (!content || content.trim().length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="mb-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
          Preview
        </div>
        <div className="flex-1 rounded-lg bg-white dark:bg-black border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-center shadow-sm">
          <p className="text-gray-400 dark:text-gray-600 text-sm">
            Your preview will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
        Preview
      </div>
      <div className="flex-1 overflow-y-auto rounded-lg bg-white dark:bg-black border border-gray-200 dark:border-gray-700 shadow-sm">
        <pre className="p-4 text-xs leading-6 text-gray-800 dark:text-gray-100">
          <code>{parseMarkdown(content)}</code>
        </pre>
      </div>
    </div>
  );
}
