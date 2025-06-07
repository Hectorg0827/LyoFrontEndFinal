#!/bin/bash
# EXECUTE THIS SCRIPT TO DEPLOY TO HECTOR'S IPHONE
# Run: bash DEPLOY_NOW.sh

echo "📱 DEPLOYING LYOAI LEARNING ASSISTANT TO HECTOR'S IPHONE"
echo "========================================================"
echo "Start Time: $(date)"
echo ""

# Ensure we're in the right directory
cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

echo "🔍 Phase 1: Checking device connection..."
echo "Looking for Hector's iPhone..."
system_profiler SPUSBDataType | grep -A 3 -i "iphone" || echo "⚠️ iPhone not detected - make sure it's connected and trusted"
echo ""

echo "🧹 Phase 2: Cleaning build environment..."
rm -rf ios/build
rm -rf ios/Pods
rm -rf ios/Podfile.lock
rm -rf node_modules/.cache
echo "✅ Build artifacts cleaned"
echo ""

echo "📦 Phase 3: Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

echo "🔧 Phase 4: Applying patches..."
npx patch-package
echo "✅ Patches applied"
echo ""

echo "🏗️ Phase 5: Generating iOS project..."
npx expo prebuild --platform ios --clean
echo "✅ iOS project generated"
echo ""

echo "🍫 Phase 6: Installing CocoaPods..."
cd ios
pod install --repo-update
cd ..
echo "✅ CocoaPods installed"
echo ""

echo "📦 Phase 7: Starting Metro bundler..."
echo "Opening Metro in background..."
npx expo start --clear &
METRO_PID=$!
echo "Metro started with PID: $METRO_PID"
echo "Waiting 15 seconds for Metro to initialize..."
sleep 15
echo ""

echo "🚀 Phase 8: Building and deploying to device..."
echo ""
echo "📱 IMPORTANT: Make sure Hector's iPhone is:"
echo "   ✅ Connected via USB"
echo "   ✅ Unlocked and trusted this computer"
echo "   ✅ Developer mode enabled"
echo ""
echo "Starting device build..."

# Build for device
npx expo run:ios --device

echo ""
echo "🎉 DEPLOYMENT COMPLETED!"
echo "========================"
echo "✅ LyoAI Learning Assistant should now be installed on Hector's iPhone"
echo "✅ Look for the app on the iPhone home screen"
echo "✅ Metro bundler is running at http://localhost:8081"
echo ""
echo "📋 Next steps:"
echo "1. Tap the LyoAI Learning Assistant app on Hector's iPhone"
echo "2. Grant any requested permissions"
echo "3. The app should connect to Metro automatically"
echo "4. Shake the device to access developer menu if needed"
echo ""
echo "Deployment completed at: $(date)"
