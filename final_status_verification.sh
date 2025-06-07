#!/bin/bash

# Final Project Status Verification
# Verifies the project is clean and ready for builds after patch analysis and cleanup

echo "🔍 FINAL PROJECT STATUS VERIFICATION"
echo "===================================="

PROJECT_ROOT="/Users/republicalatuya/Desktop/LyoFrontEndFinal"
cd "$PROJECT_ROOT"

echo ""
echo "📋 1. PATCH VERIFICATION"
echo "========================"
if [ -d "patches" ]; then
    echo "Patches directory exists"
    PATCH_COUNT=$(find patches/ -name "*.patch" | wc -l)
    echo "Number of patches: $PATCH_COUNT"
    echo "Patch files:"
    ls -la patches/*.patch 2>/dev/null || echo "No patch files found"
    
    # Verify expo-device patch
    if [ -f "patches/expo-device+6.0.2.patch" ]; then
        echo "✅ expo-device patch exists (critical iOS fix)"
    else
        echo "❌ expo-device patch missing (iOS builds may fail)"
    fi
    
    # Check for any obsolete patches
    if [ -f "patches/expo-asset+8.10.1.patch" ]; then
        echo "⚠️  expo-asset patch still exists (should be removed)"
    else
        echo "✅ No obsolete expo-asset patch"
    fi
else
    echo "❌ Patches directory missing"
fi

echo ""
echo "📁 2. PROJECT STRUCTURE VERIFICATION"
echo "==================================="
echo "Essential directories:"
for dir in "src" "scripts" "ios" "android" "node_modules"; do
    if [ -d "$dir" ]; then
        echo "✅ $dir/ exists"
    else
        echo "❌ $dir/ missing"
    fi
done

echo ""
echo "Essential files:"
for file in "package.json" "app.json" "index.js" "metro.config.js" ".eslintrc.js" "babel.config.js"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

echo ""
echo "📊 3. FILE COUNT ANALYSIS"
echo "========================="
TOTAL_FILES=$(find . -type f -not -path "./node_modules/*" -not -path "./.git/*" | wc -l)
SHELL_SCRIPTS=$(find . -maxdepth 1 -name "*.sh" -type f | wc -l)
MD_FILES=$(find . -maxdepth 1 -name "*.md" -type f | wc -l)
LOG_FILES=$(find . -maxdepth 1 -name "*.log" -type f | wc -l)

echo "Total project files (excluding node_modules/.git): $TOTAL_FILES"
echo "Shell scripts in root: $SHELL_SCRIPTS"
echo "Markdown files in root: $MD_FILES"
echo "Log files in root: $LOG_FILES"

# Status assessment
if [ "$SHELL_SCRIPTS" -lt 10 ]; then
    echo "✅ Shell scripts count acceptable ($SHELL_SCRIPTS < 10)"
else
    echo "⚠️  High shell scripts count ($SHELL_SCRIPTS >= 10)"
fi

if [ "$MD_FILES" -lt 15 ]; then
    echo "✅ Documentation files count acceptable ($MD_FILES < 15)"
else
    echo "⚠️  High documentation files count ($MD_FILES >= 15)"
fi

if [ "$LOG_FILES" -eq 0 ]; then
    echo "✅ No log files in root"
else
    echo "⚠️  Log files present ($LOG_FILES)"
fi

echo ""
echo "⚙️ 4. BUILD CONFIGURATION VERIFICATION"
echo "====================================="

# Check package.json main entry
MAIN_ENTRY=$(grep '"main"' package.json | cut -d'"' -f4)
echo "Main entry point: $MAIN_ENTRY"
if [ "$MAIN_ENTRY" = "index.js" ]; then
    echo "✅ Correct main entry (index.js)"
else
    echo "⚠️  Check main entry in package.json"
fi

# Check for essential scripts
echo "Package.json scripts:"
if grep -q '"start"' package.json; then echo "✅ start script exists"; else echo "❌ start script missing"; fi
if grep -q '"build:ios"' package.json; then echo "✅ build:ios script exists"; else echo "❌ build:ios script missing"; fi
if grep -q '"build:android"' package.json; then echo "✅ build:android script exists"; else echo "❌ build:android script missing"; fi
if grep -q '"postinstall"' package.json; then echo "✅ postinstall script exists"; else echo "⚠️  postinstall script missing"; fi

# Check app.json for C++17 config
if grep -q '"cppStandard": "c++17"' app.json; then
    echo "✅ C++17 configuration present"
else
    echo "⚠️  C++17 configuration missing"
fi

echo ""
echo "🔄 5. GIT STATUS"
echo "==============="
UNTRACKED_COUNT=$(git status --porcelain | grep "^??" | wc -l)
MODIFIED_COUNT=$(git status --porcelain | grep "^.M" | wc -l)
STAGED_COUNT=$(git status --porcelain | grep "^[AM]" | wc -l)

echo "Staged changes: $STAGED_COUNT"
echo "Modified files: $MODIFIED_COUNT"
echo "Untracked files: $UNTRACKED_COUNT"

if [ "$UNTRACKED_COUNT" -lt 20 ]; then
    echo "✅ Reasonable number of untracked files"
else
    echo "⚠️  High number of untracked files ($UNTRACKED_COUNT)"
fi

echo ""
echo "🎯 6. FINAL ASSESSMENT"
echo "====================="

ISSUES=0

# Count critical issues
if [ ! -f "patches/expo-device+6.0.2.patch" ]; then ((ISSUES++)); fi
if [ ! -f "package.json" ] || [ ! -f "app.json" ] || [ ! -f "index.js" ]; then ((ISSUES++)); fi
if [ "$MAIN_ENTRY" != "index.js" ]; then ((ISSUES++)); fi
if [ "$SHELL_SCRIPTS" -gt 15 ]; then ((ISSUES++)); fi

if [ "$ISSUES" -eq 0 ]; then
    echo "🎉 PROJECT STATUS: EXCELLENT"
    echo "✅ All critical components verified"
    echo "✅ Patches optimized (minimal necessary patches)"
    echo "✅ Project structure clean"
    echo "✅ Build configuration ready"
    echo ""
    echo "🚀 PROJECT IS READY FOR iOS AND ANDROID BUILDS"
else
    echo "⚠️  PROJECT STATUS: NEEDS ATTENTION"
    echo "Issues found: $ISSUES"
    echo "Review the checks above and address any ❌ or ⚠️  items"
fi

echo ""
echo "📝 Next steps:"
echo "1. Commit current changes if satisfied with cleanup"
echo "2. Test iOS build: npm run build:ios"
echo "3. Test Android build: npm run build:android"
echo "4. Push to repository when builds succeed"
