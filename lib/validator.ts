/**
 * Core validation engine for AGENTS.md files
 */

import { parseMarkdown } from './markdownParser';
import {
  ValidationSuggestion,
  checkLength,
  checkMinimumContent,
  checkCommonSections,
  checkCommandFormatting,
  checkVersionSpecificity,
  checkReadability,
  checkWellFormed,
} from './validationRules';

export interface ValidationResult {
  suggestions: ValidationSuggestion[];
  score: number; // 0-100
  summary: string;
}

/**
 * Main validation function
 */
export function validateAgentsMd(content: string): ValidationResult {
  // Handle empty content
  if (!content || content.trim().length === 0) {
    return {
      suggestions: [
        {
          type: 'tip',
          title: 'Get started with AGENTS.md',
          message: 'Your file is empty. Start by adding a title and basic sections.',
          suggestion: 'Add setup commands, testing instructions, and code style guidelines.',
          example: `# AGENTS.md

## Setup
- Install dependencies: \`npm install\`
- Start dev server: \`npm run dev\`

## Testing
- Run tests: \`npm test\`

## Code style
- Use TypeScript strict mode
- Prefer functional components`,
          priority: 'high',
        },
      ],
      score: 0,
      summary: 'Empty file - add content to get started',
    };
  }

  const parsed = parseMarkdown(content);
  const suggestions: ValidationSuggestion[] = [];

  // Run all validation rules
  const lengthCheck = checkLength(parsed);
  if (lengthCheck) suggestions.push(lengthCheck);

  const minimumContentCheck = checkMinimumContent(parsed);
  if (minimumContentCheck) suggestions.push(minimumContentCheck);

  suggestions.push(...checkCommonSections(parsed));

  const commandCheck = checkCommandFormatting(parsed, content);
  if (commandCheck) suggestions.push(commandCheck);

  const versionCheck = checkVersionSpecificity(content);
  if (versionCheck) suggestions.push(versionCheck);

  suggestions.push(...checkReadability(parsed));

  // Check for well-formed file (positive feedback)
  const wellFormedCheck = checkWellFormed(parsed, content);
  if (wellFormedCheck) suggestions.push(wellFormedCheck);

  // Sort suggestions by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Calculate score
  const score = calculateScore(parsed, suggestions);

  // Generate summary
  const summary = generateSummary(suggestions, score);

  return {
    suggestions,
    score,
    summary,
  };
}

/**
 * Calculate a quality score (0-100)
 */
function calculateScore(parsed: any, suggestions: ValidationSuggestion[]): number {
  let score = 100;

  // Deduct points for issues
  suggestions.forEach((suggestion) => {
    if (suggestion.type === 'success') {
      // Don't deduct for success messages
      return;
    }

    switch (suggestion.priority) {
      case 'high':
        score -= 15;
        break;
      case 'medium':
        score -= 8;
        break;
      case 'low':
        score -= 3;
        break;
    }
  });

  // Minimum score is 0
  score = Math.max(0, score);

  // Bonus points for good structure
  if (parsed.sections.length >= 3) score += 5;
  if (parsed.codeBlocks.length > 0) score += 5;
  if (parsed.lineCount >= 10 && parsed.lineCount <= 150) score += 5;

  // Cap at 100
  return Math.min(100, score);
}

/**
 * Generate a human-readable summary
 */
function generateSummary(suggestions: ValidationSuggestion[], score: number): string {
  const successSuggestions = suggestions.filter(s => s.type === 'success');
  const tipSuggestions = suggestions.filter(s => s.type === 'tip');
  const highPrioritySuggestions = suggestions.filter(s => s.priority === 'high' && s.type !== 'success');

  if (successSuggestions.length > 0) {
    return 'Your AGENTS.md is well-structured and ready to help agents work effectively!';
  }

  if (score >= 80) {
    return 'Your AGENTS.md looks good with just a few suggestions for improvement.';
  }

  if (score >= 60) {
    return 'Your AGENTS.md has good basics but could be improved in a few areas.';
  }

  if (score >= 40) {
    return 'Your AGENTS.md needs some work. Focus on the high-priority suggestions first.';
  }

  if (highPrioritySuggestions.length > 0) {
    return 'Start by addressing the high-priority suggestions to improve your AGENTS.md.';
  }

  return 'Add more content and structure to help agents understand your project.';
}
