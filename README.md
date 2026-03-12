바이브 코딩 시대의 정석: 에이전트용 프롬프트부터 설계하라

이제 바이브 코딩이 기본이라면, 에이전트를 위한 프롬프트 설계가 핵심

실제 코딩 전에 모델에게 먼저 다음 문서를 생성하게 할 것:
README.md: 사람(개발자)을 위한 프로젝트 설명
agents.md: 코딩 에이전트를 위한 작업 규칙·맥락
Claude.md: Claude 전용 가이드(Claude 사용 시)

agents.md 품질을 높이기 위해,
모델에게 참고 레포지토리 분석을 먼저 요청하는 것이 중요

생성된 파일들을 프로젝트 루트 디렉터리에 배치한 뒤
Codex/제미나이/클로드 또는 사용하는 코딩 에이전트를 실행

이렇게 하면 에이전트가 맥락을 정확히 이해한 상태로 코딩을 시작함

https://github.com/agentsmd/agents.md

#VibeCoding

# AGENTS.md

![AGENTS.md logo](./public/og.png)

[AGENTS.md](https://agents.md) is a simple, open format for guiding coding agents.

Think of AGENTS.md as a README for agents: a dedicated, predictable place
to provide context and instructions to help AI coding agents work on your project.

Below is a minimal example of an AGENTS.md file:

```markdown
# Sample AGENTS.md file

## Dev environment tips
- Use `pnpm dlx turbo run where <project_name>` to jump to a package instead of scanning with `ls`.
- Run `pnpm install --filter <project_name>` to add the package to your workspace so Vite, ESLint, and TypeScript can see it.
- Use `pnpm create vite@latest <project_name> -- --template react-ts` to spin up a new React + Vite package with TypeScript checks ready.
- Check the name field inside each package's package.json to confirm the right name—skip the top-level one.

## Testing instructions
- Find the CI plan in the .github/workflows folder.
- Run `pnpm turbo run test --filter <project_name>` to run every check defined for that package.
- From the package root you can just call `pnpm test`. The commit should pass all tests before you merge.
- To focus on one step, add the Vitest pattern: `pnpm vitest run -t "<test name>"`.
- Fix any test or type errors until the whole suite is green.
- After moving files or changing imports, run `pnpm lint --filter <project_name>` to be sure ESLint and TypeScript rules still pass.
- Add or update tests for the code you change, even if nobody asked.

## PR instructions
- Title format: [<project_name>] <Title>
- Always run `pnpm lint` and `pnpm test` before committing.
```

## Website

This repository also includes a basic Next.js website hosted at https://agents.md/
that explains the project’s goals in a simple way, and featuring some examples.

### Running the app locally
1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Start the development server:
   ```bash
   pnpm run dev
   ```
3. Open your browser and go to http://localhost:3000
