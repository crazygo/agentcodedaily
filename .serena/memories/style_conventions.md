# Coding Conventions

- Language: TypeScript with `strict` on; ES2022 target, CommonJS modules; rootDir `src`, build to `dist`.
- Runtime: Yarn PnP with tsx for running TS directly; prefer `import` syntax with `esModuleInterop` enabled.
- CLI pattern: yargs commands (`update` default, `start [date]`); async/await; console logging for progress/errors.
- File layout: workflows under `src/workflows/`, agent helpers under `src/agent/`, shared utilities under `src/utils/`, prompts in `prompts/`.
- Generated artifacts: `updates/` workspaces and `dist/` build output; both ignored by git (main branch). Avoid committing them unless intentionally publishing elsewhere.
- No ESLint/Prettier config present; follow existing formatting (2-space indent) and add only purposeful comments.
