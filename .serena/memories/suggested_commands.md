# Suggested Commands

- Install deps (Yarn PnP): `yarn install`
- Run default update workflow (auto-dated workspace under `updates/`): `yarn update`
- Update into custom workspace: `yarn update -- --workspace /path/to/dir`
- Preview (no writes): `yarn update -- --list`
- Generate HTML log from workspace markdowns (date optional, defaults to today): `yarn start [YYYY-MM-DD]`
- Build TypeScript → `dist/`: `yarn build`
- Watch build: `yarn dev`
- Clean build artifacts: `yarn clean`
