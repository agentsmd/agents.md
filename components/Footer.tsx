import React from "react";

export default function Footer() {
  return (
    <footer className="px-6 py-12 text-center text-sm text-gray-600 dark:text-gray-400 mt-24 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800">
      <div className="max-w-4xl mx-auto mb-6">
        <nav className="flex justify-center gap-6 flex-wrap">
          <a href="/" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
            Home
          </a>
          <a href="/validator" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
            Validator
          </a>
          <a
            href="https://github.com/agentsmd/agents.md"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            GitHub
          </a>
        </nav>
      </div>
      <p>
        Copyright © AGENTS.md a Series of LF Projects, LLC
        <br />
        For web site terms of use, trademark policy and other project policies please see{" "}
        <a href="https://lfprojects.org" target="_blank" className="underline hover:no-underline">
          https://lfprojects.org
        </a>
        .
      </p>
    </footer>
  );
}
