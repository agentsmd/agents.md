import React from 'react';

interface ValidatorInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Textarea component for AGENTS.md input
 */
export default function ValidatorInput({ value, onChange, placeholder }: ValidatorInputProps) {
  const lineCount = value.split('\n').length;
  const charCount = value.length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2 text-sm text-gray-600 dark:text-gray-400">
        <label className="font-medium">Your AGENTS.md content</label>
        <div className="text-xs">
          {lineCount} lines · {charCount} characters
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 w-full p-4 rounded-lg bg-white dark:bg-black text-gray-800 dark:text-gray-100 text-sm font-mono leading-6 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 resize-none shadow-sm"
        spellCheck={false}
      />
    </div>
  );
}
