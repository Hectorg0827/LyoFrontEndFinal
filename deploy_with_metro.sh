#!/bin/bash

echo "🚀 Starting comprehensive deployment to Hector's iPhone..."

# Kill any existing Metro processes
echo "📱 Cleaning up existing Metro processes..."
pkill -f "expo start" || true
pkill -f "react-native start" || true
pkill -f "metro" || true

# Clear all caches
echo "🧹 Clearing caches..."
cd /Users/republicalatuya/Desktop/LyoFrontEndFinal
rm -rf .expo
rm -rf node_modules/.cache
npx expo install --fix

# Start Metro bundler in background
echo "📦 Starting Metro bundler..."
npx expo start --clear --dev-client &
METRO_PID=$!

echo "⏳ Waiting for Metro to initialize..."
sleep 10

# Check if Metro is running
if ps -p $METRO_PID > /dev/null; then
    echo "✅ Metro bundler started successfully (PID: $METRO_PID)"
else
    echo "❌ Failed to start Metro bundler"
    exit 1
fi

# Wait a bit more for Metro to fully initialize
sleep 5

# Deploy to device
echo "📱 Deploying to Hector's iPhone..."
npx expo run:ios --device --no-build-cache

echo "🎉 Deployment completed!"
echo "📱 Metro bundler is running on PID: $METRO_PID"
echo "🛑 To stop Metro bundler, run: kill $METRO_PID"
