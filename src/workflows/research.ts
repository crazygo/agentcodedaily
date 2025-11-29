import { ClaudeAgent } from '../agent/ClaudeAgent';
import * as fs from 'fs';
import * as path from 'path';
import { tasksConfig } from '../config/tasks';
import { ResearchResult } from '../types/index';

/**
 * Parse agent response
 */
function parseAgentResponse<T>(response: string, taskName: string): T {
  try {
    // Try to parse as JSON first
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }

    // If no JSON block, try to parse the whole response
    return JSON.parse(response);
  } catch (error) {
    console.warn(`Warning: Could not parse ${taskName} response as JSON:`, error);
    return [] as T;
  }
}

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
  parsedData?: any[];
}

/**
 * Main research workflow
 * Executes all configured tasks using Claude Agent SDK
 */
export async function runResearchWorkflow(workspaceDir?: string): Promise<ResearchResult> {
  console.log('🔬 Starting research workflow...\n');

  const results: ResearchResult = {
    newProducts: [],
    whitelistUpdates: [],
    insights: [],
    generatedAt: new Date().toISOString()
  };

  // Process each task
  for (const promptFile of tasksConfig.tasks) {
    const taskName = getTaskName(promptFile);
    console.log(`📋 Processing task: ${taskName}`);

    try {
      console.log(`   🤖 Executing ${taskName}...`);

      const { rawResponse, parsedData } = await runSingleTask(promptFile, workspaceDir);

      if (taskName === 'html-report') {
        console.log(`   📄 ${rawResponse}\n`);
      } else {
        const data = parsedData ?? [];

        // Store results based on task type
        if (taskName === 'new-products') {
          results.newProducts = data;
        } else if (taskName === 'whitelist-updates') {
          results.whitelistUpdates = data;
        } else if (taskName === 'insights') {
          results.insights = data;
        }

        console.log(`   ✅ Found ${data.length} items\n`);
      }
    } catch (error: any) {
      console.error(`   ❌ Error processing ${taskName}:`, error.message);
      throw error;
    }
  }

  console.log('✨ Research workflow completed!\n');
  return results;
}

/**
 * Run a single task file with optional workspace context
 */
export async function runSingleTask(promptFile: string, workspaceDir?: string): Promise<SingleTaskResult> {
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

  const agent = new ClaudeAgent({ cwd: workspaceDir });
  const response = await agent.run(systemPrompt, userPrompt);

  if (taskName === 'html-report') {
    return { taskName, rawResponse: response };
  }

  const parsedData = parseAgentResponse<any[]>(response, taskName);
  return { taskName, rawResponse: response, parsedData };
}
