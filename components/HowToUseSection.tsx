import Section from "@/components/Section";
import React from "react";

export default function HowToUseSection() {
  const steps = [
    {
      title: "Add AGENTS.md",
      body: (
        <>
          Create an AGENTS.md file at the root of the repository. Most
          coding agents can even scaffold one for you if you ask nicely.
        </>
      ),
    },
    {
      title: "Cover what matters",
      body: (
        <>
          <p className="mb-2">Add sections that help an agent work effectively with your project. Popular choices:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Project overview</li>
            <li>Build and test commands</li>
            <li>Code style guidelines</li>
            <li>Testing instructions</li>
            <li>Security considerations</li>
          </ul>
        </>
      ),
    },
    {
      title: "Add extra instructions",
      body: "Commit messages or pull request guidelines, security gotchas, large datasets, deployment steps: anything you’d tell a new teammate belongs here too.",
    },
    {
      title: "Add local instructions with .agents.md",
      body: "Keep personal rules in a sibling .agents.md file. Agents read both files, give priority to .agents.md, and apply the same \"closest file wins\" hierarchy.",
    },
    {
      title: "Large monorepo? Use nested AGENTS.md files for subprojects",
      body: (
        <>
          Place another AGENTS.md inside each package. Agents automatically read the nearest file in the directory tree, so the closest one takes precedence and every subproject can ship tailored instructions. For example, at time of writing the main OpenAI repo has 88 AGENTS.md files.
        </>
      ),
    },
  ];


  return (
    <Section
      title="How to use AGENTS.md?"
      className="py-12"
      center
      maxWidthClass="max-w-3xl"
    >
      <div className="space-y-6 text-left">
        {steps.map((s, idx) => (
          <div key={idx}>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {idx + 1}. {s.title}
            </h3>
            <div className="text-gray-700 dark:text-gray-300">
              {s.body}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
