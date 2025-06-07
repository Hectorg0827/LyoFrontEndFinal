#!/bin/bash

echo "🚀 Comprehensive deployment fix for 'No bundle URL present' error"
echo "=================================================="

# Step 1: Kill existing processes
echo "🧹 Cleaning up processes..."
pkill -f "expo start" || true
pkill -f "react-native start" || true
pkill -f "metro" || true
sleep 2

# Step 2: Navigate to project
cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

# Step 3: Clear caches
echo "🗑️  Clearing caches..."
rm -rf .expo
rm -rf node_modules/.cache
rm -rf ios/build
watchman watch-del-all 2>/dev/null || true

# Step 4: Start Metro bundler properly
echo "📦 Starting Metro bundler..."
npx expo start --clear --localhost &
METRO_PID=$!
echo "Metro PID: $METRO_PID"

# Step 5: Wait for Metro to initialize
echo "⏳ Waiting for Metro to start..."
sleep 15

# Step 6: Verify Metro is running
if curl -s http://localhost:8081/status > /dev/null 2>&1; then
    echo "✅ Metro bundler is running and accessible"
else
    echo "⚠️  Metro bundler may not be fully ready, but continuing..."
fi

# Step 7: Build and deploy
echo "📱 Building and deploying to device..."
npx expo run:ios --device --clear

echo "🎉 Deployment script completed!"
echo "📝 If you still get 'No bundle URL present', try:"
echo "   1. Make sure your iPhone and Mac are on the same WiFi network"
echo "   2. Shake the device and select 'Configure Bundle' to manually set the Metro URL"
echo "   3. The Metro URL should be: http://[YOUR_MAC_IP]:8081"
