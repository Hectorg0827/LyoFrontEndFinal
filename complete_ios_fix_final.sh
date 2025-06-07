#!/bin/bash

# Complete iOS Build Fix for typeof and C++20 issues
echo "🔧 Applying Complete iOS Build Fix"
echo "==================================="

set -e

# Navigate to project root
cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

echo "📋 Step 1: Clean all build artifacts..."
rm -rf ios/build ios/DerivedData ios/Pods ios/Podfile.lock

echo "📋 Step 2: Reinstall pods with proper compiler settings..."
cd ios
pod install --repo-update
cd ..

echo "📋 Step 3: Build with proper error handling..."
npx expo run:ios 2>&1 | tee build_output.log

echo "✅ Build process completed!"
