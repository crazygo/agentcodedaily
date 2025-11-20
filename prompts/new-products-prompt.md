# New Products Research Prompt

Research and identify NEW products in the agentic coding space that were launched or gained attention recently.

## Focus Areas
- AI coding assistants and IDEs
- Code generation tools
- Autonomous coding agents
- Developer tools leveraging LLMs

## Search Sources
1. **Product Hunt** - Tags: developer-tools, ai, code-generation
2. **GitHub Trending** - Topics: ai-coding, code-generation, llm-agents
3. **Recent News** - Announcements about new agentic coding tools
4. **Hacker News** - Keywords: AI coding, code generation, LLM tools

## Output Format
Return a JSON array of discoveries:

```json
[
  {
    "title": "Product Name",
    "description": "Brief description of what it does, key features",
    "url": "https://official-website-or-github",
    "source": "Product Hunt | GitHub | HN | News",
    "category": "IDE | CLI Tool | IDE Extension | Autonomous Agent | Library | Framework"
  }
]
```

## Research Guidelines
- Focus on products from the **last 30 days**
- Verify information from multiple sources when possible
- Include relevant URLs for all findings
- Be specific about features and capabilities
- Focus on quality over quantity

**Today's Date**: {INSERT_CURRENT_DATE}
