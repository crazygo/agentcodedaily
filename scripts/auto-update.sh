#!/bin/bash
set -e

echo "🚀 Starting auto-update workflow..."

# Step 1: Switch to ph-pages branch
echo ""
echo "📌 Step 1: Switching to ph-pages branch..."
git fetch origin

if git rev-parse --verify ph-pages >/dev/null 2>&1; then
  git checkout ph-pages
  echo "✅ Switched to existing ph-pages branch"
  
  # Pull latest changes from remote ph-pages branch
  echo "🔄 Pulling latest changes from origin/ph-pages..."
  if git pull --rebase origin ph-pages; then
    echo "✅ Successfully pulled latest changes"
  else
    echo "❌ Failed to pull changes (may need manual conflict resolution)"
    exit 1
  fi
else
  git checkout -b ph-pages
  echo "✅ Created new ph-pages branch"
fi

# Step 2: Merge main branch (auto-resolve conflicts)
echo ""
echo "🔀 Step 2: Merging main branch..."
if git merge -X theirs origin/main --no-edit; then
  echo "✅ Successfully merged main branch"
else
  echo "❌ Failed to merge main branch"
  exit 1
fi

# Step 3: Run yarn update
echo ""
echo "📝 Step 3: Generating daily reports..."
if yarn update; then
  echo "✅ Successfully generated reports"
else
  echo "❌ Failed to generate reports"
  exit 1
fi

# Step 4: Commit and push changes
echo ""
echo "💾 Step 4: Committing changes..."
# Only add updates directory, force to bypass .gitignore
git add -f updates/

if ! git diff-index --quiet HEAD --; then
  TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M UTC")
  git commit -m "chore: Auto-update reports - $TIMESTAMP"
  echo "✅ Changes committed"
  
  echo ""
  echo "📤 Pushing to ph-pages branch..."
  git push origin ph-pages
  echo "✅ Changes pushed successfully"
else
  echo "ℹ️  No changes to commit"
fi

echo ""
echo "✨ Auto-update workflow completed successfully!"
