# Generate /updates/index.html (Static)

Task: build a static HTML index page listing latest 7 daily report folders.

## Context (simple)

- **Site root**: `/updates`
- **Manifest file**: Located at `/updates/manifest.json`
- **Shared assets templates**: Located at `/templates/updates-assets/`
  - CSS template: `/templates/updates-assets/base.css`
  - JavaScript template: `/templates/updates-assets/base.js`
- **Assets setup (one block)**:
  ```bash
  mkdir -p updates/assets
  [ -f updates/assets/base.css ] || cp templates/updates-assets/base.css updates/assets/base.css
  [ -f updates/assets/base.js ] || cp templates/updates-assets/base.js updates/assets/base.js
  # Verify
  ls -l updates/assets
  ```
  Use relative links: `assets/base.css`, `assets/base.js` (never start with /).
- **GitHub Pages base path**: `/agentdaily/` (repository name)
- **Important Path Rule**:
  - When generating links or asset references inside `/updates/index.html`, use RELATIVE paths: `assets/base.css`, `assets/base.js`.
  - When linking to a day folder from index: `2025-11-26/` (no leading slash).
  - Inside daily pages, reference assets as `../assets/base.css` and `../assets/base.js`.
  - Avoid absolute `/updates/...` paths (they break on GitHub Pages where the full URL is `/agentdaily/updates/...`).
- **Current datetime**: {INSERT_CURRENT_DATETIME}
- **Output file**: `/updates/index.html`

## Prerequisites

Single assets setup already shown above. After generating index.html verify no absolute paths:
```bash
grep -n "href=\"/" updates/index.html || echo "✅ No absolute root hrefs"
```

## Manifest Structure

The manifest.json file contains:
```json
{
  "days": [
    {
      "date": "2025-11-26",
      "files": ["data.json", "report.md", "index.html"]
    }
  ],
  "lastUpdated": "2025-11-26T16:12:51.561Z"
}
```

The `days` array is sorted in ascending order (oldest first).

## Requirements

### 1. Page Structure
Generate a complete, valid HTML5 document that:
- Uses semantic HTML
- Includes proper `<head>` with title, meta tags, and charset
- Copies asset templates (if not already) and links RELATIVELY: `assets/base.css` and `assets/base.js`
- Provides a `<noscript>` fallback navigation (Home + latest 7 dates)
- Has a clear, professional layout

### 2. Content Requirements

**Header Section:**
- Title: "Agent Code Daily - Updates"
- Subtitle with current date
- Brief description of what this page contains

**Main Content:**
- Iterate through the **latest 7 days** from the manifest (most recent first)
- **CRITICAL**: For each day, you MUST read the file `updates/{YYYY-MM-DD}/data.json` to fetch real content
- Parse the JSON and analyze its structure yourself to find relevant content. The JSON structure may vary, so you should:
  - Look for any timestamp field (e.g., generation time, update time)
  - Look for arrays of items that represent different content types (products, updates, insights, articles, etc.)
  - For each item, identify fields that represent the title, description/summary, source URL, and any other relevant metadata
  - Adapt to whatever field names and structure you find in the actual data
- Use this real data to populate each day's content in the feed

**Feed Component Format:**
For each day, generate a semantic `<article>` or card component with:
- **Formatted Date**: Display the date prominently (e.g., "November 26, 2025")
- **Summary Section**: Show a brief summary of the day's content:
  - Analyze the JSON structure and count items in each content category/array you find
  - Derive meaningful labels from array keys (e.g., if you find an array named `newProducts`, display as "X products"; for `insights`, display as "X insights")
- **Highlights**: Display 1-2 featured items from the data:
  - Find the first item with a title and description from any content array
  - If multiple arrays exist, prioritize arrays that seem most interesting to readers (products, insights, updates, etc.)
  - Show its title and a brief description to give readers a preview
- **"Read Full Report" Link**: Link to the day's folder using a relative path like `2025-11-26/` (no leading slash)

**Navigation:**
- If there are more than 7 days total in manifest, add "View All Archives" or similar link
- Breadcrumbs: "Home > Updates"

**Footer:**
- Generated timestamp: "Last updated: {INSERT_CURRENT_DATETIME}"
- Copyright or project info (optional)

### 3. Style Guidelines
- Mobile-first responsive design
- Clean, readable typography
- Proper spacing and hierarchy
- Use the base.css classes when applicable
- Minimal custom inline styles (prefer external CSS)

### 4. SEO Considerations
- Proper meta description
- Semantic HTML with headings (h1, h2, etc.)
- Descriptive link text
- Alt text for any images (if added)

## Important Notes

1. **Static generation**: This HTML must be fully static with no server-side rendering
2. **Read manifest**: You MUST read the actual manifest.json file to get the real list of days
3. **Read data files**: For each day in the feed, you MUST read `updates/{YYYY-MM-DD}/data.json` to get real content (titles, summaries, counts) - do NOT use placeholder or generic text. If a data.json file is missing or cannot be parsed, skip that day or display a minimal card with just the date and a "Report unavailable" message
4. **Relative paths**: All links must be relative (no leading `/`). Example: `2025-11-26/`, `assets/base.css`, `../assets/base.js` in day pages.
5. **No external dependencies**: Only use the provided base.css and base.js
6. **Error handling**: If manifest.json is missing or malformed, display a friendly error message. If a specific day's data.json is missing or corrupted, either skip that day in the feed or show a minimal placeholder card with just the date and a message like "Data unavailable for this day"

## Output

Generate the complete HTML file content. The file should be production-ready and can be directly written to `/updates/index.html`.

Make it professional, clean, and user-friendly!
