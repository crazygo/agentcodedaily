import { getWorkspaceDir } from '../utils/workspace';
import { runResearchWorkflow } from './research';
import { formatAsMarkdown } from '../utils/formatter';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Main update workflow
 * Uses Claude Agent SDK to research products and write reports
 */
export async function runUpdate(workspacePath?: string): Promise<void> {
  console.log('🚀 Starting product research update workflow...\n');

  const workspace = getWorkspaceDir(workspacePath);
  console.log(`📁 Workspace: ${workspace}\n`);

  try {
    // Run the research workflow with workspace directory
    const result = await runResearchWorkflow(workspace);

    // Save results to files
    const reportPath = path.join(workspace, 'report.md');
    const jsonPath = path.join(workspace, 'data.json');

    // Write markdown report
    const markdown = formatAsMarkdown(result);
    fs.writeFileSync(reportPath, markdown, 'utf-8');
    console.log(`\n✅ Markdown report written to: ${reportPath}`);

    // Write JSON data
    fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`✅ JSON data written to: ${jsonPath}`);

    console.log(`\n✨ Update workflow completed successfully!`);
  } catch (error: any) {
    console.error('\n❌ Error during research workflow:', error.message);
    throw error;
  }
}
