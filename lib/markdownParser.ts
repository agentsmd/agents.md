/**
 * Markdown parser utilities for AGENTS.md validation
 */

export interface ParsedMarkdown {
  sections: Section[];
  lineCount: number;
  characterCount: number;
  codeBlocks: CodeBlock[];
  headings: Heading[];
}

export interface Section {
  title: string;
  level: number;
  lineNumber: number;
  content: string;
}

export interface CodeBlock {
  language: string;
  code: string;
  lineNumber: number;
}

export interface Heading {
  text: string;
  level: number;
  lineNumber: number;
}

/**
 * Parse AGENTS.md content into structured data
 */
export function parseMarkdown(content: string): ParsedMarkdown {
  const lines = content.split('\n');
  const sections: Section[] = [];
  const codeBlocks: CodeBlock[] = [];
  const headings: Heading[] = [];

  let currentSection: Section | null = null;
  let inCodeBlock = false;
  let currentCodeBlock: { language: string; code: string; lineNumber: number } | null = null;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    // Detect code blocks
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        // Start of code block
        const language = line.trim().slice(3).trim() || 'text';
        currentCodeBlock = { language, code: '', lineNumber };
        inCodeBlock = true;
      } else {
        // End of code block
        if (currentCodeBlock) {
          codeBlocks.push(currentCodeBlock);
          currentCodeBlock = null;
        }
        inCodeBlock = false;
      }
      return;
    }

    // Accumulate code block content
    if (inCodeBlock && currentCodeBlock) {
      currentCodeBlock.code += line + '\n';
      return;
    }

    // Detect headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();

      headings.push({ text, level, lineNumber });

      // Start a new section
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = { title: text, level, lineNumber, content: '' };
    } else if (currentSection) {
      // Add content to current section
      currentSection.content += line + '\n';
    }
  });

  // Add the last section
  if (currentSection) {
    sections.push(currentSection);
  }

  return {
    sections,
    lineCount: lines.length,
    characterCount: content.length,
    codeBlocks,
    headings,
  };
}

/**
 * Extract commands from markdown content
 * Looks for inline code (backticks) that appear to be commands
 */
export function extractCommands(content: string): string[] {
  const commands: string[] = [];
  const inlineCodeRegex = /`([^`]+)`/g;

  let match;
  while ((match = inlineCodeRegex.exec(content)) !== null) {
    const code = match[1];
    // Check if it looks like a command (contains common command patterns)
    if (
      code.includes(' ') ||
      code.startsWith('npm ') ||
      code.startsWith('pnpm ') ||
      code.startsWith('yarn ') ||
      code.startsWith('bun ') ||
      code.startsWith('git ') ||
      code.startsWith('docker ') ||
      code.startsWith('make ') ||
      code.includes('test') ||
      code.includes('build') ||
      code.includes('dev') ||
      code.includes('start')
    ) {
      commands.push(code);
    }
  }

  return commands;
}

/**
 * Check if content mentions specific versions
 */
export function hasVersionSpecificity(content: string): boolean {
  // Look for version patterns like "React 18", "Node.js 20", "Python 3.11"
  const versionPatterns = [
    /\b\w+\s+\d+(\.\d+)?(\.\d+)?\b/g, // "React 18.2.0" or "Node 20"
    /\b\w+\s+v\d+(\.\d+)?(\.\d+)?\b/g, // "Node v20.0.0"
  ];

  return versionPatterns.some(pattern => pattern.test(content));
}

/**
 * Detect common section keywords
 */
export function detectSectionKeywords(text: string): {
  hasSetup: boolean;
  hasTesting: boolean;
  hasCodeStyle: boolean;
  hasArchitecture: boolean;
  hasSecurity: boolean;
  hasGitWorkflow: boolean;
} {
  const lower = text.toLowerCase();

  return {
    hasSetup: /\b(setup|install|dependencies|requirements|getting started|dev environment)\b/.test(lower),
    hasTesting: /\b(test|testing|qa|quality)\b/.test(lower),
    hasCodeStyle: /\b(style|lint|format|convention|standards)\b/.test(lower),
    hasArchitecture: /\b(architecture|structure|design|organization|overview)\b/.test(lower),
    hasSecurity: /\b(security|auth|authentication|secrets|credentials)\b/.test(lower),
    hasGitWorkflow: /\b(git|commit|pr|pull request|branch|workflow)\b/.test(lower),
  };
}
