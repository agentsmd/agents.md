import Section from "@/components/Section";
import React from "react";

export default function HowToUseSection() {
  const steps = [
    {
      title: "Add AGENTS.md",
      body: (
        <>
          Create an AGENTS.md file at the root of the repository. A coding
          agent can draft one for you; review every command and path in it
          before you commit.
        </>
      ),
    },
    {
      title: "Cover what matters",
      body: (
        <>
          <p className="mb-2">Add what an agent cannot work out from the code itself. Popular choices:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Exact build, test and lint commands, and when to run them</li>
            <li>Non-obvious conventions and known traps</li>
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
      title: "Large monorepo? Use nested AGENTS.md files for subprojects",
      body: (
        <>
          Place another AGENTS.md inside each package. Most agents read the files from the repository root down to the package they work in, and the closest one takes precedence when instructions conflict, so every subproject can ship tailored instructions. For example, at time of writing the main OpenAI repo has 88 AGENTS.md files.
        </>
      ),
    },
    {
      title: "Keep it short, and check it against the tree",
      body: (
        <>
          Agents follow specific instructions but gain little from generic
          overviews (
          <a href="https://arxiv.org/abs/2602.11988" className="underline hover:no-underline" target="_blank" rel="noopener noreferrer">evidence</a>),
          and they repeat stale paths and numbers without question. Name the
          exact commands, add one line for each known trap, and re-check the
          file when the code or the model changes.
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
