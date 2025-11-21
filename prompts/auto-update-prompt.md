# Auto Update Daily Reports Task

## Current Context
- Repository: agentcodedaily
- Working directory: current repository root
- Main branch: `main` (development)
- Publishing branch: `ph-pages` (for published reports)

## Task Steps

Execute the following steps in order:

### Step 1: Switch to ph-pages Branch
```bash
# Fetch latest changes
git fetch origin

# Switch to ph-pages branch, create if doesn't exist
git checkout ph-pages || git checkout -b ph-pages
```

### Step 2: Merge main Branch (Auto-resolve Conflicts)
```bash
# Merge main branch, always accept main's changes on conflict
git merge -X theirs origin/main --no-edit

# If there are changes, the merge will auto-commit
# If conflicts occur, they will be auto-resolved using main's version
```

**Important**: The `-X theirs` strategy ensures that when conflicts occur, main's changes are always accepted automatically.

### Step 3: Run yarn update
```bash
# Generate daily reports
yarn update
```

This command will:
- Create `updates/YYYY-MM-DD/` directory
- Run Claude Agent SDK research workflow
- Generate `report.md` and `data.json`

### Step 4: Commit All Changes
```bash
# Add all new and modified files
git add .

# Check if there are changes to commit
if ! git diff-index --quiet HEAD --; then
  # Commit with timestamp
  git commit -m "chore: Auto-update reports - $(date -u +"%Y-%m-%d %H:%M UTC")"

  # Push to ph-pages branch
  git push origin ph-pages
else
  echo "No changes to commit"
fi
```

## Expected Results

After execution:
- `ph-pages` branch is synced with latest `main`
- New daily report is generated in `updates/YYYY-MM-DD/`
- All changes are committed and pushed to `ph-pages`

## Error Handling

- If merge fails: Stop and report error
- If yarn update fails: Stop and report error
- If no changes: Skip commit step (not an error)
- If ANTHROPIC_API_KEY is missing: yarn update will fail

## Notes

- This is designed to run unattended
- All conflicts are auto-resolved
- Requires ANTHROPIC_API_KEY environment variable
- Safe to run multiple times (idempotent)
