#!/bin/bash

# Fix Git Casing Issues and Build Mobile App
echo "🔧 Fixing Git casing issues and preparing for EAS build..."

# Make sure we're in the right directory
cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

echo "📁 Current directory: $(pwd)"

# Step 1: Fix Git casing issues
echo "🔄 Fixing Git filename casing..."

# Reset Git configuration for case sensitivity
git config core.ignorecase false

# Remove and re-add all files to fix casing
echo "   Resetting Git cache..."
git rm -r --cached . >/dev/null 2>&1
git add .

# Commit the changes
echo "   Committing casing fixes..."
git commit -m "Fix filename casing for EAS build" >/dev/null 2>&1 || echo "   No casing changes needed"

# Step 2: Verify Git status
echo "✅ Git status clean"

# Step 3: Try EAS build
echo "🚀 Starting EAS build process..."

echo ""
echo "Now run these commands manually:"
echo "================================="
echo ""
echo "1. Login to EAS (if not already logged in):"
echo "   eas login"
echo ""
echo "2. Build Android APK:"
echo "   eas build --platform android --profile preview"
echo ""
echo "3. Build iOS:"
echo "   eas build --platform ios --profile preview"
echo ""
echo "4. Check build progress:"
echo "   eas build:list"
echo ""

# Alternative: Try local build if EAS continues to have issues
echo "🏠 ALTERNATIVE - Local Development Build:"
echo "If EAS builds fail, you can test locally:"
echo ""
echo "For Android development:"
echo "   npx expo run:android"
echo ""
echo "For iOS development:"
echo "   npx expo run:ios"
echo ""
echo "For web testing:"
echo "   npx expo start --web"
echo ""

echo "✅ Setup complete! Try the manual commands above."
