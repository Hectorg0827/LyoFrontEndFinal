#!/bin/bash

echo "🚀 Starting iOS App Launch Process..."

# Navigate to project directory
cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

echo "📍 Current directory: $(pwd)"

# Check if Metro is running
if pgrep -f "metro" > /dev/null; then
    echo "✅ Metro is already running"
else
    echo "🔄 Starting Metro bundler..."
    npx metro start --port 8081 &
    METRO_PID=$!
    echo "📱 Metro started with PID: $METRO_PID"
    sleep 5
fi

echo "🏗️ Building and running iOS app..."
npx react-native run-ios --simulator="iPhone 15"

echo "🎉 iOS app launch complete!"
