#!/usr/bin/env node

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import * as fs from 'fs/promises';
import * as path from 'path';
import { runUpdate, runGenerateIndex } from './workflows/update';
import { runList } from './workflows/list';
import { ClaudeAgent } from './agent/ClaudeAgent';
import { getWorkspaceDir, getCurrentDateString } from './utils/workspace';

async function main() {
  await yargs(hideBin(process.argv))
    .command('$0', 'Run product research daily report updates', (yargs) => {
      return yargs
        .option('workspace', {
          type: 'string',
          description: 'Workspace directory for Claude Agent SDK',
        })
        .option('list', {
          type: 'boolean',
          description: 'List mode - only echo content without writing files',
          default: false,
        });
    }, async (args) => {
      if (args.list) {
        await runList();
      } else {
        await runUpdate(args.workspace);
      }
    })
    .command('start [date]', 'Generate HTML report from workspace markdown files', (yargs) => {
      return yargs
        .positional('date', {
          type: 'string',
          description: 'Date for workspace (YYYY-MM-DD format, defaults to today)',
        })
        .option('outputFile', {
          type: 'string',
          description: 'Output log file name (optional, defaults to run.log)',
        });
    }, async (args) => {
      try {
        // Use provided date or today's date
        const targetDate = args.date || getCurrentDateString();
        const workspaceDir = path.resolve(process.cwd(), 'updates', targetDate);
        console.log(`📂 Using workspace: ${workspaceDir}`);

        // Check if workspace exists
        try {
          await fs.access(workspaceDir);
        } catch {
          throw new Error(`Workspace not found: ${workspaceDir}. Please run 'yarn update' first or specify a valid date.`);
        }

        // Find all markdown files in the workspace
        const files = await fs.readdir(workspaceDir);
        const markdownFiles = files.filter(file => file.endsWith('.md'));

        if (markdownFiles.length === 0) {
          throw new Error(`No markdown files found in workspace: ${workspaceDir}`);
        }

        console.log(`📄 Found ${markdownFiles.length} markdown files: ${markdownFiles.join(', ')}`);

        // Combine all markdown content
        let combinedMarkdown = '';
        for (const file of markdownFiles) {
          const filePath = path.join(workspaceDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          combinedMarkdown += `\n\n${content}\n\n---\n`;
        }

        const outputFileName = args.outputFile || 'run.log';
        const resolvedOutputPath = path.join(workspaceDir, outputFileName);
        console.log(`🎯 Generating log: ${resolvedOutputPath}`);

        // Load HTML prompt
        const promptPath = path.join(process.cwd(), 'prompts', 'html-report-prompt.md');
        let promptContent = await fs.readFile(promptPath, 'utf-8');

        // Replace date placeholder
        promptContent = promptContent.replace(/{INSERT_CURRENT_DATE}/g, targetDate);

        // Add workspace directory context
        const fullPrompt = `## Working Directory Context\n\nYour current working directory is: \`${workspaceDir}\`\n\nAll file operations should be relative to this directory.\n\n---\n\n${promptContent}\n\n## Input Markdown Data\n\n${combinedMarkdown}`;

        console.log('🤖 Processing with Claude Agent SDK...');

        // Pass workspace directory to agent
        const agent = new ClaudeAgent({ cwd: workspaceDir });
        const response = await agent.run('You are an expert web developer. Generate HTML based on the provided instructions.', fullPrompt);

        // Extract HTML from response (Claude Agent SDK should handle this properly)
        let htmlContent = response;
        const htmlMatch = htmlContent.match(/```html\n([\s\S]*?)\n```/);
        if (htmlMatch) {
          htmlContent = htmlMatch[1];
        }

        // Write to run.log instead of HTML file
        const logContent = `=== HTML Generation Log ${new Date().toISOString()} ===\n\n${response}\n\n=== HTML Content ===\n\n${htmlContent}`;
        await fs.writeFile(resolvedOutputPath, logContent, 'utf-8');

        const outputStats = await fs.stat(resolvedOutputPath);
        const fileSizeKB = Math.round(outputStats.size / 1024);
        console.log(`✅ Log generated: ${resolvedOutputPath}`);
        console.log(`📊 File size: ${fileSizeKB} KB`);
      } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
      }
    })
    .command('index', 'Regenerate updates/index.html from existing manifest and data files', (yargs) => yargs, async () => {
      try {
        await runGenerateIndex();
      } catch (error) {
        console.error('❌ Error:', (error as Error).message);
        process.exit(1);
      }
    })
    .help()
    .version('1.0.0')
    .parse();
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
