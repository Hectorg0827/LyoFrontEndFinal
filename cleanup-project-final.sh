#!/bin/bash

# Project Cleanup Script - Remove Accumulated Build Artifacts
# This script removes all the accumulated scripts and files, keeping only essentials

set -e

echo "🧹 Cleaning up Lyo AI Learning Assistant project"
echo "==============================================="

# Define files to keep (essential scripts and configs)
KEEP_FILES=(
    "build-ios-clean.sh"
    "start-metro.sh" 
    "cleanup-project-final.sh"
    "package.json"
    "app.json"
    "metro.config.js"
    "babel.config.js"
    "tsconfig.json"
    "README.md"
    ".gitignore"
    "yarn.lock"
    "package-lock.json"
)

# Remove all build/fix scripts except essential ones
echo "🗑️  Removing accumulated build scripts..."
find . -maxdepth 1 -name "*.sh" -type f | while read script; do
    script_name=$(basename "$script")
    keep_script=false
    
    for keep_file in "${KEEP_FILES[@]}"; do
        if [[ "$script_name" == "$keep_file" ]]; then
            keep_script=true
            break
        fi
    done
    
    if [[ "$keep_script" == false ]]; then
        echo "  🗑️  $script_name"
        rm -f "$script"
    fi
done

# Remove excessive documentation
echo "🗑️  Removing excessive documentation..."
find . -maxdepth 1 -name "*.md" -type f | while read doc; do
    doc_name=$(basename "$doc")
    if [[ "$doc_name" != "README.md" && "$doc_name" =~ (BUILD|DEPLOYMENT|STATUS|GUIDE|REPORT|FIX|COMPLETE|FINAL|COMPREHENSIVE) ]]; then
        echo "  🗑️  $doc_name"
        rm -f "$doc"
    fi
done

# Remove build logs
echo "🗑️  Removing build logs..."
find . -maxdepth 1 -name "*.log" -type f -exec rm -f {} \;

# Remove backup files
echo "🗑️  Removing backup files..."
find . -maxdepth 1 \( -name "*.backup*" -o -name "*.clean" -o -name "*.fixed" -o -name "*.manual" -o -name "*.minimal" -o -name "*.new" -o -name "*.strategic" -o -name "*.test*" \) -type f -exec rm -f {} \;

# Remove duplicate directories
echo "🗑️  Removing duplicate build directories..."
rm -rf "ios/Pods 2" "ios/build 2"

# Remove temporary directories
echo "🗑️  Removing temporary directories..."
rm -rf tmp_* archive/

# Clean up unnecessary config variations
echo "🗑️  Removing config variations..."
find ios/ -maxdepth 1 -name "Podfile.*" ! -name "Podfile.lock" -exec rm -f {} \;

echo ""
echo "✅ Project cleanup completed!"
echo ""
echo "📁 Essential files remaining:"
echo "   • build-ios-clean.sh     - Main iOS build script"
echo "   • start-metro.sh         - Metro development server"
echo "   • package.json           - Dependencies configuration"
echo "   • app.json              - Expo configuration"
echo "   • metro.config.js       - Metro bundler configuration"
echo "   • ios/Podfile           - iOS dependencies"
echo "   • patches/              - Essential patches (expo-device fix)"
echo ""
echo "🎯 To build your app:"
echo "   chmod +x build-ios-clean.sh && ./build-ios-clean.sh"
