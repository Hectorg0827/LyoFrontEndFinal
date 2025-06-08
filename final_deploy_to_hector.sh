#!/bin/bash

# Final deployment script for Hector's iPhone
# LyoAILearningAssistant SDK 53 deployment

echo "🚀 Starting final deployment to Hector's iPhone..."
echo "Device ID: CD9B97F1-0CF4-560D-9813-9C10445D2290"
echo "Timestamp: $(date)"

# Check device connection
echo "📱 Checking device connection..."
xcrun devicectl list devices | grep "CD9B97F1-0CF4-560D-9813-9C10445D2290"

if [ $? -ne 0 ]; then
    echo "❌ Hector's iPhone not found. Please ensure it's connected and trusted."
    exit 1
fi

echo "✅ Device connected successfully!"

# Check project status
echo "📋 Project status:"
echo "- SDK Version: 53.0.0"
echo "- React Native: 0.76.3"
echo "- iOS Deployment Target: 15.1"

# Deploy with monitoring
echo "🏗️ Building and deploying..."
npx expo run:ios --device CD9B97F1-0CF4-560D-9813-9C10445D2290 --verbose

echo "🎉 Deployment completed!"
echo "Timestamp: $(date)"
