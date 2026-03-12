import React from 'react';
import { ValidationSuggestion } from '@/lib/validationRules';
import CopyIcon from './icons/CopyIcon';

interface ValidatorResultsProps {
  suggestions: ValidationSuggestion[];
  score: number;
  summary: string;
}

/**
 * Display validation results with suggestions
 */
export default function ValidatorResults({ suggestions, score, summary }: ValidatorResultsProps) {
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const copyExample = async (example: string, index: number) => {
    try {
      await navigator.clipboard.writeText(example);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Determine score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  // Determine score background
  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 dark:bg-green-900/20';
    if (score >= 60) return 'bg-yellow-50 dark:bg-yellow-900/20';
    return 'bg-orange-50 dark:bg-orange-900/20';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Score and summary */}
      <div className={`p-4 rounded-lg mb-4 ${getScoreBg(score)}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Validation Results
          </h3>
          <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
            {score}/100
          </div>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300">{summary}</p>
      </div>

      {/* Suggestions list */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {suggestions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>Paste your AGENTS.md content to see suggestions.</p>
          </div>
        ) : (
          suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900"
            >
              <button
                onClick={() => toggleExpand(index)}
                className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Icon based on type */}
                  <div className="flex-shrink-0 mt-0.5">
                    {suggestion.type === 'success' ? (
                      <svg
                        className="w-5 h-5 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ) : suggestion.type === 'info' ? (
                      <svg
                        className="w-5 h-5 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5 text-yellow-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {suggestion.title}
                      </h4>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          suggestion.priority === 'high'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : suggestion.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {suggestion.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {suggestion.message}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedIndex === index ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Expanded content */}
              {expandedIndex === index && (suggestion.suggestion || suggestion.example) && (
                <div className="px-4 pb-4 pt-0 border-t border-gray-100 dark:border-gray-800">
                  {suggestion.suggestion && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong className="text-gray-900 dark:text-gray-100">Suggestion:</strong>{' '}
                        {suggestion.suggestion}
                      </p>
                    </div>
                  )}
                  {suggestion.example && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Example:
                        </span>
                        <button
                          onClick={() => copyExample(suggestion.example!, index)}
                          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          aria-label="Copy example"
                        >
                          {copiedIndex === index ? (
                            <svg
                              className="w-4 h-4 text-green-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <CopyIcon className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                      <pre className="text-xs bg-gray-50 dark:bg-black p-3 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto">
                        <code className="text-gray-800 dark:text-gray-200">{suggestion.example}</code>
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
