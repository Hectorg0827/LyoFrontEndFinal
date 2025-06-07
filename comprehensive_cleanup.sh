#!/bin/bash

# Comprehensive Project Cleanup Script
# This script will clean up the Lyo AI Learning Assistant project

set -e

echo "🧹 Starting Comprehensive Project Cleanup"
echo "=========================================="

PROJECT_ROOT="/Users/republicalatuya/Desktop/LyoFrontEndFinal"
cd "$PROJECT_ROOT"

# 1. Remove backup files and junk
echo "🗑️  Removing backup files and temporary artifacts..."

# Remove backup files
find . -maxdepth 1 -type f \( -name '*~' -o -name '*.bak' -o -name '*.backup*' -o -name '*.clean' -o -name '*.fixed' -o -name '*.manual' -o -name '*.minimal' -o -name '*.new' -o -name '*.strategic' -o -name '*.test*' -o -name '*_deployment_fixed' -o -name '*_fixed_clean' \) -delete

# Remove build logs
find . -maxdepth 1 -name "*.log" -delete

# Remove excessive markdown documentation
find . -maxdepth 1 -name "*.md" -type f | grep -E "(BUILD|DEPLOYMENT|STATUS|GUIDE|REPORT|FIX|COMPLETE|FINAL|COMPREHENSIVE|AVATAR|BUNDLE|EXECUTE|LATEST|MAINTENANCE|METRO|PERMANENT|PHASE|PROJECT|QUICK|REACT|SUMMARY|TARGET|XCODE)" | while read file; do
    echo "  🗑️  Removing: $file"
    rm -f "$file"
done

# Remove excessive scripts (keep only essential ones)
echo "🗑️  Removing excessive scripts..."

# Define essential scripts to keep
ESSENTIAL_SCRIPTS=(
    "build-ios-clean.sh"
    "start-metro.sh"
    "cleanup-project-final.sh"
)

# Remove all other .sh scripts except essential ones
find . -maxdepth 1 -name "*.sh" -type f | while read script; do
    script_name=$(basename "$script")
    keep_script=false
    
    for essential in "${ESSENTIAL_SCRIPTS[@]}"; do
        if [[ "$script_name" == "$essential" ]]; then
            keep_script=true
            break
        fi
    done
    
    if [[ "$keep_script" == false ]]; then
        echo "  🗑️  Removing script: $script_name"
        rm -f "$script"
    fi
done

# Remove temporary directories
echo "🗑️  Removing temporary directories..."
rm -rf tmp_* archive/ Support/ Signing/ Configuration/ Files/

# Remove duplicate Podfile variations
echo "🗑️  Cleaning up iOS Podfile variations..."
find ios/ -maxdepth 1 -name "Podfile.*" ! -name "Podfile.lock" -delete

# Remove duplicate build directories
rm -rf "ios/Pods 2" "ios/build 2"

# Remove other junk files
rm -f typescript env.node eslint.config.js

echo "✅ Cleanup completed!"

# 2. Create proper scripts directory structure
echo "📁 Creating proper scripts directory..."
mkdir -p scripts

echo "✅ Project cleanup completed successfully!"
echo ""
echo "📊 Cleanup Summary:"
echo "   • Removed backup files and logs"
echo "   • Cleaned up excessive documentation"
echo "   • Consolidated scripts to essential ones only"
echo "   • Removed temporary directories"
echo "   • Cleaned iOS Podfile variations"
echo ""
