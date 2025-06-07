#!/bin/bash
# QUICK FIX: Development Build for Hector's iPhone (bypasses Expo Go)

echo "🔧 QUICK FIX: Building Development Build for Hector's iPhone"
echo "=========================================================="
echo "📱 This creates a CUSTOM APP (not Expo Go) - no SDK conflicts!"
echo ""

cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies first..."
    npm install
fi

# Apply patches
echo "🔧 Applying patches..."
npx patch-package

# Clean iOS build
echo "🧹 Cleaning iOS build artifacts..."
rm -rf ios/build ios/Pods ios/Podfile.lock

# Generate iOS project
echo "🏗️ Generating iOS project..."
npx expo prebuild --platform ios --clean

# Install pods
echo "🍫 Installing CocoaPods..."
cd ios
pod repo update
pod install --repo-update
cd ..

# Start Metro for development build
echo "📦 Starting Metro bundler for development build..."
npx expo start --dev-client --clear &
METRO_PID=$!
echo "Metro PID: $METRO_PID"
sleep 10

# Build development build for device
echo ""
echo "🚀 BUILDING DEVELOPMENT BUILD FOR HECTOR'S IPHONE"
echo "=================================================="
echo "📱 This creates YOUR CUSTOM APP - not Expo Go"
echo "✅ No SDK version conflicts"
echo "✅ Direct installation on device"
echo ""
echo "Make sure Hector's iPhone is connected and trusted!"
echo ""

# Use run:ios with device flag for development build
npx expo run:ios --device

echo ""
echo "🎉 DEVELOPMENT BUILD DEPLOYMENT COMPLETED!"
echo "=========================================="
echo "✅ Custom LyoAI app should now be on Hector's iPhone"
echo "✅ Look for 'Lyo - AI Learning Assistant' (NOT Expo Go)"
echo "✅ This is your own app - no SDK restrictions"
echo ""
echo "Deployment completed at: $(date)"
