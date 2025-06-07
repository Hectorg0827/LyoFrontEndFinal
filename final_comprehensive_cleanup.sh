#!/bin/bash

# Final Comprehensive Cleanup for Lyo AI Learning Assistant
# This script removes ALL unnecessary files, backups, and duplicate scripts

echo "🧹 Starting Final Comprehensive Cleanup..."

# Remove all backup files and duplicates
echo "Removing backup files..."
rm -f *.backup*
rm -f *.original*
rm -f *.clean*
rm -f *.simple*
rm -f App.tsx.backup.*
rm -f app.json.backup*
rm -f .gitignore.backup

# Remove all markdown documentation files
echo "Removing excessive documentation..."
rm -f *.md
rm -f BUILD_*.md
rm -f IOS_*.md
rm -f DEPLOYMENT_*.md
rm -f REACT_*.md
rm -f AVATAR_*.md
rm -f BUNDLE_*.md
rm -f CLEAN_*.md
rm -f COMPLETE_*.md
rm -f COMPREHENSIVE_*.md
rm -f FINAL_*.md
rm -f GLOG_*.md
rm -f LAUNCH_*.md
rm -f MAINTENANCE_*.md
rm -f METRO_*.md
rm -f PERMANENT_*.md
rm -f PHASE_*.md
rm -f PROJECT_*.md
rm -f QUICK_*.md
rm -f TARGET_*.md
rm -f XCODE_*.md

# Remove all log files
echo "Removing log files..."
rm -f *.log
rm -f build*.log
rm -f ios_*.log
rm -f latest_*.log
rm -f monitor*.log
rm -f npx-calls.log
rm -f prebuild-output.log

# Remove all temporary and archive directories
echo "Removing temporary directories..."
rm -rf archive/
rm -rf tmp_*/
rm -rf "Support\/"
rm -rf Configuration/
rm -rf Files/
rm -rf Signing/

# Remove ALL script files except the ones in scripts/ directory
echo "Removing duplicate scripts..."
rm -f *.sh
rm -f SUMMARY.sh
rm -f comprehensive_cleanup.sh

# Remove unnecessary config files
echo "Removing unnecessary configs..."
rm -f env.node
rm -f typescript
rm -f eslint.config.js
rm -f babel.config.js.new
rm -f backend-package.json
rm -f server.js
rm -f simple-server.js
rm -f simple_backend.py

# Remove test files that are not in proper test directory
echo "Removing scattered test files..."
rm -f test-*.js
rm -f test_*.sh

# Remove workspace and IDE files (except .vscode for development)
echo "Cleaning IDE files..."
rm -f LyoFrontEndFinal.code-workspace

# Remove dependency update files
echo "Removing temporary dependency files..."
rm -f dependency-update-plan.md

# Keep only essential files in root
echo "✅ Cleanup complete! Remaining files:"
ls -la | grep -v "^d" | wc -l
echo "files remaining in root directory"

echo "🎉 Final cleanup completed successfully!"
