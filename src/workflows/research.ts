import * as fs from 'fs';
import * as path from 'path';
import { ClaudeAgent } from '../agent/ClaudeAgent';
import { getSystemPrompt } from '../agent/prompts';
import { ResearchResult, TasksConfig } from '../types';

/**
 * Load tasks configuration
 */
function loadTasksConfig(): TasksConfig {
  const configPath = path.resolve(process.cwd(), 'config/tasks.json');
  const configData = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(configData);
}

/**
 * Load prompt from file and replace placeholders
 */
function loadPrompt(promptFile: string): string {
  const promptPath = path.resolve(process.cwd(), promptFile);
  let prompt = fs.readFileSync(promptPath, 'utf-8');

  // Replace current date placeholder
  const date = new Date().toISOString().split('T')[0];
  prompt = prompt.replace(/{INSERT_CURRENT_DATE}/g, date);

  return prompt;
}

/**
 * Parse JSON from agent response, handling markdown code blocks and empty responses
 */
function parseAgentResponse<T>(response: string, taskName: string = 'task'): T {
  // Handle empty or very short responses
  if (!response || response.trim().length < 10) {
    console.log(`   ⚠️  Empty or very short response for ${taskName}, returning empty array`);
    return [] as T;
  }

  try {
    // Try direct parse first
    return JSON.parse(response);
  } catch {
    // Try to extract JSON from markdown code block
    const jsonMatch = response.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch {
        console.log(`   ⚠️  Found code block but JSON parsing failed for ${taskName}`);
      }
    }

    // Try to find JSON array in the text
    const arrayMatch = response.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]);
      } catch {
        console.log(`   ⚠️  Found array-like structure but JSON parsing failed for ${taskName}`);
      }
    }

    // Try to find JSON object in the text
    const objectMatch = response.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch {
        console.log(`   ⚠️  Found object-like structure but JSON parsing failed for ${taskName}`);
      }
    }

    // If all parsing attempts fail, return empty array
    console.log(`   ℹ️  Could not parse JSON from ${taskName} response, returning empty array`);
    console.log(`   ℹ️  Response appears to be plain text (length: ${response.length} chars)`);
    return [] as T;
  }
}

/**
 * Run comprehensive research workflow
 */
export async function runResearchWorkflow(): Promise<ResearchResult> {
  console.log('\n🔬 Starting research workflow...\n');

  const tasksConfig = loadTasksConfig();
  const agent = new ClaudeAgent();
  const systemPrompt = getSystemPrompt();

  const results: any[] = [];

  // Execute each task
  for (let i = 0; i < tasksConfig.tasks.length; i++) {
    const promptFile = tasksConfig.tasks[i];
    const taskName = `Task ${i + 1}`;

    console.log(`📋 ${taskName}: ${promptFile}`);

    try {
      const prompt = loadPrompt(promptFile);
      const response = await agent.run(systemPrompt, prompt);
      const data = parseAgentResponse<any[]>(response, taskName);

      results.push(data);
      console.log(`   ✅ Found ${data.length} items\n`);
    } catch (error) {
      console.error(`   ❌ Error executing ${taskName}:`, error);
      results.push([]);
    }
  }

  return {
    newProducts: results[0] || [],
    whitelistUpdates: results[1] || [],
    insights: results[2] || [],
    generatedAt: new Date().toISOString(),
  };
}
