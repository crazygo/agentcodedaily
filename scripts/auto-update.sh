#!/bin/bash
set -e

echo "🚀 Starting auto-update workflow..."

TARGET_BRANCH=${TARGET_BRANCH:-gh-pages}
SOURCE_BRANCH=${SOURCE_BRANCH:-main}

# Safety check: Force ensure we're working with a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "❌ Error: Not in a git repository"
  exit 1
fi

# Safety check: Verify we can access the remote
if ! git remote get-url origin > /dev/null 2>&1; then
  echo "❌ Error: No remote 'origin' found"
  exit 1
fi

echo "ℹ️  Current directory: $(pwd)"
echo "ℹ️  Target branch: ${TARGET_BRANCH}"
echo "ℹ️  Source branch: ${SOURCE_BRANCH}"

# Step 1: Switch to pages branch and sync with remote
echo ""
echo "📌 Step 1: Switching to ${TARGET_BRANCH} branch..."

# Force switch to target branch - this is the critical safety step
echo "🔄 Force switching to ${TARGET_BRANCH} branch..."

# Fetch all remote branches first to ensure we have latest information
git fetch --all --prune

if git rev-parse --verify "${TARGET_BRANCH}" >/dev/null 2>&1; then
  # Branch exists locally, switch to it
  git checkout "${TARGET_BRANCH}"
  echo "✅ Switched to existing ${TARGET_BRANCH} branch"
else
  # Branch doesn't exist locally, create it from remote or as new
  if git ls-remote --exit-code --heads origin "${TARGET_BRANCH}" >/dev/null 2>&1; then
    # Branch exists on remote, check it out
    git checkout -b "${TARGET_BRANCH}" "origin/${TARGET_BRANCH}"
    echo "✅ Created ${TARGET_BRANCH} branch from remote"
  else
    # Branch doesn't exist anywhere, create new branch
    git checkout -b "${TARGET_BRANCH}"
    echo "✅ Created new ${TARGET_BRANCH} branch"
  fi
fi

# CRITICAL: Verify we're on the correct branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "${TARGET_BRANCH}" ]; then
  echo "❌ CRITICAL ERROR: Failed to switch to ${TARGET_BRANCH} branch"
  echo "❌ Current branch: $CURRENT_BRANCH"
  echo "❌ Expected branch: ${TARGET_BRANCH}"
  echo "❌ This script must run on the ${TARGET_BRANCH} branch to avoid data corruption"
  exit 1
fi

echo "✅ Verified: Now running on ${TARGET_BRANCH} branch"

# Pull latest changes from remote target branch if it exists
if git ls-remote --exit-code --heads origin "${TARGET_BRANCH}" >/dev/null 2>&1; then
  echo "🔄 Pulling latest changes from origin/${TARGET_BRANCH}..."
  if git pull origin "${TARGET_BRANCH}"; then
    echo "✅ Successfully pulled latest changes"
  else
    echo "⚠️  Failed to pull latest changes, continuing with local version..."
  fi
else
  echo "ℹ️  Remote ${TARGET_BRANCH} branch not found, will create on push"
fi

# Step 2: Sync with main branch (get latest code while preserving updates/)
echo ""
echo "🔀 Step 2: Syncing with latest code from ${SOURCE_BRANCH} branch..."

# Configure merge driver to always prefer our version for updates/ directory
git config merge.ours.driver true
echo "updates/ merge=ours" > .gitattributes

# Pull main branch with automatic conflict resolution for updates/
if git pull "origin/${SOURCE_BRANCH}" --no-edit; then
  echo "✅ Successfully synced with ${SOURCE_BRANCH} branch"
else
  echo "❌ Sync failed, attempting manual conflict resolution..."

  # Handle specific conflicts
  if [ -f "yarn.lock" ]; then
    echo "🔄 Resolving yarn.lock conflict (using ${SOURCE_BRANCH} version)..."
    git checkout --theirs yarn.lock
    git add yarn.lock
  fi

  # Resolve any remaining conflicts by preferring main's version
  echo "🔄 Resolving remaining conflicts..."
  git checkout --theirs -- .

  # Ensure updates/ directory is preserved
  git reset HEAD updates/ 2>/dev/null || true

  # Commit the resolved merge
  git add .
  git commit -m "chore: Merge ${SOURCE_BRANCH} with conflict resolution"
  echo "✅ Conflicts resolved and merge completed"
fi

# Clean up merge configuration
rm -f .gitattributes
git config --unset merge.ours.driver 2>/dev/null || true

# Step 3: Generate daily reports
echo ""
echo "📝 Step 3: Generating daily reports..."
if yarn install && yarn update; then
  echo "✅ Successfully generated reports"
else
  echo "❌ Failed to generate reports"
  exit 1
fi

# Step 4: Commit and push changes
echo ""
echo "💾 Step 4: Committing and pushing changes..."

# Only add changes in the updates directory (covers any date structure)
if [ -d "updates" ] && [ "$(ls -A updates 2>/dev/null)" ]; then
  git add updates/

  if ! git diff --cached --quiet; then
    TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M UTC")
    git commit -m "chore: Auto-update reports - $TIMESTAMP"
    echo "✅ Changes committed"

    # Simple push strategy with basic retry
    echo ""
    echo "📤 Pushing to ${TARGET_BRANCH} branch..."

    MAX_RETRIES=2
    RETRY_COUNT=0

    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
      if git push origin "${TARGET_BRANCH}"; then
        echo "✅ Changes pushed successfully"
        break
      else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
          echo "⚠️  Push failed (attempt $RETRY_COUNT/$MAX_RETRIES), retrying..."
          echo "🔄 Pulling latest changes..."

          # Pull latest changes and try again
          if git pull origin "${TARGET_BRANCH}"; then
            echo "✅ Pulled latest changes, retrying push..."
            sleep 2
          else
            echo "❌ Failed to pull latest changes"
            exit 1
          fi
        else
          echo "❌ Failed to push after $MAX_RETRIES attempts"
          exit 1
        fi
      fi
    done
  else
    echo "ℹ️  No new changes to commit"
  fi
else
  echo "ℹ️  No updates directory or empty directory, nothing to commit"
fi

echo ""
echo "✨ Auto-update workflow completed successfully!"
