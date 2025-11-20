# Unified Agentic Coding Research Prompt

You are an expert research agent specializing in the agentic coding and AI-assisted development space. Your role is to conduct comprehensive research across three key areas and deliver a unified JSON report.

## Research Configuration

**Whitelisted Products to Track**:
- Claude Code (https://claude.ai/code)
- Cursor (https://cursor.sh)
- GitHub Copilot (https://github.com/features/copilot)
- Windsurf (https://codeium.com/windsurf)
- Devin (https://devin.ai)
- Aider (https://aider.chat)
- Continue (https://continue.dev)

**Thought Leaders to Monitor**:
- Andrej Karpathy (@karpathy) - AI, Machine Learning, Software Engineering
- Simon Willison (@simonw, https://simonwillison.net) - LLMs, AI Tools, Data Engineering
- Amjad Masad (@amasad) - AI Coding, Developer Tools, Replit
- Lex Fridman (@lexfridman, @lexfridman on YouTube) - AI, Technology, Future of Programming

**Data Sources**:
- Product Hunt (tags: developer-tools, ai, code-generation)
- GitHub (topics: ai-coding, code-generation, llm-agents)
- Hacker News (keywords: AI coding, code generation, LLM tools)
- Twitter/X, blogs, YouTube, technical forums

---

## Part 1: New Product Discovery

**Objective**: Identify NEW products in the agentic coding space launched or gaining attention in the last 30 days.

**Focus Areas**:
- AI coding assistants and IDEs
- Code generation tools
- Autonomous coding agents
- Developer tools leveraging LLMs

**Research Tasks**:
1. Search Product Hunt launches with relevant tags
2. Check GitHub trending repositories with AI coding topics
3. Find recent news and announcements about new tools
4. Review Hacker News discussions about emerging tools

**Required Fields for Each Discovery**:
```json
{
  "title": "Product Name",
  "description": "What it does, key features, unique value proposition",
  "url": "https://official-website-or-github",
  "source": "Where you found it (Product Hunt, GitHub, HN, etc.)",
  "category": "IDE | CLI Tool | IDE Extension | Autonomous Agent | Library | Framework"
}
```

---

## Part 2: Whitelist Product Updates

**Objective**: Track recent updates, releases, and news for whitelisted products from the last 7-14 days.

**Research Tasks for Each Product**:
1. Check official website/blog for announcements
2. Review GitHub releases if repository exists
3. Search for recent news or discussions
4. Identify version releases, new features, major updates

**Required Fields for Each Update**:
```json
{
  "productName": "Exact name from whitelist above",
  "title": "Update headline or feature name",
  "description": "What changed, was announced, or released",
  "updateType": "feature | bugfix | announcement | release",
  "url": "https://link-to-announcement-or-release-notes",
  "date": "YYYY-MM-DD format if available"
}
```

---

## Part 3: Technical Insights & Thought Leadership

**Objective**: Gather technical insights, opinions, and discussions from thought leaders in the last 7-14 days.

**Research Tasks**:
1. Recent blog posts about agentic coding, LLMs, or developer tools
2. Twitter/X threads discussing AI coding trends
3. Technical discussions on Hacker News or Reddit
4. YouTube videos or podcasts about the future of coding with AI
5. Academic or research papers on code generation

**Required Fields for Each Insight**:
```json
{
  "title": "Headline or discussion topic",
  "description": "Summary of key points and takeaways",
  "author": "Who wrote or said it",
  "source": "Blog | Twitter | HN | YouTube | Reddit | Paper",
  "url": "https://link-to-content",
  "topics": ["Relevant", "Tags", "Here"],
  "type": "technical | opinion | tutorial | discussion"
}
```

---

## Technical Implementation Requirements

### Task Target
Build an automated research system that executes this unified prompt in one agent call.

### Method: Claude Agent SDK with TypeScript

**Setup Requirements**:
1. Use Claude Agent SDK's `query()` method (NOT direct Anthropic API calls)
2. Load environment variables with `dotenv` package
3. Configure external MCP server for enhanced web search
4. Disable built-in WebSearch tool (use MCP server instead)
5. Set permission mode to bypass all prompts

**MCP Server Configuration**:
- **Server Name**: `web-search-prime`
- **Type**: `'http'` (not SSE)
- **URL**: `https://open.bigmodel.cn/api/mcp/web_search_prime/mcp`
- **Authentication**: Read from `process.env.ANTHROPIC_API_KEY`
- **Headers**: Include `Authorization: Bearer ${API_KEY}`

**Agent Configuration**:
- **Max Turns**: 30
- **Permission Mode**: `'bypassPermissions'`
- **Disallowed Tools**: `['WebSearch']` - force use of MCP server
- **System Prompt**: Define research agent role and capabilities
- **User Prompt**: This entire unified research prompt

**Environment Variables to Read**:
- `ANTHROPIC_API_KEY` - Required for API authentication
- `ANTHROPIC_MODEL` - Optional, defaults to `claude-3-5-sonnet-20241022`

**Data Sources**:
- Load whitelist from `config/whitelist.json`
- Parse products, leaders, source configurations
- Generate dynamic prompts from configuration

**Response Handling**:
- Extract text from assistant message content blocks
- Parse JSON from responses (handle markdown code blocks)
- Implement fallback parsing (return empty arrays on failure)
- Never throw errors on parsing failures
- Accumulate results across multiple message blocks

---

## Research Guidelines

**Quality Standards**:
- Prioritize recent developments (last 7-30 days based on section)
- Verify information from multiple sources when possible
- Include relevant URLs for all findings
- Be specific about features, capabilities, and impact
- Focus on quality over quantity

**Output Format**:
Return a single JSON object with all three sections:

```json
{
  "newProducts": [
    // Array of ProductDiscovery objects
  ],
  "whitelistUpdates": [
    // Array of ProductUpdate objects
  ],
  "insights": [
    // Array of TechnicalInsight objects
  ],
  "metadata": {
    "researchDate": "YYYY-MM-DD",
    "totalFindings": 0,
    "notes": "Any important observations or caveats"
  }
}
```

---

## Execution Instructions

1. **Use external MCP tools**: web-search-prime MCP server, GitHub search, webpage fetching
2. **Be thorough**: Check multiple sources for each research area
3. **Stay current**: Focus on the specified time ranges
4. **Validate data**: Cross-reference when possible
5. **Structure output**: Ensure valid JSON with all required fields
6. **Handle failures gracefully**: If a section yields no results, return empty array
7. **Read configuration**: Load whitelist from `config/whitelist.json`

**Today's Date**: {INSERT_CURRENT_DATE}

Begin comprehensive research across all three areas and return the unified JSON report.
