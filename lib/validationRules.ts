/**
 * Validation rules for AGENTS.md files
 */

import { ParsedMarkdown, detectSectionKeywords, extractCommands, hasVersionSpecificity } from './markdownParser';

export type SuggestionPriority = 'low' | 'medium' | 'high';
export type SuggestionType = 'tip' | 'info' | 'success';

export interface ValidationSuggestion {
  type: SuggestionType;
  title: string;
  message: string;
  suggestion?: string;
  example?: string;
  priority: SuggestionPriority;
}

/**
 * Check if the file is too long
 */
export function checkLength(parsed: ParsedMarkdown): ValidationSuggestion | null {
  const { lineCount } = parsed;

  if (lineCount > 200) {
    return {
      type: 'tip',
      title: 'Consider keeping it concise',
      message: `Your AGENTS.md is ${lineCount} lines. Best practice is ≤150 lines for readability.`,
      suggestion: 'Try focusing on the most critical information agents need. Remove outdated or overly detailed sections.',
      priority: 'medium',
    };
  }

  if (lineCount > 150) {
    return {
      type: 'tip',
      title: 'File is getting long',
      message: `Your AGENTS.md is ${lineCount} lines. Consider trimming to ≤150 lines.`,
      suggestion: 'Focus on essential commands, conventions, and agent-specific context.',
      priority: 'low',
    };
  }

  return null;
}

/**
 * Check if the file is too short
 */
export function checkMinimumContent(parsed: ParsedMarkdown): ValidationSuggestion | null {
  const { lineCount, sections } = parsed;

  if (lineCount < 5) {
    return {
      type: 'tip',
      title: 'Add more context',
      message: 'Your AGENTS.md is quite short. Adding more details will help agents work more effectively.',
      suggestion: 'Consider adding setup commands, testing instructions, and code style guidelines.',
      example: `# AGENTS.md

## Setup
- Install: \`npm install\`
- Start dev: \`npm run dev\`

## Testing
- Run tests: \`npm test\`

## Code style
- Use TypeScript strict mode
- Prefer functional components`,
      priority: 'medium',
    };
  }

  if (sections.length === 0) {
    return {
      type: 'tip',
      title: 'Add section headings',
      message: 'No section headings found. Organize your content with clear headings.',
      suggestion: 'Use ## for main sections like "Setup", "Testing", "Code Style".',
      priority: 'high',
    };
  }

  return null;
}

/**
 * Detect missing common sections
 */
export function checkCommonSections(parsed: ParsedMarkdown): ValidationSuggestion[] {
  const suggestions: ValidationSuggestion[] = [];
  const allText = parsed.sections.map(s => s.title + ' ' + s.content).join(' ');
  const keywords = detectSectionKeywords(allText);

  if (!keywords.hasSetup) {
    suggestions.push({
      type: 'tip',
      title: 'Consider adding setup instructions',
      message: 'No setup or installation section found. Agents work better with clear setup commands.',
      suggestion: 'Add a section with installation and development environment setup.',
      example: `## Setup
- Install dependencies: \`pnpm install\`
- Start dev server: \`pnpm dev\`
- Build: \`pnpm build\``,
      priority: 'high',
    });
  }

  if (!keywords.hasTesting) {
    suggestions.push({
      type: 'tip',
      title: 'Consider adding testing instructions',
      message: 'No testing section found. Test commands help agents verify their changes.',
      suggestion: 'Add a section describing how to run tests and what to check.',
      example: `## Testing
- Run all tests: \`pnpm test\`
- Run specific test: \`pnpm test -- <pattern>\`
- Lint code: \`pnpm lint\``,
      priority: 'medium',
    });
  }

  if (!keywords.hasCodeStyle) {
    suggestions.push({
      type: 'tip',
      title: 'Consider documenting code style',
      message: 'No code style section found. Style guidelines help agents write consistent code.',
      suggestion: 'Add a section with formatting rules, naming conventions, and patterns to follow.',
      example: `## Code style
- TypeScript strict mode enabled
- Use functional components with hooks
- Single quotes, no semicolons
- Prefer named exports`,
      priority: 'low',
    });
  }

  return suggestions;
}

/**
 * Check for command formatting
 */
export function checkCommandFormatting(parsed: ParsedMarkdown, content: string): ValidationSuggestion | null {
  const commands = extractCommands(content);
  const { codeBlocks } = parsed;

  // Check if there are commands in inline code but few code blocks
  if (commands.length > 5 && codeBlocks.length === 0) {
    return {
      type: 'tip',
      title: 'Consider using code blocks',
      message: `Found ${commands.length} commands in inline code. Multi-line commands are easier to read in code blocks.`,
      suggestion: 'Use triple backticks (```) for multi-line commands or command lists.',
      example: `\`\`\`bash
npm install
npm run dev
npm test
\`\`\``,
      priority: 'low',
    };
  }

  return null;
}

/**
 * Check for version specificity
 */
export function checkVersionSpecificity(content: string): ValidationSuggestion | null {
  // Check for common tool names without versions
  const toolPatterns = [
    { name: 'React', pattern: /\bReact\b(?!\s+\d)/ },
    { name: 'Node', pattern: /\bNode(?:\.js)?\b(?!\s+v?\d)/ },
    { name: 'Python', pattern: /\bPython\b(?!\s+\d)/ },
    { name: 'TypeScript', pattern: /\bTypeScript\b(?!\s+\d)/ },
    { name: 'Next.js', pattern: /\bNext(?:\.js)?\b(?!\s+\d)/ },
  ];

  const foundTools = toolPatterns
    .filter(({ pattern }) => pattern.test(content))
    .map(({ name }) => name);

  if (foundTools.length > 0 && !hasVersionSpecificity(content)) {
    return {
      type: 'tip',
      title: 'Be more specific about versions',
      message: `Found ${foundTools.join(', ')} mentioned without version numbers.`,
      suggestion: 'Specify versions to help agents use the right APIs and patterns.',
      example: 'Use "React 18" or "Node.js 20" instead of just "React" or "Node".',
      priority: 'low',
    };
  }

  return null;
}

/**
 * Check markdown structure and readability
 */
export function checkReadability(parsed: ParsedMarkdown): ValidationSuggestion[] {
  const suggestions: ValidationSuggestion[] = [];
  const { headings, sections } = parsed;

  // Check heading hierarchy
  const topLevelHeadings = headings.filter(h => h.level === 1);
  if (topLevelHeadings.length > 1) {
    suggestions.push({
      type: 'info',
      title: 'Multiple top-level headings',
      message: `Found ${topLevelHeadings.length} # headings. AGENTS.md typically uses one # heading as the title.`,
      suggestion: 'Use ## for main sections instead of # to maintain clear hierarchy.',
      priority: 'low',
    });
  }

  // Check for very long sections
  const longSections = sections.filter(s => s.content.split('\n').length > 50);
  if (longSections.length > 0) {
    suggestions.push({
      type: 'tip',
      title: 'Some sections are very long',
      message: `${longSections.length} section(s) have more than 50 lines.`,
      suggestion: 'Consider breaking long sections into subsections or removing verbose details.',
      priority: 'low',
    });
  }

  // Check for sections with no content
  const emptySections = sections.filter(s => s.content.trim().length < 10);
  if (emptySections.length > 0) {
    suggestions.push({
      type: 'tip',
      title: 'Empty sections detected',
      message: `${emptySections.length} section(s) have little or no content.`,
      suggestion: 'Remove empty section headings or add content to make them useful.',
      priority: 'medium',
    });
  }

  return suggestions;
}

/**
 * Provide positive feedback for well-formed files
 */
export function checkWellFormed(parsed: ParsedMarkdown, content: string): ValidationSuggestion | null {
  const { lineCount, sections, codeBlocks } = parsed;
  const allText = sections.map(s => s.title + ' ' + s.content).join(' ');
  const keywords = detectSectionKeywords(allText);

  // Check if file meets good standards
  const hasGoodLength = lineCount >= 10 && lineCount <= 150;
  const hasSections = sections.length >= 3;
  const hasCommands = extractCommands(content).length > 0 || codeBlocks.length > 0;
  const hasKeyTopics = [keywords.hasSetup, keywords.hasTesting, keywords.hasCodeStyle].filter(Boolean).length >= 2;

  if (hasGoodLength && hasSections && hasCommands && hasKeyTopics) {
    return {
      type: 'success',
      title: 'Well-structured AGENTS.md',
      message: 'Your AGENTS.md looks great! It has good structure, clear sections, and helpful commands.',
      suggestion: 'Agents should be able to work effectively with this file.',
      priority: 'high',
    };
  }

  return null;
}
