import React, { useState } from "react";
import Section from "@/components/Section";
import CopyIcon from "./icons/CopyIcon";

interface WizardData {
  projectName: string;
  projectDescription: string;
  packageManager: string;
  installCommand: string;
  devCommand: string;
  buildCommand: string;
  testCommand: string;
  lintCommand: string;
  codeStyle: string[];
  customCodeStyle: string;
  testingInstructions: string;
  prGuidelines: string;
  securityNotes: string;
  additionalNotes: string;
}

const initialData: WizardData = {
  projectName: "",
  projectDescription: "",
  packageManager: "npm",
  installCommand: "",
  devCommand: "",
  buildCommand: "",
  testCommand: "",
  lintCommand: "",
  codeStyle: [],
  customCodeStyle: "",
  testingInstructions: "",
  prGuidelines: "",
  securityNotes: "",
  additionalNotes: "",
};

const packageManagerCommands: Record<string, { install: string; dev: string; build: string; test: string; lint: string }> = {
  npm: { install: "npm install", dev: "npm run dev", build: "npm run build", test: "npm test", lint: "npm run lint" },
  yarn: { install: "yarn install", dev: "yarn dev", build: "yarn build", test: "yarn test", lint: "yarn lint" },
  pnpm: { install: "pnpm install", dev: "pnpm dev", build: "pnpm build", test: "pnpm test", lint: "pnpm lint" },
  bun: { install: "bun install", dev: "bun dev", build: "bun run build", test: "bun test", lint: "bun lint" },
  pip: { install: "pip install -r requirements.txt", dev: "python main.py", build: "", test: "pytest", lint: "ruff check ." },
  poetry: { install: "poetry install", dev: "poetry run python main.py", build: "poetry build", test: "poetry run pytest", lint: "poetry run ruff check ." },
  cargo: { install: "cargo build", dev: "cargo run", build: "cargo build --release", test: "cargo test", lint: "cargo clippy" },
  go: { install: "go mod download", dev: "go run .", build: "go build", test: "go test ./...", lint: "golangci-lint run" },
  other: { install: "", dev: "", build: "", test: "", lint: "" },
};

const codeStyleOptions = [
  { id: "typescript-strict", label: "TypeScript strict mode" },
  { id: "single-quotes", label: "Single quotes" },
  { id: "double-quotes", label: "Double quotes" },
  { id: "no-semicolons", label: "No semicolons" },
  { id: "semicolons", label: "Use semicolons" },
  { id: "functional", label: "Prefer functional patterns" },
  { id: "tabs", label: "Use tabs for indentation" },
  { id: "spaces-2", label: "Use 2 spaces for indentation" },
  { id: "spaces-4", label: "Use 4 spaces for indentation" },
];

export default function GeneratorWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(initialData);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const totalSteps = 4;

  const updateData = (field: keyof WizardData, value: string | string[]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePackageManagerChange = (pm: string) => {
    updateData("packageManager", pm);
    const commands = packageManagerCommands[pm];
    if (commands) {
      updateData("installCommand", commands.install);
      updateData("devCommand", commands.dev);
      updateData("buildCommand", commands.build);
      updateData("testCommand", commands.test);
      updateData("lintCommand", commands.lint);
    }
  };

  const toggleCodeStyle = (styleId: string) => {
    const current = data.codeStyle;
    if (current.includes(styleId)) {
      updateData("codeStyle", current.filter((s) => s !== styleId));
    } else {
      updateData("codeStyle", [...current, styleId]);
    }
  };

  const generateMarkdown = (): string => {
    const lines: string[] = [];

    lines.push("# AGENTS.md");
    lines.push("");

    if (data.projectName || data.projectDescription) {
      lines.push("## Project Overview");
      if (data.projectName) {
        lines.push(`This is the ${data.projectName} project.`);
      }
      if (data.projectDescription) {
        lines.push(data.projectDescription);
      }
      lines.push("");
    }

    const hasCommands = data.installCommand || data.devCommand || data.buildCommand || data.testCommand || data.lintCommand;
    if (hasCommands) {
      lines.push("## Setup Commands");
      if (data.installCommand) lines.push(`- Install dependencies: \`${data.installCommand}\``);
      if (data.devCommand) lines.push(`- Start dev server: \`${data.devCommand}\``);
      if (data.buildCommand) lines.push(`- Build project: \`${data.buildCommand}\``);
      if (data.testCommand) lines.push(`- Run tests: \`${data.testCommand}\``);
      if (data.lintCommand) lines.push(`- Run linter: \`${data.lintCommand}\``);
      lines.push("");
    }

    const hasCodeStyle = data.codeStyle.length > 0 || data.customCodeStyle;
    if (hasCodeStyle) {
      lines.push("## Code Style");
      data.codeStyle.forEach((styleId) => {
        const option = codeStyleOptions.find((o) => o.id === styleId);
        if (option) {
          lines.push(`- ${option.label}`);
        }
      });
      if (data.customCodeStyle) {
        data.customCodeStyle.split("\n").forEach((line) => {
          if (line.trim()) lines.push(`- ${line.trim()}`);
        });
      }
      lines.push("");
    }

    if (data.testingInstructions) {
      lines.push("## Testing Instructions");
      data.testingInstructions.split("\n").forEach((line) => {
        if (line.trim()) lines.push(`- ${line.trim()}`);
      });
      lines.push("");
    }

    if (data.prGuidelines) {
      lines.push("## PR Guidelines");
      data.prGuidelines.split("\n").forEach((line) => {
        if (line.trim()) lines.push(`- ${line.trim()}`);
      });
      lines.push("");
    }

    if (data.securityNotes) {
      lines.push("## Security Considerations");
      data.securityNotes.split("\n").forEach((line) => {
        if (line.trim()) lines.push(`- ${line.trim()}`);
      });
      lines.push("");
    }

    if (data.additionalNotes) {
      lines.push("## Additional Notes");
      lines.push(data.additionalNotes);
      lines.push("");
    }

    return lines.join("\n");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateMarkdown());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  const downloadFile = () => {
    const content = generateMarkdown();
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "AGENTS.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Project Name
        </label>
        <input
          type="text"
          value={data.projectName}
          onChange={(e) => updateData("projectName", e.target.value)}
          placeholder="e.g., My Awesome App"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Project Description (optional)
        </label>
        <textarea
          value={data.projectDescription}
          onChange={(e) => updateData("projectDescription", e.target.value)}
          placeholder="Brief description of what your project does..."
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Package Manager / Build Tool
        </label>
        <select
          value={data.packageManager}
          onChange={(e) => handlePackageManagerChange(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
        >
          <option value="npm">npm (Node.js)</option>
          <option value="yarn">Yarn (Node.js)</option>
          <option value="pnpm">pnpm (Node.js)</option>
          <option value="bun">Bun</option>
          <option value="pip">pip (Python)</option>
          <option value="poetry">Poetry (Python)</option>
          <option value="cargo">Cargo (Rust)</option>
          <option value="go">Go</option>
          <option value="other">Other / Custom</option>
        </select>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Customize the commands for your project. These are pre-filled based on your package manager selection.
      </p>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Install Dependencies
        </label>
        <input
          type="text"
          value={data.installCommand}
          onChange={(e) => updateData("installCommand", e.target.value)}
          placeholder="e.g., npm install"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent font-mono text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Start Dev Server
        </label>
        <input
          type="text"
          value={data.devCommand}
          onChange={(e) => updateData("devCommand", e.target.value)}
          placeholder="e.g., npm run dev"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent font-mono text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Build Project
        </label>
        <input
          type="text"
          value={data.buildCommand}
          onChange={(e) => updateData("buildCommand", e.target.value)}
          placeholder="e.g., npm run build"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent font-mono text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Run Tests
        </label>
        <input
          type="text"
          value={data.testCommand}
          onChange={(e) => updateData("testCommand", e.target.value)}
          placeholder="e.g., npm test"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent font-mono text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Run Linter
        </label>
        <input
          type="text"
          value={data.lintCommand}
          onChange={(e) => updateData("lintCommand", e.target.value)}
          placeholder="e.g., npm run lint"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent font-mono text-sm"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Code Style Preferences
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {codeStyleOptions.map((option) => (
            <label
              key={option.id}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                data.codeStyle.includes(option.id)
                  ? "border-black dark:border-white bg-gray-100 dark:bg-gray-800"
                  : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
            >
              <input
                type="checkbox"
                checked={data.codeStyle.includes(option.id)}
                onChange={() => toggleCodeStyle(option.id)}
                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black dark:focus:ring-white"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Additional Code Style Rules (one per line)
        </label>
        <textarea
          value={data.customCodeStyle}
          onChange={(e) => updateData("customCodeStyle", e.target.value)}
          placeholder="e.g., Use camelCase for variables&#10;Prefer async/await over promises"
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Testing Instructions (one per line)
        </label>
        <textarea
          value={data.testingInstructions}
          onChange={(e) => updateData("testingInstructions", e.target.value)}
          placeholder="e.g., Run unit tests before committing&#10;Ensure all tests pass in CI"
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          PR Guidelines (one per line)
        </label>
        <textarea
          value={data.prGuidelines}
          onChange={(e) => updateData("prGuidelines", e.target.value)}
          placeholder="e.g., Use conventional commit messages&#10;Include tests for new features"
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Security Considerations (one per line)
        </label>
        <textarea
          value={data.securityNotes}
          onChange={(e) => updateData("securityNotes", e.target.value)}
          placeholder="e.g., Never commit secrets or API keys&#10;Use environment variables for sensitive data"
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Additional Notes
        </label>
        <textarea
          value={data.additionalNotes}
          onChange={(e) => updateData("additionalNotes", e.target.value)}
          placeholder="Any other instructions for AI coding agents..."
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
        />
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-4">
      <div className="relative">
        <pre className="rounded-lg bg-white dark:bg-black text-gray-800 dark:text-gray-100 text-xs leading-6 overflow-x-auto p-4 min-h-[300px] max-h-[500px] border border-gray-200 dark:border-gray-700 shadow-sm">
          <code>{generateMarkdown()}</code>
        </pre>
      </div>
      <div className="flex gap-3 justify-center">
        <button
          onClick={copyToClipboard}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-black text-white dark:bg-white dark:text-black text-sm font-medium hover:opacity-80"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <CopyIcon className="w-4 h-4" />
              Copy to Clipboard
            </>
          )}
        </button>
        <button
          onClick={downloadFile}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download AGENTS.md
        </button>
      </div>
    </div>
  );

  const stepTitles = [
    "Project Info",
    "Setup Commands",
    "Code Style",
    "Guidelines",
  ];

  return (
    <Section
      id="generator"
      title="Generate Your AGENTS.md"
      className="py-20 bg-gray-50 dark:bg-gray-900/40"
      center
      maxWidthClass="max-w-3xl"
    >
      <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
        Answer a few questions to create a customized AGENTS.md file for your project.
      </p>

      {!showPreview ? (
        <>
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {stepTitles.map((title, idx) => (
              <React.Fragment key={idx}>
                <button
                  onClick={() => setStep(idx + 1)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                    step === idx + 1
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : step > idx + 1
                      ? "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white/20 dark:bg-black/20 text-xs">
                    {idx + 1}
                  </span>
                  <span className="hidden sm:inline">{title}</span>
                </button>
                {idx < stepTitles.length - 1 && (
                  <div className={`w-8 h-0.5 ${step > idx + 1 ? "bg-gray-400" : "bg-gray-200 dark:bg-gray-700"}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                step === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Back
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPreview(true)}
                className="px-5 py-2.5 rounded-full border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Preview
              </button>
              {step < totalSteps ? (
                <button
                  onClick={() => setStep((s) => Math.min(totalSteps, s + 1))}
                  className="px-5 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-sm font-medium hover:opacity-80"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={() => setShowPreview(true)}
                  className="px-5 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-sm font-medium hover:opacity-80"
                >
                  Generate
                </button>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {renderPreview()}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setShowPreview(false)}
              className="px-5 py-2.5 rounded-full border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Back to Editor
            </button>
          </div>
        </>
      )}
    </Section>
  );
}
