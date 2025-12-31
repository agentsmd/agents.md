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
  {
    name: "Codex",
    url: "https://openai.com/codex/",
    from: "OpenAI",
    imageSrc: "/logos/codex.svg",
  },
  {
    name: "Amp",
    url: "https://ampcode.com",
    imageSrc: "/logos/amp.svg",
  },
  {
    name: "Jules",
    url: "https://jules.google",
    from: "Google",
    imageSrc: "/logos/jules.svg",
  },
  {
    name: "Cursor",
    url: "https://cursor.com",
    imageSrc: "/logos/cursor.svg",
  },
  {
    name: "Factory",
    url: "https://factory.ai",
    imageSrc: "/logos/factory.svg",
  },
  {
    name: "RooCode",
    url: "https://roocode.com",
    imageSrc: "/logos/roocode.svg",
  },
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
  {
    name: "goose",
    url: "https://github.com/block/goose",
    imageSrc: "/logos/goose.svg",
  },
  {
    name: "Kilo Code",
    url: "https://kilocode.ai/",
    imageSrc: "/logos/kilo-code.svg",
  },
  {
    name: "opencode",
    url: "https://opencode.ai/docs/rules/",
    imageSrc: "/logos/opencode.svg",
  },
  {
    name: "Phoenix",
    url: "https://phoenix.new/",
    imageSrc: "/logos/phoenix.svg",
  },
  {
    name: "Zed",
    url: "https://zed.dev/docs/ai/rules",
    imageSrc: "/logos/zed.svg",
  },
  {
    name: "Semgrep",
    url: "https://semgrep.dev",
    imageSrc: "/logos/semgrep.svg",
  },
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
  {
    name: "Shakespeare",
    url: "https://shakespeare.diy",
    imageSrc: "/logos/shakespeare.svg",
  },
];

const shuffleAgents = (items: AgentEntry[]) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

type LogoItemProps = AgentEntry & {
  variant?: "marquee" | "grid";
};

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

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={baseClasses}
    >
      <div className="flex h-16 w-16 items-center justify-center">
        {imageSrcLight && imageSrcDark ? (
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
          <span
            aria-hidden
            className="block h-16 w-16 bg-gray-700 dark:bg-gray-400"
            style={{
              WebkitMaskImage: `url(${imageSrc})`,
              maskImage: `url(${imageSrc})`,
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskPosition: "center",
              maskPosition: "center",
            }}
          />
        ) : null}
      </div>
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
  agents,
  isActive,
  duration,
  offset,
}: {
  agents: AgentEntry[];
  isActive: boolean;
  duration: number;
  offset?: number;
}) {
  const doubledAgents = useMemo(() => [...agents, ...agents], [agents]);

  if (doubledAgents.length === 0) {
    return null;
  }

  const trackStyle = {
    animationPlayState: isActive ? "running" : "paused",
    animationDelay: offset ? `${offset}s` : undefined,
    "--marquee-duration": `${duration}s`,
  } as React.CSSProperties;

  return (
    <div className="w-full overflow-hidden">
      <div
        className="logo-marquee-track flex items-center gap-8 py-3"
        style={trackStyle}
      >
        {doubledAgents.map((agent, index) => (
          <LogoItem key={`${agent.name}-${index}`} {...agent} />
        ))}
      </div>
    </div>
  );
}

export default function CompatibilitySection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [shuffledAgents, setShuffledAgents] = useState<AgentEntry[]>(agents);
  const [showGrid, setShowGrid] = useState(false);

  useEffect(() => {
    setShuffledAgents(shuffleAgents(agents));
  }, []);

  useEffect(() => {
    if (showGrid) {
      setIsInView(false);
      return;
    }

    const node = containerRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting && entry.intersectionRatio > 0);
      },
      {
        threshold: 0,
      }
    );

    observer.observe(node);

    if (typeof window !== "undefined") {
      const rect = node.getBoundingClientRect();
      const isVisible =
        rect.bottom >= 0 &&
        rect.right >= 0 &&
        rect.left <= window.innerWidth &&
        rect.top <= window.innerHeight;
      setIsInView(isVisible);
    }

    return () => {
      observer.disconnect();
    };
  }, [showGrid]);

  const [topRow, bottomRow] = useMemo(() => {
    const first: AgentEntry[] = [];
    const second: AgentEntry[] = [];

    shuffledAgents.forEach((agent, index) => {
      if (index % 2 === 0) {
        first.push(agent);
      } else {
        second.push(agent);
      }
    });

    return [first, second];
  }, [shuffledAgents]);

  return (
    <Section
      id="compatibility"
      title="One AGENTS.md works across many agents"
      className={`py-12 px-0 ${showGrid ? "" : "!px-0"}`}
      center
      maxWidthClass={showGrid ? "max-w-3xl" : "max-w-none"}
    >
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xl font-light text-gray-500 dark:text-gray-400 px-8">
          Your agent definitions are compatible with a growing ecosystem of AI
          coding agents and tools:
        </p>
      </div>
      {showGrid ? (
        <div
          id="supported-agents"
          className="mt-6 grid w-full grid-cols-2 gap-8 md:grid-cols-3"
        >
          {agents.map((agent) => (
            <LogoItem key={agent.name} {...agent} variant="grid" />
          ))}
        </div>
      ) : (
        <div
          ref={containerRef}
          className="mt-6 flex w-full flex-col gap-6"
          id="supported-agents"
        >
          <LogoMarqueeRow agents={topRow} isActive={isInView} duration={70} />
          <LogoMarqueeRow
            agents={bottomRow}
            isActive={isInView}
            duration={80}
            offset={-35}
          />
        </div>
      )}
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => setShowGrid((prev) => !prev)}
          className="mt-4 text-base font-medium underline hover:no-underline cursor-pointer"
          aria-controls="supported-agents"
          aria-expanded={showGrid}
        >
          {showGrid ? "Collapse supported agents" : "View all supported agents"}
        </button>
      </div>
    </Section>
  );
}
