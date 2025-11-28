# Generate /updates/index.html (Static - Agent Daily Style)

Task: build a static HTML index page listing latest 7 daily report folders, **styled exactly like the "Agent Daily" reference**.

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
Iterate through the **latest 7 days** from the manifest. For each day, read `updates/{YYYY-MM-DD}/data.json` and render a **Semantic Article Block** in the Right Column.

**For each Day's Block:**

1.  **Date Heading (Serif)**:
    - Display the date (e.g., "2025-11-26") in a **Large, Bold, Serif Font**. This is the most important visual anchor.
    - Follow with a short summary paragraph (if available in JSON) in gray Sans-Serif text.

2.  **Content Preview Grid**:
    - Analyze the JSON data. Look for arrays like `products`, `updates`, or `insights`.
    - **Render a Preview Section**: Instead of just a "Read More" button, try to render a preview of the content *if possible* based on the JSON structure.
    - **Style**: Use the "Card" style from the reference:
      - **Emoji Headers**: e.g., "🚀 New Products", "📝 Daily Report".
      - **Grid Layout**: If multiple items exist (like products), display them in a small 2-column grid.
      - **Typography**: Item titles in **Bold Serif**, descriptions in Sans-Serif.
      - **Tags**: If categories exist, show them as small, uppercase, light-gray badges.

3.  **Read Full Report Action**:
    - At the bottom of the day's block, add a clear link: "View Full Report →" pointing to the relative path `2025-11-26/`.

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

## Important Notes
1. **Read data files**: You MUST read `updates/{YYYY-MM-DD}/data.json` to populate the "Content Preview Grid". Don't just list the date.
2. **Relative Paths**: Links to days are `2025-11-26/`. Assets are `assets/base.css`.
3. **Fallback**: If `data.json` structure is unexpected, fall back to a simple card showing the Date and a "View Report" link, but maintain the Serif/Sans-serif styling.

## Output
Generate the complete HTML file content for `/updates/index.html`.
