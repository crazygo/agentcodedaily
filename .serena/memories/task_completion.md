# Task Completion Checklist

- Ensure `.env` is populated with `ANTHROPIC_AUTH_TOKEN` (and optional Claude settings) before running workflows.
- Run `yarn build` (or the relevant command) to catch TS compile issues when code changes.
- If changes touch CLI behavior, smoke-test with `yarn update -- --list` (no writes) or against a test workspace.
- Generated `updates/` content is gitignored on main; keep that in mind when verifying or packaging outputs.
- No automated tests/lint configured; manual verification or adding targeted tests may be necessary.
