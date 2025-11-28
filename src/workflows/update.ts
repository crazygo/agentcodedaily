import { getWorkspaceDir, getCurrentDateString } from '../utils/workspace';
import { runResearchWorkflow } from './research';
import { formatAsMarkdown } from '../utils/formatter';
import { ClaudeAgent } from '../agent/ClaudeAgent';
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

    // Normalize result arrays to ensure downstream consumers always see arrays
    result.whitelistUpdates = Array.isArray(result.whitelistUpdates) ? result.whitelistUpdates : [];
    result.newProducts = Array.isArray(result.newProducts) ? result.newProducts : [];
    result.insights = Array.isArray(result.insights) ? result.insights : [];

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

    // Generate/update manifest.json
    await updateManifest();

    // Generate index.html
    await generateIndexPage();

    console.log(`\n✨ Update workflow completed successfully!`);
  } catch (error: any) {
    console.error('\n❌ Error during research workflow:', error.message);
    throw error;
  }
}

/**
 * Update manifest.json with all available days
 */
async function updateManifest(): Promise<void> {
  console.log('\n📋 Updating manifest.json...');
  
  const updatesDir = path.join(process.cwd(), 'updates');
  const manifestPath = path.join(updatesDir, 'manifest.json');
  
  // Scan updates directory for all date folders
  const entries = fs.readdirSync(updatesDir, { withFileTypes: true });
  const days = entries
    .filter(entry => entry.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(entry.name))
    .map(entry => {
      const dayDir = path.join(updatesDir, entry.name);
      const files = fs.readdirSync(dayDir);
      return {
        date: entry.name,
        files: files
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date)); // Sort ascending

  const manifest = {
    days,
    lastUpdated: new Date().toISOString()
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`✅ Manifest updated with ${days.length} days`);
}

/**
 * Generate index.html using Claude Agent
 */
async function generateIndexPage(): Promise<void> {
  console.log('\n📄 Generating index.html...');
  
  const updatesDir = path.join(process.cwd(), 'updates');
  const promptPath = path.join(process.cwd(), 'prompts', 'index-page-prompt.md');
  
  // Read the prompt template
  let promptContent = fs.readFileSync(promptPath, 'utf-8');
  
  // Replace datetime placeholder
  const currentDateTime = new Date().toISOString();
  promptContent = promptContent.replace(/{INSERT_CURRENT_DATETIME}/g, currentDateTime);
  
  // Create agent with updates directory as working directory
  const agent = new ClaudeAgent({ cwd: updatesDir });
  
  const response = await agent.run(
    'You are an expert web developer. Generate the index.html file following the provided instructions.',
    promptContent
  );
  
  console.log(`✅ Index page generated successfully`);
}

/**
 * Public helper: refresh manifest + regenerate index.html
 * Useful for re-running HTML generation without fetching new data
 */
export async function runGenerateIndex(): Promise<void> {
  console.log('🧭 Starting index generation (manifest + index.html)...');
  await updateManifest();
  await generateIndexPage();
  console.log('\n✨ Index generation completed!');
}
