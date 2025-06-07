#!/bin/zsh

echo "🚀 Simple App Rebuild with SDK 53"
echo "=================================="

# Step 1: Navigate to project
cd /Users/republicalatuya/Desktop/LyoFrontEndFinal
echo "📂 In directory: $(pwd)"

# Step 2: Stop any running Metro
echo "🛑 Stopping Metro processes..."
pkill -f "expo start" || true
pkill -f "metro" || true
sleep 2

# Step 3: Clean caches
echo "🧹 Cleaning caches..."
rm -rf .expo/
rm -rf node_modules/.cache/
rm -rf ios/build/

# Step 4: Clean install pods
echo "☕ Reinstalling CocoaPods..."
cd ios
rm -rf Pods/ Podfile.lock
pod install
cd ..

# Step 5: Build the app
echo "📱 Building app for device..."
npx expo run:ios --device --no-bundler

echo "✅ Build command executed!"
