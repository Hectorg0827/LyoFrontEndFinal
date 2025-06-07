#!/bin/bash

# Fix Build and Deploy Script for SDK 53
# This script addresses all known build issues and deploys to iPhone

set -e

echo "🔧 Fixing build issues and deploying to iPhone..."

# Clean environment
echo "🧹 Cleaning environment..."
killall node 2>/dev/null || true
killall Metro 2>/dev/null || true
killall Simulator 2>/dev/null || true

# Navigate to project
cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

# Clean node modules and caches
echo "🗑️ Cleaning caches..."
rm -rf node_modules
rm -f package-lock.json
rm -rf ~/.expo
rm -rf /tmp/metro-*
rm -rf /tmp/react-native-*

# Clean iOS build artifacts
echo "🍎 Cleaning iOS artifacts..."
cd ios
rm -rf Pods
rm -f Podfile.lock
rm -rf build
rm -rf DerivedData
cd ..

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Fix any dependency issues
echo "🔧 Fixing dependencies..."
npx expo install --fix

# Reinstall iOS pods
echo "🔄 Installing iOS pods..."
cd ios
pod cache clean --all
pod install --repo-update
cd ..

# Create a proper build command that handles device selection
echo "📱 Building and deploying to iPhone..."

# Get device list and find Hector's iPhone
DEVICE_ID=$(xcrun devicectl list devices | grep "Hector's iPhone" | awk '{print $4}' | head -1)

if [ -z "$DEVICE_ID" ]; then
    echo "❌ Could not find Hector's iPhone. Available devices:"
    xcrun devicectl list devices
    exit 1
fi

echo "✅ Found Hector's iPhone with ID: $DEVICE_ID"

# Start Metro bundler in background
echo "🚀 Starting Metro bundler..."
npx expo start --dev-client --clear &
METRO_PID=$!

# Wait for Metro to start
sleep 10

# Build and install on device
echo "📲 Building and installing on device..."
npx expo run:ios --device "$DEVICE_ID" --clear || {
    echo "❌ Build failed. Checking for common issues..."
    
    # Try alternative build method
    echo "🔄 Trying alternative build method..."
    npx react-native run-ios --device "$DEVICE_ID"
}

# Clean up
kill $METRO_PID 2>/dev/null || true

echo "✅ Build and deployment completed!"
echo "📱 Check your iPhone for the LyoAILearningAssistant app"
