import React from "react";
import Section from "@/components/Section";
import CodeExample from "@/components/CodeExample";

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

export default function FAQ() {
  const faqItems: FAQItem[] = [
    {
      question: "Are there required fields?",
      answer:
        "No. AGENTS.md is just standard Markdown. Use any headings you like; the agent simply parses the text you provide.",
    },
    {
      question: "What if instructions conflict?",
      answer:
        "The closest AGENTS.md to the edited file wins; explicit user chat prompts override everything.",
    },
    {
      question: "Will the agent run testing commands found in AGENTS.md automatically?",
      answer:
        "Yes—if you list them. The agent will attempt to execute relevant programmatic checks and fix failures before finishing the task.",
    },
    {
      question: "Can I update it later?",
      answer: "Absolutely. Treat AGENTS.md as living documentation.",
    },
    {
      question: "How do I migrate existing docs to AGENTS.md?",
      answer: (
        <>
          <p className="mb-2">
            Rename existing files to AGENTS.md and create symbolic links for backward compatibility:
          </p>
          <div className="w-full flex justify-center">
            <CodeExample
              code="mv AGENT.md AGENTS.md && ln -s AGENTS.md AGENT.md"
              compact
              heightClass="min-h-[48px]"
              centerVertically
            />
          </div>
        </>
      ),
    },
    {
      question: "How do I configure Aider?",
      answer: (
        <>
          <p className="mb-2">
            Configure Aider to use AGENTS.md in <code>.aider.conf.yml</code>:
          </p>
          <div className="w-full flex justify-center">
            <CodeExample
              code="read: AGENTS.md"
              compact
              heightClass="min-h-[48px]"
              centerVertically
            />
          </div>
        </>
      ),
    },
    {
      question: "How do I configure Gemini CLI?",
      answer: (
        <>
          <p className="mb-2">
            Configure Gemini CLI to use AGENTS.md in <code>.gemini/settings.json</code>:
          </p>
          <div className="w-full flex justify-center">
            <CodeExample
              code='{
  "context": {
    "fileName": "AGENTS.md"
  },
}'
              compact
              heightClass="min-h-[48px]"
              centerVertically
            />
          </div>
        </>
      ),
    },
    {
      question: "Do all agents load AGENTS.md the same way?",
      answer: (
        <>
          <p className="mb-2">
            No. Loading differs between agents and changes between versions, so check the docs for the version you use. Known differences:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1 text-left">
            <li>
              <strong>Claude Code</strong> (v2.1.277+) by default reads AGENTS.md only if there is no <code>CLAUDE.md</code>, <code>.claude/CLAUDE.md</code> or <code>CLAUDE.local.md</code> in the working directory or above it. To use both, put <code>@AGENTS.md</code> in your <code>CLAUDE.md</code> (
              <a href="https://code.claude.com/docs/en/memory#agents-md" className="underline hover:no-underline" target="_blank" rel="noopener noreferrer">docs</a>).
            </li>
            <li>
              <strong>OpenCode</strong> uses only AGENTS.md when both AGENTS.md and <code>CLAUDE.md</code> exist, and does not follow file references inside AGENTS.md; list extra files under <code>instructions</code> in <code>opencode.json</code> (
              <a href="https://opencode.ai/docs/rules/" className="underline hover:no-underline" target="_blank" rel="noopener noreferrer">docs</a>).
            </li>
            <li>
              <strong>Codex</strong> reads at most <code>project_doc_max_bytes</code> (32 KiB by default) of AGENTS.md, counted across all files from the project root to the working directory. Text past the limit is dropped without a visible warning; raise the limit in <code>config.toml</code> or keep the files short.
            </li>
          </ul>
          <p className="mt-2">
            A <code>CLAUDE.md</code> containing <code>@AGENTS.md</code> next to each AGENTS.md works with all three.
          </p>
        </>
      ),
    },
  ];

  return (
    <Section
      id="faq"
      title="FAQ"
      className="py-20"
      center
      maxWidthClass="max-w-3xl"
    >
      <div className="space-y-8 max-w-4xl mx-auto">
        {faqItems.map((item, index) => (
          <div key={index}>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {item.question}
            </h3>
            <div className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {item.answer}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
