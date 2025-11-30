import { query } from '@anthropic-ai/claude-agent-sdk';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

export interface AgentConfig {
  model?: string;
  maxTurns?: number;
  cwd?: string;
}

export class ClaudeAgent {
  private config: AgentConfig;

  constructor(config?: Partial<AgentConfig>) {
    this.config = {
      model: config?.model || process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
      maxTurns: config?.maxTurns || 100,
      cwd: config?.cwd,
    };
  }

  /**
   * Run the agent with a prompt using the query() method
   * External MCP tools will be used if configured
   */
  async run(systemPrompt: string, userPrompt: string, options?: { logFilePath?: string }): Promise<string> {
    try {
      let lastAssistantText = '';
      let messageCount = 0;

      console.log('🤖 Starting Claude Agent SDK query...');
      console.log(`📋 System Prompt: ${systemPrompt.substring(0, 100)}...`);
      console.log(`💬 User Prompt: ${userPrompt.substring(0, 100)}...`);
      console.log(`⚙️  Max Turns: ${this.config.maxTurns}`);
      console.log('');

      // Use the query() method from Agent SDK
      // External MCP servers configured below
      // Explicitly pass environment variables to ensure they're available in CI
      const authToken = process.env.ANTHROPIC_AUTH_TOKEN;
      const baseUrl = process.env.ANTHROPIC_BASE_URL;

      // Debug: Log environment variable status (without exposing the key)
      console.log('🔍 Environment check:');
      console.log(`   ANTHROPIC_AUTH_TOKEN: ${authToken ? `✅ Set (length: ${authToken.length})` : '❌ Not set'}`);
      console.log(`   ANTHROPIC_BASE_URL: ${baseUrl ? `✅ Set (${baseUrl})` : 'ℹ️  Not set (optional)'}`);
      console.log('');

      const workingDir = this.config.cwd || process.cwd();
      console.log(`📂 Agent working directory: ${workingDir}`);
      console.log('');

      if (!authToken) {
        throw new Error('ANTHROPIC_AUTH_TOKEN environment variable is required');
      }

      const logFilePath = options?.logFilePath;
      if (logFilePath) {
        fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
        fs.writeFileSync(logFilePath, '', 'utf-8');
        console.log(`📝 Logging conversation to: ${logFilePath}`);
        fs.appendFileSync(logFilePath, `[system]\n${systemPrompt}\n\n`, 'utf-8');
        fs.appendFileSync(logFilePath, `[user]\n${userPrompt}\n\n`, 'utf-8');
      }

      for await (const message of query({
        prompt: userPrompt,
        options: {
          systemPrompt,
          maxTurns: this.config.maxTurns,
          permissionMode: 'bypassPermissions', // Skip permission prompts
          cwd: workingDir, // Set working directory
          // Explicitly pass environment variables to SDK
          env: {
            ...process.env,
            ANTHROPIC_API_KEY: '', // Fixed to empty string
            ANTHROPIC_AUTH_TOKEN: authToken,
            ...(baseUrl && { ANTHROPIC_BASE_URL: baseUrl }),
          },
          mcpServers: {
            // 'web-search-prime': {
            //   type: 'http',
            //   url: 'https://open.bigmodel.cn/api/mcp/web_search_prime/mcp',
            //   headers: {
            //     'Authorization': `Bearer ${authToken}`,
            //   },
            // },
          },
          // Disable WebSearch tool, keep all other tools enabled
          // disallowedTools: ['WebSearch'],
        },
      })) {
        messageCount++;
        console.log(`\n[${messageCount}] 📨 Message type: ${message.type}`);

        // Handle different message types
        if (message.type === 'assistant') {
          // Extract content from the nested message structure
          const messageObj = (message as any).message;
          const content = messageObj?.content;

          if (Array.isArray(content)) {
            let assistantText = '';
            for (const block of content) {
              if (block.type === 'text') {
                assistantText += block.text;
                console.log(`    💭 Text: ${block.text}`);
              } else if (block.type === 'tool_use') {
                console.log(`    🔧 Tool use: ${block.name}`, JSON.stringify(block.input, null, 2));
                if (logFilePath) {
                  fs.appendFileSync(
                    logFilePath,
                    `[assistant tool_use #${messageCount}] ${block.name}\n${JSON.stringify(block.input, null, 2)}\n\n`,
                    'utf-8'
                  );
                }
              }
            }
            if (assistantText) {
              lastAssistantText = assistantText;
              if (logFilePath) {
                fs.appendFileSync(
                  logFilePath,
                  `[assistant message #${messageCount}]\n${assistantText}\n\n`,
                  'utf-8'
                );
              }
            }
          }
        } else if (message.type === 'user') {
          console.log(`    👤 User message`);
          if (logFilePath) {
            fs.appendFileSync(logFilePath, `[user message #${messageCount}]\n${JSON.stringify(message, null, 2)}\n\n`, 'utf-8');
          }
        } else if (message.type === 'result') {
          // Final result from the agent
          const resultMsg = message as any;
          console.log(`\n${'='.repeat(60)}`);
          console.log(`📊 Agent Execution Summary`);
          console.log(`${'='.repeat(60)}`);
          console.log(`Status: ${message.subtype}`);
          console.log(`Total messages: ${messageCount}`);
          console.log(`Duration: ${resultMsg.duration_ms}ms`);
          console.log(`Turns used: ${resultMsg.num_turns || 'N/A'}`);
          console.log(`Total cost: $${resultMsg.total_cost_usd?.toFixed(4) || 'N/A'}`);
          console.log(`Final result length: ${lastAssistantText.length} characters`);

          if (message.subtype !== 'success') {
            console.log(`\n⚠️  Warning: Agent finished with ${message.subtype}`);
            console.log(`This may indicate the task was not fully completed.`);
          }

          console.log(`${'='.repeat(60)}\n`);
          return lastAssistantText;
        } else {
          console.log(`    ℹ️  Other message type: ${message.type}`);
        }
      }

      console.log(`⚠️  Query loop ended without result message`);
      return lastAssistantText;
    } catch (error: any) {
      console.error('❌ Agent error:', error.message);
      console.error('Stack:', error.stack);
      throw error;
    }
  }
}
