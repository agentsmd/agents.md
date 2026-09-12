import Section from "@/components/Section";

const ToolingSection = () => (
  <Section title="Tooling" className="pb-0" center maxWidthClass="max-w-3xl">
    <p className="max-w-3xl">Utilities for working with AGENTS.md files:</p>

    <p className="max-w-3xl mt-4">
      <a
        href="https://github.com/zackabrah/scopeglass"
        className="underline hover:no-underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        Scopeglass
      </a>{" "}
      &mdash; local CLI that shows the effective AGENTS.md chain for any path:
      precedence order, line-level provenance, context-size estimates, and
      checks for broken references, duplicates, and conflicting guidance.
      Includes a CI gate (<code>scopeglass check</code>).
    </p>
  </Section>
);

export default ToolingSection;
