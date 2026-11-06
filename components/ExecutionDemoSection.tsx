import React from "react";
import Section from "@/components/Section";
import CodeExample, { HERO_AGENTS_MD } from "@/components/CodeExample";

export default function ExecutionDemoSection() {
  return (
    <Section
      id="execution-demo"
      title="Making AGENTS.md Executable with AgentMD"
      className="py-12 bg-blue-50 dark:bg-blue-900/20"
      center
      maxWidthClass="max-w-4xl"
    >
      <div className="space-y-8 text-left">
        <div className="text-lg text-gray-700 dark:text-gray-300">
          <p className="mb-4">
            While AGENTS.md provides instructions for AI coding agents, AgentMD brings these instructions to life by making them executable. 
            Instead of just reading commands, AgentMD can automatically execute them in the proper environment.
          </p>
          
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Example AGENTS.md Commands:
            </h3>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <CodeExample code={HERO_AGENTS_MD} compact />
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-blue-600 dark:text-blue-400 font-bold text-lg mb-2">1. Parse</div>
              <p className="text-gray-600 dark:text-gray-400">
                AgentMD reads the AGENTS.md file and identifies executable commands
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-green-600 dark:text-green-400 font-bold text-lg mb-2">2. Validate</div>
              <p className="text-gray-600 dark:text-gray-400">
                Ensures commands are safe and appropriate for execution
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-purple-600 dark:text-purple-400 font-bold text-lg mb-2">3. Execute</div>
              <p className="text-gray-600 dark:text-gray-400">
                Runs the commands in the proper sequence and environment
              </p>
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              With AgentMD Integration:
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Automatic environment setup</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Sequential command execution</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Error handling and rollback</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Logging and audit trails</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}