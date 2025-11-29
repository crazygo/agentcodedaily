import { ClaudeAgent } from '../agent/ClaudeAgent';
import * as fs from 'fs';
import * as path from 'path';
import { tasksConfig } from '../config/tasks';
import { ResearchResult } from '../types/index';

/**
 * Get task name from file path
 */
function getTaskName(promptFile: string): string {
  const ext = path.extname(promptFile);
  const fileName = path.basename(promptFile, ext);
  return fileName.replace(/-prompt$/, '');
}

interface PromptySections {
  systemPrompt: string;
  userPrompt: string;
}

/**
 * Minimal prompty format parser (frontmatter + system/user blocks)
 */
function parsePromptyFormat(promptContent: string): PromptySections | null {
  // Strip YAML frontmatter if present (support LF or CRLF)
  const frontmatterPattern = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;
  const contentWithoutFrontmatter = promptContent.replace(frontmatterPattern, '').trimStart();

  // Find explicit system/user markers
  const systemHeaderMatch = contentWithoutFrontmatter.match(/^\s*system:\s*$/m);
  const userHeaderMatch = contentWithoutFrontmatter.match(/^\s*user:\s*$/m);

  if (!systemHeaderMatch || !userHeaderMatch) return null;
  if (userHeaderMatch.index !== undefined && systemHeaderMatch.index !== undefined && userHeaderMatch.index < systemHeaderMatch.index) {
    return null;
  }

  const systemStart = (systemHeaderMatch.index ?? 0) + systemHeaderMatch[0].length;
  const userStart = (userHeaderMatch.index ?? 0) + userHeaderMatch[0].length;

  const systemText = contentWithoutFrontmatter.slice(systemStart, userHeaderMatch.index).trim();
  const userText = contentWithoutFrontmatter.slice(userStart).trim();

  return {
    systemPrompt: systemText,
    userPrompt: userText,
  };
}

function buildUserPrompt(basePrompt: string, workspaceDir?: string): string {
  if (!workspaceDir) return basePrompt;

  const contextBlock = `## Working Directory Context\n\nYour current working directory is: \`${workspaceDir}\`\n\nAll file operations should be relative to this directory.\n\n---\n\n`;
  return `${contextBlock}${basePrompt}`;
}

export interface SingleTaskResult {
  taskName: string;
  rawResponse: string;
  logFilePath?: string;
}

/**
 * Main research workflow
 * Executes all configured tasks using Claude Agent SDK
 */
export async function runResearchWorkflow(workspaceDir?: string): Promise<ResearchResult> {
  console.log('🔬 Starting research workflow...\n');

  const now = new Date();
  const ts = now.toISOString().replace(/[:.]/g, '-'); // e.g., 2025-11-29T23-42-31-123Z
  const tsPrefix = ts.split('T').join('-').replace(/Z$/, ''); // e.g., 2025-11-29-23-42-31-123

  const results: ResearchResult = {
    newProducts: [],
    whitelistUpdates: [],
    insights: [],
    generatedAt: new Date().toISOString()
  };
  const runLogs: { taskName: string; logFilePath?: string; lastAssistantMessageLength: number }[] = [];

  // Process each task
  for (const promptFile of tasksConfig.tasks) {
    const taskName = getTaskName(promptFile);
    console.log(`📋 Processing task: ${taskName}`);

    try {
      console.log(`   🤖 Executing ${taskName}...`);

      const { rawResponse, logFilePath } = await runSingleTask(promptFile, workspaceDir, tsPrefix);

      if (taskName === 'html-report') {
        console.log(`   📄 ${rawResponse}\n`);
      } else {
        console.log(`   📝 Log for ${taskName}: ${logFilePath}`);
        console.log(`   📄 Last assistant message length: ${rawResponse.length}\n`);
      }

      runLogs.push({
        taskName,
        logFilePath,
        lastAssistantMessageLength: rawResponse.length,
      });
    } catch (error: any) {
      console.error(`   ❌ Error processing ${taskName}:`, error.message);
      throw error;
    }
  }

  // Write run log summary so logs are discoverable even after console is gone
  const summaryPath = path.join(workspaceDir || process.cwd(), `${tsPrefix}-run-logs.json`);
  fs.writeFileSync(summaryPath, JSON.stringify(runLogs, null, 2), 'utf-8');
  console.log(`🗂️  Run log summary written to: ${summaryPath}`);

  console.log('✨ Research workflow completed!\n');
  return results;
}

/**
 * Run a single task file with optional workspace context
 */
export async function runSingleTask(
  promptFile: string,
  workspaceDir?: string,
  tsPrefix?: string
): Promise<SingleTaskResult> {
  const taskName = getTaskName(promptFile);
  const promptPath = path.resolve(process.cwd(), promptFile);

  if (!fs.existsSync(promptPath)) {
    throw new Error(`Prompt file not found: ${promptPath}`);
  }

  let promptContent = fs.readFileSync(promptPath, 'utf-8');

  const promptySections = parsePromptyFormat(promptContent);
  const defaultSystemPrompt = `You are an expert researcher specializing in agentic coding and AI development tools. ${taskName === 'html-report' ? 'Generate HTML webpage based on the provided instructions.' : 'Provide detailed, accurate information about the requested topic.'}`;

  const systemPrompt = promptySections?.systemPrompt || defaultSystemPrompt;
  const userPrompt = buildUserPrompt(promptySections?.userPrompt || promptContent, workspaceDir);

  const prefix = tsPrefix || new Date().toISOString().replace(/[:.]/g, '-').split('T').join('-').replace(/Z$/, '');
  const logBase = promptFile.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'task';
  const logFilePath = path.join(workspaceDir || process.cwd(), `${prefix}-${logBase}.log`);

  const agent = new ClaudeAgent({ cwd: workspaceDir });
  const response = await agent.run(systemPrompt, userPrompt, { logFilePath });
  console.log(`📝 Task ${taskName} log written to: ${logFilePath}`);

  if (taskName === 'html-report') {
    return { taskName, rawResponse: response, logFilePath };
  }

  return { taskName, rawResponse: response, logFilePath };
}
