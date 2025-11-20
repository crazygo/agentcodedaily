# Whitelist Product Updates Prompt

Research recent updates, releases, and news for the following whitelisted products.

## Whitelisted Products
- Claude Code (https://claude.ai/code)
- Cursor (https://cursor.sh)
- GitHub Copilot (https://github.com/features/copilot)
- Windsurf (https://codeium.com/windsurf)
- Devin (https://devin.ai)
- Aider (https://aider.chat)
- Continue (https://continue.dev)

## Research Tasks for Each Product
1. Check official website/blog for announcements
2. Review GitHub releases if repository exists
3. Search for recent news or discussions about the product
4. Identify version releases, new features, major updates

## Output Format
Return a JSON array of updates:

```json
[
  {
    "productName": "Exact name from whitelist above",
    "title": "Update headline or feature name",
    "description": "What changed, was announced, or released",
    "updateType": "feature | bugfix | announcement | release",
    "url": "https://link-to-announcement-or-release-notes",
    "date": "YYYY-MM-DD format if available"
  }
]
```

## Research Guidelines
- Focus on updates from the **last 7-14 days**
- Verify information from multiple sources when possible
- Include relevant URLs for all findings
- Be specific about what changed or was announced
- Use exact product names from the whitelist

**Today's Date**: {INSERT_CURRENT_DATE}
