# Code Agent Daily

A TypeScript-based product research daily report website focusing on the agentic coding area.

## Live Demo

Explore the generated reports index (latest 7 days): https://youfocal.com/


## Overview

This project automatically discovers and tracks:
1. **New good products** in the agentic coding space
2. **Updates for whitelist products** - following changes to curated tools
3. **Topics about technical insights, ideas, and opinions** from well-known leaders

## Features

The project provides four main CLI commands for managing research reports:

### 1. Auto-dated Update (Default)
```bash
yarn update
```
- Creates a workspace directory at `updates/{YYYY-MM-DD}/` (if it doesn't exist)
- Runs Claude Agent SDK workflow to research and generate reports
- Writes findings to disk in the workspace folder

### 2. Custom Workspace Update
```bash
yarn update -- --workspace /tmp/2025-11-20
```
- Uses the specified directory as workspace root for Claude Agent SDK
- Creates the directory if it doesn't exist
- Generates and saves reports to the custom location

### 3. List Mode (Read-only)
```bash
yarn update -- --list
```
- Runs the research workflow without writing files
- Displays content (title, description) to stdout only
- Useful for previewing what would be generated

### 4. Generate HTML Report
```bash
yarn start [date]
```
- Generates HTML report from workspace markdown files
- Date defaults to today if not specified (YYYY-MM-DD format)
- Combines all markdown files and processes them with Claude Agent SDK
- Outputs to `run.log` in the workspace directory

## Project Structure

```
agentdaily/
├── src/
│   ├── cli.ts              # CLI entry point with argument parsing
│   ├── agent/
│   │   ├── ClaudeAgent.ts  # Claude Agent SDK wrapper
│   │   └── prompts.ts      # Agent prompts configuration
│   ├── config/
│   │   └── tasks.ts        # Research tasks configuration
│   ├── types/
│   │   └── index.ts        # TypeScript type definitions
│   ├── utils/
│   │   ├── workspace.ts    # Workspace directory management
│   │   └── formatter.ts    # Output formatting utilities
│   └── workflows/
│       ├── update.ts       # Main update workflow with Claude Agent SDK
│       ├── list.ts         # List-only workflow (read-only mode)
│       └── research.ts     # Core research workflow orchestration
├── dist/                   # Compiled JavaScript output
├── updates/                # Generated daily reports (YYYY-MM-DD/)
├── prompts/                # Prompt templates for various tasks
├── package.json            # Project configuration
└── tsconfig.json           # TypeScript configuration

```

## Development

### Prerequisites
- Node.js >= 18.0.0
- Yarn package manager

### Setup
```bash
# Install dependencies
yarn install

# Build TypeScript
yarn build

# Watch mode for development
yarn dev

# Clean build artifacts
yarn clean
```

### TypeScript Configuration
- Target: ES2022
- Module: CommonJS
- Strict mode enabled
- Source maps and declarations generated

## Usage Examples

Example index page (static): https://crazygo.github.io/agentdaily/updates/index.html

Last updated: 2025-11-26T16:46:02.361Z

**Daily automated report:**
```bash
# Generates report in updates/2025-11-20/
yarn update
```

**Custom workspace for testing:**
```bash
# Use a specific directory
yarn update -- --workspace /tmp/test-workspace
```

**Preview mode:**
```bash
# See what would be generated without writing files
yarn update -- --list
```

**Generate HTML report:**
```bash
# Generate report for today
yarn start

# Generate report for specific date
yarn start 2025-11-20
```

## Architecture

### Yarn Workspace Setup
This project uses Yarn with workspace support for potential monorepo expansion. The current structure allows for adding packages under `packages/*` in the future.

### Workflow Design
- **Update Workflow**: Integrates with Claude Agent SDK to autonomously research products, track updates, and compile insights
- **List Workflow**: Provides read-only preview functionality for CI/CD validation or dry-runs
- **Research Workflow**: Core orchestration layer that executes configured tasks and aggregates results
- **Workspace Management**: Automatic date-based organization with fallback to custom paths
- **HTML Generation**: Processes markdown reports into formatted HTML output using Claude Agent SDK

## Roadmap

- [x] Integrate Claude Agent SDK for autonomous research
- [x] Add configurable task system for research workflows
- [ ] Add whitelist product configuration
- [ ] Implement leader opinion tracking from Twitter/X, blogs, and forums
- [ ] Add email/Slack notifications for daily reports
- [ ] Create web interface for browsing historical reports
- [ ] Add RSS feed generation
- [ ] Enhance HTML report formatting and styling

## License

MIT
