# Agent Code Daily – Overview

- Purpose: TypeScript CLI that researches agentic-coding products/topics via Claude Agent SDK and writes dated Markdown reports (in `updates/YYYY-MM-DD`); can also combine a workspace’s markdown into an HTML log.
- Stack: Node 18+, TypeScript (ES2022, CommonJS), Yarn (PnP), tsx runtime, Anthropic Claude Agent SDK + yargs, zod, dotenv.
- Layout (key dirs): `src/cli.ts` (entry); `src/workflows` (update/list/research orchestration); `src/agent` (Claude wrapper + prompts); `src/utils` (workspace + formatter helpers); `src/config/tasks.ts` (task config); `prompts/` (templates); `updates/` (generated workspaces; gitignored); `dist/` (build output); `.yarn/`, `.pnp.cjs` (PnP).
- Env: copy `.env.example` → `.env` and set `ANTHROPIC_AUTH_TOKEN` (optional `ANTHROPIC_BASE_URL`, `ANTHROPIC_MODEL`).
- Notes: `updates/` is intentionally gitignored on main; CLI commands create dated subfolders automatically; project currently has no tests or lint config.
