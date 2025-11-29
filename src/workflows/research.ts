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
  // Strip YAML frontmatter if present
  const frontmatterPattern = /^---\n[\s\S]*?\n---\n?/;
  const contentWithoutFrontmatter = promptContent.replace(frontmatterPattern, '').trimStart();

  const systemMatch = contentWithoutFrontmatter.match(/^\s*system:\s*\n([\s\S]*?)(?=^\s*user:\s*$|$)/m);
  const userMatch = contentWithoutFrontmatter.match(/^\s*user:\s*\n([\s\S]*)/m);

  if (!systemMatch || !userMatch) {
    return null;
  }

  return {
    systemPrompt: systemMatch[1].trim(),
    userPrompt: userMatch[1].trim(),
  };
}

function buildUserPrompt(basePrompt: string, workspaceDir?: string): string {
  if (!workspaceDir) return basePrompt;

  const contextBlock = `## Working Directory Context\n\nYour current working directory is: \`${workspaceDir}\`\n\nAll file operations should be relative to this directory.\n\n---\n\n`;
  return `${contextBlock}${basePrompt}`;
}

/**
 * Main research workflow
 * Executes all configured tasks using Claude Agent SDK
 */
export async function runResearchWorkflow(workspaceDir?: string): Promise<ResearchResult> {
  console.log('🔬 Starting research workflow...\n');

  const agent = new ClaudeAgent({ cwd: workspaceDir });
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
      // Load prompt content
      const promptPath = path.resolve(process.cwd(), promptFile);
      if (!fs.existsSync(promptPath)) {
        console.warn(`⚠️  Prompt file not found: ${promptPath}`);
        continue;
      }

      let promptContent = fs.readFileSync(promptPath, 'utf-8');

      const promptySections = parsePromptyFormat(promptContent);
      const defaultSystemPrompt = `You are an expert researcher specializing in agentic coding and AI development tools. ${taskName === 'html-report' ? 'Generate HTML webpage based on the provided instructions.' : 'Provide detailed, accurate information about the requested topic.'}`;

      const systemPrompt = promptySections?.systemPrompt || defaultSystemPrompt;
      const userPrompt = buildUserPrompt(promptySections?.userPrompt || promptContent, workspaceDir);

      console.log(`   🤖 Executing ${taskName}...`);

      // HTML 任务特殊处理
      if (promptFile.includes('html-report')) {
        const htmlResponse = await agent.run(systemPrompt, userPrompt);
        console.log(`   📄 ${htmlResponse}\n`);
      } else {
        const response = await agent.run(systemPrompt, userPrompt);
        const data = parseAgentResponse<any[]>(response, taskName);

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