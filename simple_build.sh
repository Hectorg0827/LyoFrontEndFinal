#!/bin/bash

echo "🚀 Starting Build Process for Hector's iPhone"
echo "=============================================="

cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

# Set device ID
DEVICE_ID="CD9B97F1-0CF4-560D-9813-9C10445D2290"

echo "📱 Target Device: Hector's iPhone"
echo "🆔 Device ID: $DEVICE_ID"

# Clean any running processes
echo "🧹 Cleaning processes..."
killall node Metro Simulator 2>/dev/null || true

# Start the build
echo "🔨 Starting build..."
npx expo run:ios --device "$DEVICE_ID" 2>&1 | tee current_build.log

echo "✅ Build process completed!"
echo "📄 Log saved to current_build.log"
