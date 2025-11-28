# Generate /updates/index.html (Weekly Report - Medium Style)

Task: Build a static HTML index page that acts as a **Weekly Insight Report**. 
The page must aggregate data from the **latest 7 days**, intelligently categorize it, and present it in a clean, "Medium-style" layout.

## Context
- **Site root**: `/updates`
- **Manifest file**: Located at `/updates/manifest.json`
- **Output file**: `/updates/index.html`
- **Assets**: Use relative links `assets/base.css`, `assets/base.js`.
- **Style Goal**: **Strict Medium Design**. Minimalist, Black & White typography. No brand colors (no blue, no purple). High readability.
- **Language**: All generated content must be in **English**.

## 1. Data Processing Logic (Crucial)

**Step 1: Determine Time Window**
1. Identify the latest date folder in `/updates/` (e.g., `2025-11-26`).
2. Define the **Current Group** as the 7-day range ending on that date (e.g., `2025-11-20` to `2025-11-26`).
3. **Only process this single group.** Do not render older weeks.

**Step 2: Data Aggregation (File Agnostic)**
1. Iterate through every date folder within the Current Group.
2. Inside each folder, **scan ALL `.json` files** (do NOT look for `data.json` specifically; files may have random names).
3. Extract all data items into a single pool.
4. **Deduplication**: If the same URL or identical title appears in multiple days, keep only the latest version.

**Step 3: AI Categorization (Strict)**
You must analyze the content of each item (Title + Description) and assign it to exactly **one** of the following 4 categories:
1. **New Products** (Complete new tools, apps, or agents)
2. **New Features** (Updates to existing tools, improvements, v2.0 releases)
3. **New Technologies** (Papers, underlying models, frameworks, research)
4. **Others** (General news, industry commentary, miscellaneous)

*Note: Do not create other categories.*

## 2. Page Layout & Structure

**Global Container**: Centered, max-width 1200px.

**1. Global Site Header (Crucial - Must be at the very top)**:
   - Placement: Inside the container, *before* the Two-Column layout.
   - **Content**:
     - Main Logo: "Agent Daily" (Large, Centered, Serif Font, Bold).
     - Tagline: "Build your own daily with AI" (Small, Sans-serif, Gray).
     - Action: A `View on GitHub` icon/link pointing to repository.
     - Code example: 
     ```
     <a href="https://github.com/crazygo/agentdaily" target="_blank" class="github-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
            </svg>
            View on GitHub
        </a>
      ```
   - **Style**: Minimalist, extra whitespace below it to separate from the content.

**2. Two-Column Layout (Main Body)**:
   - Use CSS Grid/Flex to create the sidebar and main content area below the Global Site Header.
   
  1. **Left Sidebar (Navigation)**:
    - Width: ~200px. Sticky.
    - Content: A simple timeline list.
    - Display the Date Range of the current group (e.g., "Nov 20 - Nov 26").
    - (Visual) Simple gray text, distinct active state for the current range.

  2. **Right Column (Main Content)**:
    - **Header**:
      - Large Serif Title: "Weekly Report"
      - Subtitle (Date Range): "Nov 20, 2025 – Nov 26, 2025"
      - Description: "A curated summary of the most important updates in AI from the last 7 days."
    
    - **Category Sections (Loop N times)**:
        - Iterate through the categories: [New Products, New Features, New Technologies, Others].
        - If a category is empty, skip it.
        - **Section Title**: H2, Serif font, Bold, Black.
        - **Layout Logic (MANDATORY per Category)**:
            - For EACH category independently, you MUST execute this logic:
              - Count the number of items ($N$) in this category.
              - STRICTLY apply the correct CSS class combination based on N:
                - If $N \le 3$: Use class `grid-rows-1`
                - If $4 \le N \le 8$: Use class `grid-rows-2`
                - If $N \ge 9$: Use class `grid-rows-3`
              - FORBIDDEN: Do NOT use generic classes like horizontal-scroll. You MUST use scroll-grid combined with a grid-rows-X class.
              - Render cards inside. The CSS will handle the specific "1-4-7" column-major ordering.

## 3. Card Rendering Rules

For each item within a category, render a Card:
- **Style**: Minimalist, white background, thin gray border (optional) or whitespace separation.
- **Elements**:
  1. **Title**: Bold, Serif font (Time New Roman / Merriweather).
  2. **Description**: Sans-serif, dark gray (`#4a4a4a`). Limit to 3 lines.
  3. **Metadata Row (Bottom)**:
     - **Date**: The specific collection date (e.g., "Nov 24").
     - **Source**: Domain name or source label.
     - **Link**: Wrap the whole card or title in the source anchor tag.

**Field Inference Strategy**:
- Since JSON schemas vary, look for:
  - Title: `title`, `name`, `headline`
  - Body: `description`, `summary`, `content`, `text`
  - Link: `url`, `href`, `link`, `source_url`
  - Date: Derive from the folder name if not in JSON.

## 4. Design System (Medium Style)

Generate/Update CSS to enforce:
- **Color Palette**: 
  - Background: `#FFFFFF`
  - Text: `#000000` (Headings), `#292929` (Body).
  - Borders/Lines: `#E6E6E6` (Very light gray).
  - **NO ACCENT COLORS**. No blue links, no colored buttons. Links should be underlined or black.
- **Typography**:
  - Headings: **Serif** (`Georgia`, `Cambria`, `Times New Roman`, serif).
  - Body: **Sans-Serif** (`Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, sans-serif).
- **Layout Utilities**:
  - **Grid Container**:
    - `.scroll-grid`: `display: grid; grid-auto-flow: column; grid-auto-columns: 320px; gap: 20px; overflow-x: auto; padding-bottom: 15px;`
    - **Adaptive Rows**:
      - `.grid-rows-1`: `grid-template-rows: auto;` (One row height)
      - `.grid-rows-2`: `grid-template-rows: repeat(2, auto);` (Two rows height)
      - `.grid-rows-3`: `grid-template-rows: repeat(3, auto);` (Three rows max)
  - **Card Styling**:
    - `.card`: `width: 100%; height: 100%; border: 1px solid #E6E6E6; padding: 16px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;`
    - Ensure cards stretch to fill their grid cell so rows look even.

## 5. Output Requirements
- Output raw HTML.
- Ensure the logic aggregates 7 days of data into ONE view.
- Do NOT generate separate headers for each day in the Right Column. The hierarchy is: `Weekly Header` -> `Category` -> `Cards`.