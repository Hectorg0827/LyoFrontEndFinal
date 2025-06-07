#!/bin/bash

# Complete Metro Server Fix and App Connection Script
echo "🔧 Fixing Metro Bundler Connection Issue"
echo "========================================"

set -e

# Navigate to project
cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

# Step 1: Kill any existing Metro processes
echo "🧹 Cleaning Metro processes..."
pkill -f "expo start" 2>/dev/null || true
pkill -f "react-native start" 2>/dev/null || true
lsof -ti:8081 | xargs kill -9 2>/dev/null || true

# Step 2: Clear all caches
echo "🧹 Clearing all caches..."
rm -rf node_modules/.cache
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-map-*
rm -rf ~/.expo/

# Step 3: Reset Metro configuration
echo "🔧 Resetting Metro configuration..."
npx expo install --fix

# Step 4: Start Metro with proper network configuration
echo "🚀 Starting Metro bundler with network configuration..."
export REACT_NATIVE_PACKAGER_HOSTNAME=$(ipconfig getifaddr en0 || echo "localhost")
export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

echo "📡 Using IP address: $REACT_NATIVE_PACKAGER_HOSTNAME"
echo "🌐 Starting Expo development server..."

# Start Expo with tunnel mode for better connectivity
npx expo start --tunnel --clear

echo "✅ Metro bundler should now be accessible from your iOS app!"
echo "📱 Reload your app or press 'r' in the terminal to refresh"
