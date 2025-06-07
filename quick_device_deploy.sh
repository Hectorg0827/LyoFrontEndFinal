#!/bin/bash
# Quick device deployment for Hector's iPhone

echo "📱 DEPLOYING TO HECTOR'S IPHONE"
echo "==============================="
echo "Start Time: $(date)"

cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

# Check device connection
echo "🔍 Checking for connected iPhone..."
system_profiler SPUSBDataType | grep -A 5 -i "iphone" || echo "No iPhone detected via system_profiler"

# Quick dependency install
echo "📦 Installing dependencies..."
npm install

# Apply patches
echo "🔧 Applying patches..."
npx patch-package

# Clean build
echo "🧹 Cleaning build artifacts..."
rm -rf ios/build
rm -rf ios/Pods
rm -rf ios/Podfile.lock

# Generate iOS project
echo "🏗️ Generating iOS project..."
npx expo prebuild --platform ios --clean

# Install pods
echo "🍫 Installing CocoaPods..."
cd ios && pod install && cd ..

# Start Metro
echo "📦 Starting Metro bundler..."
npx expo start --clear &
METRO_PID=$!

# Wait for Metro
sleep 10

# Build for device
echo "🚀 Building and deploying to device..."
echo "📱 Make sure Hector's iPhone is connected and trusted!"
npx expo run:ios --device

echo "✅ Deployment attempt completed!"
echo "Check Hector's iPhone for the LyoAI Learning Assistant app"
