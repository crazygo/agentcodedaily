#!/bin/bash
set -e

echo "🚀 Starting auto-update workflow..."

TARGET_BRANCH=${TARGET_BRANCH:-gh-pages}
SOURCE_BRANCH=${SOURCE_BRANCH:-main}

echo "ℹ️  Target: ${TARGET_BRANCH}, Source: ${SOURCE_BRANCH}"

# Step 1: Switch to gh-pages branch (work in repo root, never nest updates)
echo "📌 Switching to ${TARGET_BRANCH} branch..."
git fetch origin
git checkout "${TARGET_BRANCH}" || git checkout -b "${TARGET_BRANCH}"

# Verify we're on the correct branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "${TARGET_BRANCH}" ]; then
  echo "❌ Error: Failed to switch to ${TARGET_BRANCH} branch"
  exit 1
fi

# Pull latest changes from target branch
echo "🔄 Pulling latest changes..."
git pull origin "${TARGET_BRANCH}" || echo "ℹ️  Continuing with local version"

# Step 2: Sync with main (preserve updates/)
echo "🔀 Syncing with ${SOURCE_BRANCH} branch..."
git config merge.ours.driver true
echo "updates/ merge=ours" > .gitattributes

if git pull --no-rebase origin "${SOURCE_BRANCH}" --no-edit; then
  echo "✅ Successfully synced with ${SOURCE_BRANCH}"
else
  echo "🔄 Resolving conflicts..."
  # Prefer main's version for conflicts, except updates/
  git checkout --theirs . 2>/dev/null || true
  git add .
  git commit -m "chore: Merge ${SOURCE_BRANCH} with conflict resolution"
fi

# Clean up
rm -f .gitattributes
git config --unset merge.ours.driver 2>/dev/null || true

# Step 3: Install dependencies and build (after merge, before update)
echo "📦 Installing dependencies..."
if ! yarn install; then
  echo "❌ Failed to install dependencies"
  exit 1
fi

echo "🔨 Building project..."
if ! yarn build; then
  echo "❌ Failed to build project"
  exit 1
fi

# Step 4: Generate reports (ensure we run in repo root)
echo "📝 Generating daily reports..."
if ! yarn update; then
  echo "❌ Failed to generate reports"
  exit 1
fi

# Step 5: Commit and push changes
echo "💾 Committing changes..."
if [ -d "updates" ] && [ "$(ls -A updates 2>/dev/null)" ]; then
  git add -f updates/

  if ! git diff --cached --quiet; then
    TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M UTC")
    git commit -m "chore: Auto-update reports - $TIMESTAMP"

    echo "📤 Pushing changes..."
    if ! git push origin "${TARGET_BRANCH}"; then
      echo "❌ Push failed, trying once more..."
      git pull origin "${TARGET_BRANCH}" && git push origin "${TARGET_BRANCH}"
    fi
  else
    echo "ℹ️  No new changes to commit"
  fi
else
  echo "ℹ️  No updates directory found"
fi

echo "✨ Workflow completed!"
