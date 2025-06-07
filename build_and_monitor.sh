#!/bin/bash

# iOS Build Monitor Script
# This script will execute the iOS build and monitor progress

set -e

echo "🚀 STARTING iOS BUILD PROCESS"
echo "=============================="
echo "Project: LyoAILearningAssistant"
echo "Date: $(date)"
echo "Location: /Users/republicalatuya/Desktop/LyoFrontEndFinal"
echo ""

cd "/Users/republicalatuya/Desktop/LyoFrontEndFinal"

# Function to log with timestamp
log() {
    echo "[$(date '+%H:%M:%S')] $1"
}

# Step 1: Verify project setup
log "🔍 Verifying project setup..."
if [ ! -f "package.json" ]; then
    log "❌ package.json not found!"
    exit 1
fi

if [ ! -f "app.json" ]; then
    log "❌ app.json not found!"
    exit 1
fi

log "✅ Project files verified"

# Step 2: Check dependencies
log "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    log "🔄 Installing npm dependencies..."
    npm install
    log "✅ Dependencies installed"
else
    log "✅ Dependencies already installed"
fi

# Step 3: Verify patches
log "🩹 Verifying patches..."
if [ -f "patches/expo-device+6.0.2.patch" ]; then
    log "✅ Essential expo-device patch found"
else
    log "⚠️  Warning: expo-device patch not found"
fi

# Step 4: Apply patches
log "🔧 Applying patches..."
npx patch-package
log "✅ Patches applied"

# Step 5: Check iOS directory
log "🍎 Checking iOS setup..."
if [ ! -d "ios" ]; then
    log "🔄 Generating iOS project..."
    npx expo run:ios --no-build-cache
else
    log "✅ iOS directory exists"
fi

# Step 6: Install iOS dependencies
log "📱 Installing iOS dependencies..."
cd ios
if [ -f "Podfile" ]; then
    log "🔄 Running pod install..."
    pod install --repo-update
    log "✅ CocoaPods installed"
fi
cd ..

# Step 7: Start the build
log "🔨 Starting iOS build..."
log "This may take several minutes..."
echo ""
echo "📱 BUILD PROGRESS:"
echo "=================="

# Run the build with detailed output
npx expo run:ios --device --verbose

log "🎉 Build process completed!"
echo ""
echo "✅ iOS app should now be installed and running on device"
echo "📱 Check your iOS device for the LyoAILearningAssistant app"
