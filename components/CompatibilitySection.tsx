// File: /components/CompatibilitySection.tsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Section from "@/components/Section";

type AgentEntry = {
  name: string;
  url: string;
  from?: string;
  imageSrc?: string;
  imageSrcLight?: string;
  imageSrcDark?: string;
};

const agents: AgentEntry[] = [
  { name: "Codex", url: "https://openai.com/codex/", from: "OpenAI", imageSrc: "/logos/codex.svg" },
  { name: "Amp", url: "https://ampcode.com", imageSrc: "/logos/amp.svg" },
  { name: "Jules", url: "https://jules.google", from: "Google", imageSrc: "/logos/jules.svg" },
  { name: "Cursor", url: "https://cursor.com", imageSrc: "/logos/cursor.svg" },
  { name: "Factory", url: "https://factory.ai", imageSrc: "/logos/factory.svg" },
  { name: "RooCode", url: "https://roocode.com", imageSrc: "/logos/roocode.svg" },
  {
    name: "Aider",
    url: "https://aider.chat/docs/usage/conventions.html#always-load-conventions",
    imageSrc: "/logos/aider.svg",
  },
  {
    name: "Gemini CLI",
    url: "https://github.com/google-gemini/gemini-cli/blob/main/docs/get-started/configuration.md#available-settings-in-settingsjson",
    from: "Google",
    imageSrc: "/logos/gemini.svg",
  },
  { name: "goose", url: "https://github.com/block/goose", imageSrc: "/logos/goose.svg" },
  { name: "Kilo Code", url: "https://kilocode.ai/", imageSrc: "/logos/kilo-code.svg" },
  { name: "opencode", url: "https://opencode.ai/docs/rules/", imageSrc: "/logos/opencode.svg" },
  { name: "Phoenix", url: "https://phoenix.new/", imageSrc: "/logos/phoenix.svg" },
  { name: "Zed", url: "https://zed.dev/docs/ai/rules", imageSrc: "/logos/zed.svg" },
  { name: "Semgrep", url: "https://semgrep.dev", imageSrc: "/logos/semgrep.svg" },
  {
    name: "Warp",
    url: "https://docs.warp.dev/knowledge-and-collaboration/rules#project-scoped-rules-1",
    imageSrc: "/logos/warp.svg",
  },
  {
    name: "Coding agent",
    from: "GitHub Copilot",
    url: "https://gh.io/coding-agent-docs",
    imageSrc: "/logos/copilot.svg",
  },
  {
    name: "VS Code",
    url: "https://code.visualstudio.com/docs/editor/artificial-intelligence",
    imageSrcLight: "/logos/vscode-light.svg",
    imageSrcDark: "/logos/vscode-dark.svg",
  },
  {
    name: "Ona",
    url: "https://ona.com",
    imageSrcLight: "/logos/ona-light.svg",
    imageSrcDark: "/logos/ona-dark.svg",
  },
  {
    name: "Devin",
    from: "Cognition",
    url: "https://devin.ai",
    imageSrcLight: "/logos/devin-light.svg",
    imageSrcDark: "/logos/devin-dark.svg",
  },
  {
    name: "Windsurf",
    from: "Cognition",
    url: "https://windsurf.com",
    imageSrcLight: "/logos/windsurf-light.svg",
    imageSrcDark: "/logos/windsurf-dark.svg",
  },
  {
    name: "Autopilot & Coded Agents",
    from: "UiPath",
    url: "https://uipath.github.io/uipath-python",
    imageSrc: "/logos/uipath.svg",
  },
];

function shuffleAgents(items: AgentEntry[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

type LogoItemProps = AgentEntry & { variant?: "marquee" | "grid" };

function LogoItem({
  name,
  url,
  from,
  imageSrc,
  imageSrcLight,
  imageSrcDark,
  variant = "marquee",
}: LogoItemProps) {
  const baseClasses =
    variant === "grid"
      ? "flex h-full w-full min-w-0 items-center gap-4"
      : "flex h-20 min-w-[280px] items-center gap-4 pr-10";

  const icon =
    imageSrcLight && imageSrcDark ? (
      <>
        <Image
          src={imageSrcLight}
          alt={`${name} logo`}
          width={64}
          height={64}
          className="block h-16 w-16 dark:hidden"
        />
        <Image
          src={imageSrcDark}
          alt={`${name} logo`}
          width={64}
          height={64}
          className="hidden h-16 w-16 dark:block"
        />
      </>
    ) : imageSrc ? (
      <Image src={imageSrc} alt={`${name} logo`} width={64} height={64} className="h-16 w-16" />
    ) : null;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={baseClasses}>
      <div className="flex h-16 w-16 items-center justify-center">{icon}</div>

      <div className="flex flex-col justify-center text-left">
        <span className="text-xl font-semibold leading-tight text-gray-700 dark:text-gray-300">
          {name}
        </span>

        {from ? (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-light">from</span>{" "}
            <span className="font-semibold">{from}</span>
          </span>
        ) : null}
      </div>
    </a>
  );
}

function LogoMarqueeRow({
  rowAgents,
  isActive,
  duration,
  offset,
}: {
  rowAgents: AgentEntry[];
  isActive: boolean;
  duration: 70 | 80;
  offset?: -35;
}) {
  const doubledAgents = useMemo(() => [...rowAgents, ...rowAgents], [rowAgents]);
  if (doubledAgents.length === 0) return null;

  const durationClass = duration === 70 ? "marqueeDuration70" : "marqueeDuration80";
  const offsetClass = offset === -35 ? "marqueeOffsetNeg35" : "";
  const playClass = isActive ? "logoMarqueeRunning" : "logoMarqueePaused";

  return (
    <div className="w-full overflow-hidden">
      <div
        className={`logoMarqueeTrack ${durationClass} ${offsetClass} ${playClass} flex items-center gap-8 py-3`}
      >
        {doubledAgents.map((agent, index) => (
          <LogoItem key={`${agent.name}-${index}`} {...agent} />
        ))}
      </div>
    </div>
  );
}

export default function CompatibilitySection() {
  const marqueeContainerRef = useRef<HTMLDivElement | null>(null);

  // Shuffle once per mount: stable “random” order for the session.
  const shuffledAgents = useMemo(() => shuffleAgents(agents), []);

  const [isInView, setIsInView] = useState(false);

  // Use <details> as the source of truth (no aria-expanded in JSX).
  const [isOpen, setIsOpen] = useState(false);

  // Derived: when open, marquee pauses.
  const marqueeIsActive = !isOpen && isInView;

  useEffect(() => {
    const node = marqueeContainerRef.current;
    if (!node || isOpen) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(Boolean(entry.isIntersecting && entry.intersectionRatio > 0));
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [isOpen]);

  const [topRow, bottomRow] = useMemo(() => {
    const first: AgentEntry[] = [];
    const second: AgentEntry[] = [];

    shuffledAgents.forEach((agent, index) => {
      if (index % 2 === 0) first.push(agent);
      else second.push(agent);
    });

    return [first, second];
  }, [shuffledAgents]);

  return (
    <Section
      id="compatibility"
      title="One AGENTS.md works across many agents"
      className={`py-12 px-0 ${isOpen ? "" : "!px-0"}`}
      center
      maxWidthClass={isOpen ? "max-w-3xl" : "max-w-none"}
    >
      <div className="mx-auto max-w-3xl text-center">
        <p className="px-8 text-xl font-light text-gray-500 dark:text-gray-400">
          Your agent definitions are compatible with a growing ecosystem of AI coding agents and tools:
        </p>
      </div>

      <details
        className="mt-6"
        open={isOpen}
        onToggle={(e) => setIsOpen((e.currentTarget as HTMLDetailsElement).open)}
      >
        <summary className="mt-4 cursor-pointer list-none text-center text-base font-medium underline hover:no-underline">
          {isOpen ? "Collapse supported agents" : "View all supported agents"}
        </summary>

        <div id="supported-agents" className="mt-6 grid w-full grid-cols-2 gap-8 md:grid-cols-3">
          {agents.map((agent) => (
            <LogoItem key={agent.name} {...agent} variant="grid" />
          ))}
        </div>
      </details>

      {!isOpen ? (
        <div ref={marqueeContainerRef} className="mt-6 flex w-full flex-col gap-6">
          <LogoMarqueeRow rowAgents={topRow} isActive={marqueeIsActive} duration={70} />
          <LogoMarqueeRow rowAgents={bottomRow} isActive={marqueeIsActive} duration={80} offset={-35} />
        </div>
      ) : null}
    </Section>
  );
}
