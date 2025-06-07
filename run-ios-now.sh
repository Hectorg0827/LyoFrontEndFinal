#!/bin/bash
# EXECUTE THIS SCRIPT TO BUILD AND RUN iOS APP
# Run: ./run-ios-now.sh

echo "🚀 BUILDING AND RUNNING LYO AI LEARNING ASSISTANT ON iOS"
echo "========================================================"
echo "Start Time: $(date)"
echo ""

# Navigate to project
cd "/Users/republicalatuya/Desktop/LyoFrontEndFinal"

# Phase 1: Clean Environment
echo "🧹 Phase 1: Cleaning environment..."
rm -rf ios/build ios/Pods ios/Podfile.lock
rm -rf node_modules/.cache /tmp/metro-* /tmp/react-*
echo "✅ Environment cleaned"

# Phase 2: Install Dependencies
echo "📦 Phase 2: Installing dependencies..."
npm install
echo "✅ Dependencies installed"

# Phase 3: Apply Patches
echo "🔧 Phase 3: Applying patches..."
npx patch-package
echo "✅ Critical expo-device Swift patch applied"

# Phase 4: Regenerate iOS Project
echo "🏗️ Phase 4: Regenerating iOS project..."
npx expo prebuild --platform ios --clean
echo "✅ iOS project regenerated"

# Phase 5: Install CocoaPods
echo "🍫 Phase 5: Installing CocoaPods..."
cd ios
pod install --repo-update
cd ..
echo "✅ CocoaPods installed"

# Phase 6: Start Metro (in background)
echo "📦 Phase 6: Starting Metro bundler..."
npx expo start --clear > metro.log 2>&1 &
METRO_PID=$!
echo "✅ Metro started (PID: $METRO_PID)"

# Wait for Metro to be ready
echo "⏳ Waiting for Metro to be ready..."
sleep 15

# Phase 7: Build and Run iOS
echo "🚀 Phase 7: Building and running iOS app..."
echo "This will take 5-15 minutes..."
npx expo run:ios

echo ""
echo "🎉 BUILD PROCESS COMPLETED!"
echo "=========================="
echo "Your LyoAI Learning Assistant should now be running on iOS!"
echo ""
echo "📊 Monitoring URLs:"
echo "- Metro Bundler: http://localhost:8081"
echo "- Expo Dev Tools: Check terminal output for URL"
echo ""
echo "📱 The app should now be visible in your iOS Simulator"
