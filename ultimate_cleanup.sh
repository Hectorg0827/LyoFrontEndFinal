#!/bin/bash

# Ultimate project cleanup - Remove all excessive files
echo "🧹 ULTIMATE PROJECT CLEANUP"
echo "=========================="

# Remove ALL build/fix scripts except the 4 essential ones
echo "🗑️ Removing excessive scripts..."
find . -maxdepth 1 -name "*.sh" -type f ! -name "build-ios-clean.sh" ! -name "start-metro.sh" ! -name "cleanup-project-final.sh" ! -name "ultimate_cleanup.sh" -delete

# Remove ALL markdown files except README.md
echo "🗑️ Removing excessive documentation..."
find . -maxdepth 1 -name "*.md" -type f ! -name "README.md" -delete

# Remove ALL backup/duplicate files
echo "🗑️ Removing backup and duplicate files..."
find . -maxdepth 1 \( -name "*.backup*" -o -name "*.clean" -o -name "*.fixed" -o -name "*.new" -o -name "*.original" -o -name "*.simple" -o -name "*.bak" \) -delete

# Remove ALL log files
echo "🗑️ Removing log files..."
find . -maxdepth 1 -name "*.log" -delete

# Remove config duplicates
echo "🗑️ Removing config duplicates..."
rm -f backend-package.json env.node eslint.config.js eas.json dependency-update-plan.md

# Remove unnecessary scripts folder content (keep only essential 4)
echo "🗑️ Cleaning scripts folder..."
cd scripts
find . -name "*.js" -delete
find . -name "*.sh" ! -name "build-ios.sh" ! -name "build-android.sh" ! -name "start-metro.sh" ! -name "lint.sh" -delete
rm -rf "New Workspace" backup-shell-scripts
cd ..

echo "✅ Ultimate cleanup completed!"
echo "📊 Project structure after cleanup:"
ls -la | head -20
