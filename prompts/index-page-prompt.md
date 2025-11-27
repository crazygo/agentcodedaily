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
- Display the **latest 7 days** from the manifest (most recent first)
- For each day, show:
  - Date (formatted nicely, e.g., "November 26, 2025")
  - Link to the day's page: `/updates/YYYY-MM-DD/`
  - Brief description (you can use generic text like "Daily report on agentic coding products and updates")
  - Available files count from manifest

**Table/List Format:**
Use a clean table or list layout with:
- Date column (prominent, clickable)
- Summary/highlights column
- Link to full report

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
3. **Relative paths**: All links must be relative (no leading `/`). Example: `2025-11-26/`, `assets/base.css`, `../assets/base.js` in day pages.
4. **No external dependencies**: Only use the provided base.css and base.js
5. **Error handling**: If manifest.json is missing or malformed, display a friendly error message

## Output

Generate the complete HTML file content. The file should be production-ready and can be directly written to `/updates/index.html`.

Make it professional, clean, and user-friendly!
