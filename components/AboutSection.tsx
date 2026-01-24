import Section from "@/components/Section";

const AboutSection = () => (
  <Section title="About" className="pb-0" center maxWidthClass="max-w-3xl">
    <p className="max-w-3xl">
      AGENTS.md emerged from collaborative efforts across the AI software
      development ecosystem, including{" "}
      <a href="https://openai.com/codex/" className="underline hover:no-underline" target="_blank" rel="noopener noreferrer">OpenAI Codex</a>,{" "}
      <a href="https://ampcode.com" className="underline hover:no-underline" target="_blank" rel="noopener noreferrer">Amp</a>,{" "}
      <a href="https://jules.google" className="underline hover:no-underline" target="_blank" rel="noopener noreferrer">Jules from Google</a>,{" "}
      <a href="https://cursor.com" className="underline hover:no-underline" target="_blank" rel="noopener noreferrer">Cursor</a>, and{" "}
      <a href="https://factory.ai" className="underline hover:no-underline" target="_blank" rel="noopener noreferrer">Factory</a>.
    </p>

    <p className="max-w-3xl mt-4">
      We&rsquo;re committed to helping maintain and evolve this as an open format that benefits the entire developer community,
      regardless of which coding agent you use.
    </p>

    <p className="max-w-3xl mt-4">
      AGENTS.md is now stewarded by the{" "}
      <a href="https://aaif.io" className="underline hover:no-underline">
        Agentic AI Foundation
      </a>{" "}
      under the Linux Foundation.{" "}
      <a
        href="https://openai.com/index/agentic-ai-foundation/"
        className="underline hover:no-underline"
      >
        Learn more &rarr;
      </a>
    </p>

  </Section>
);

export default AboutSection;
