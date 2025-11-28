# Generate /updates/index.html (Static - Agent Daily Style)

Task: build a static HTML index page that presents a **complete, high-signal overview for the latest 7 days directly on the index page**, styled exactly like the "Agent Daily" reference.

Readers should get the full picture from the index page alone, without needing a separate "full report" page for these 7 days.

## Context (simple)
*(Keep this section exactly as you had it)*
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
  ```
  Use relative links: `assets/base.css`, `assets/base.js`.
- **GitHub Pages base path**: `/agentdaily/`
- **Path Rules**: relative links only.
- **Current datetime**: {INSERT_CURRENT_DATETIME}
- **Output file**: `/updates/index.html`

## Prerequisites
*(Keep this section as is)*

## Manifest Structure
*(Keep this section as is)*

## Requirements

### 1. Page Structure & Layout (Crucial)
Generate a complete HTML5 document with a **Two-Column Layout** that matches the "Agent Daily" aesthetic:

- **Global Container**: A max-width container centered on the screen.
- **Top Header**: Minimalist. Centered Serif text "Agent Daily". Right-aligned GitHub icon link.
  - Include a one-line tagline in the header: "Build your own daily with AI" with a clickable GitHub link to https://github.com/crazygo/agentdaily.
- **Layout Grid**: Use CSS Grid or Flexbox to create two distinct columns:
  - **Left Sidebar (Navigation)**:
    - Width: Approx 200px - 250px.
    - Sticky position (sticks to top while scrolling).
    - Content: A vertical chronological list of dates (e.g., "2025-11-26") linking to anchors in the main feed or sub-pages.
    - Style: Clean, simple text links, no heavy background.
  - **Right Column (Main Feed)**:
    - The primary content area where the daily cards are rendered.
    - Scrollable.

### 2. Content Rendering Logic
Iterate through the **latest 7 days** from the manifest. For each day, read `updates/{YYYY-MM-DD}/data.json` and render a **Full Content Section** in the Right Column.

**Schema Discovery & Field Inference:**
- Treat the JSON schema as **dynamic and unknown**. Do NOT assume a fixed structure.
- Discover sections dynamically from any arrays of objects found in `data.json` (e.g., `products`, `updates`, `insights`, `highlights`, `notes`, `cases`, etc.).
- Infer field purposes from common naming patterns:
  - **Title-like fields**: `title`, `name`, `headline`, `label`, `id`
  - **Description-like fields**: `summary`, `description`, `body`, `text`, `content`
  - **Link-like fields**: `url`, `link`, `source`, `href`
  - **Metadata fields**: `tags`, `category`, `model`, `source`, `date`, `author`

**For each Day's Block:**

1.  **Date Heading (Serif)**:
    - Display the date (e.g., "2025-11-26") in a **Large, Bold, Serif Font**. This is the most important visual anchor.
    - Follow with a short summary paragraph (if available in JSON) in gray Sans-Serif text.

2.  **Full Content Section**:
    - For each array of objects discovered in `data.json`, render a section with all items.
    - **Render each item as a Card** with:
      - **Bold title line** (from title-like fields)
      - **Short description paragraph** (from description-like fields, if available)
      - **Small muted metadata line** (tags, source, model, etc., if present)
      - **Inline link** to source URL if a link-like field exists
    - **Grid Layout**: If multiple items exist, display them in a responsive grid (2-column on desktop).
    - **Typography**: Item titles in **Bold Serif**, descriptions in Sans-Serif.
    - **Tags**: If categories exist, show them as small, uppercase, light-gray badges.
    
3.  **Unknown or Nested Structures**:
    - For deeply nested or unexpected fields, either:
      - Extract the most human-readable pieces into bullet points, OR
      - Fall back to a `<pre>` block with pretty-printed JSON so no data is lost.
    - Never discard data—always surface it in some readable form.

4.  **No "View Full Report" Links**:
    - Do **NOT** add "View Full Report →", "Read More", or any other navigation-only links to a separate per-day page.
    - Each day's block on the index page should contain **substantive, readable content** on its own.
    - The index page IS the full report surface for these 7 days.

**Error Tolerance:**
- If `data.json` is **missing or unparseable**: render a simple card with the date and a notice ("Data unavailable for this day").
- If only **part of the structure** is unexpected: still render everything that can be understood. Never fail the entire page due to partial data issues.
- Always prefer rendering something useful over showing nothing or a broken layout.

### 3. Style Guidelines (Agent Daily Theme)
You must generate CSS (inline or extending base.css) to match the specific "Agent Daily" vibe:

- **Typography System (Strict)**:
  - **Headings (Dates, Section Titles)**: MUST use a **Serif font-family** (e.g., `font-family: 'Merriweather', 'Times New Roman', serif;`).
  - **Body Text**: MUST use a **Sans-Serif font-family** (e.g., `font-family: 'Inter', system-ui, sans-serif;`).
- **Color Palette**:
 - Background: `#ffffff` (Pure White).
  - Text: `#1a1a1a` (Dark Black) for headings, `#4a4a4a` (Dark Gray) for body.
  - Accents: `#f3f4f6` (Light Gray) for tag backgrounds.
- **Visual Details**:
  - No shadows, no heavy borders. Use whitespace for separation.
  - Links: Underlined or subtle blue.

### 4. SEO & Technical
- **Meta**: Title "Agent Daily - Updates", standard meta description.
- **Responsiveness**: On mobile screens (<768px), hide the Left Sidebar or move it to a hamburger menu, and make the Right Column full width.
 - **Static Integrity**: Ensure all loops and data insertion happen at generation time. No client-side fetch.
  - **No Emojis**: Do not insert emojis in any headings, labels, or body text.

## Important Notes
1. **Read data files**: You MUST read `updates/{YYYY-MM-DD}/data.json` to populate the "Full Content Section". This is the primary source of truth.
2. **Schema Flexibility**: Do NOT assume a fixed JSON schema. Discover structure dynamically and adapt rendering accordingly.
3. **Graceful Degradation**: If some fields are missing, malformed, or unexpected, still render everything that can be understood. Never fail the entire page.
4. **No Navigation-Only Cards**: Never render a card that only shows a date and a single link. Each day's block must contain substantive content.
5. **Relative Paths**: Links to external sources should be preserved. Internal asset links are `assets/base.css`.
6. **Self-Contained**: The index page should provide complete information for the latest 7 days without requiring navigation to per-day pages.

## Output
Generate the complete HTML file content for `/updates/index.html`.

This page must be **self-contained** and surface all important information for the latest 7 days directly on this page. Users should not need to navigate to separate per-day pages to see a "full report"—the index page IS the full report for these 7 days.
