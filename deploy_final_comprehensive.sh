#!/bin/bash

# Comprehensive deployment script for LyoAILearningAssistant to Hector's iPhone
# SDK 53 deployment with full monitoring

set -e  # Exit on any error

echo "🚀 LyoAILearningAssistant Deployment to Hector's iPhone"
echo "=============================================="
echo "Starting deployment at: $(date)"
echo "SDK Version: 53.0.0"
echo "React Native: 0.76.3"
echo "Target Device: CD9B97F1-0CF4-560D-9813-9C10445D2290"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

# 1. Check if device is connected
echo "🔍 Checking device connection..."
if xcrun devicectl list devices | grep -q "CD9B97F1-0CF4-560D-9813-9C10445D2290"; then
    echo "✅ Hector's iPhone is connected"
    xcrun devicectl list devices | grep "CD9B97F1-0CF4-560D-9813-9C10445D2290"
else
    echo "❌ Hector's iPhone not found!"
    echo "Available devices:"
    xcrun devicectl list devices
    exit 1
fi

# 2. Check project structure
echo "🔍 Checking project structure..."
if [ -d "ios" ] && [ -f "ios/Podfile.lock" ]; then
    echo "✅ iOS project is properly configured"
else
    echo "❌ iOS project not found or incomplete"
    exit 1
fi

# 3. Check if Metro bundler is needed
echo "🔍 Checking Metro bundler..."
if pgrep -f "metro" > /dev/null; then
    echo "✅ Metro bundler is running"
else
    echo "⚠️ Starting Metro bundler..."
    npx expo start --dev-client &
    METRO_PID=$!
    sleep 5
fi

echo ""
echo "🏗️ Starting build and deployment..."

# Build and deploy using different methods
echo "Method 1: Expo CLI deployment..."
if npx expo run:ios --device CD9B97F1-0CF4-560D-9813-9C10445D2290 --verbose; then
    echo "✅ Expo deployment successful!"
    SUCCESS=true
else
    echo "⚠️ Expo deployment failed, trying Xcode build..."
    SUCCESS=false
fi

if [ "$SUCCESS" = false ]; then
    echo "Method 2: Direct Xcode build..."
    cd ios
    if xcodebuild -workspace LyoAILearningAssistant.xcworkspace -scheme LyoAILearningAssistant -destination "id=CD9B97F1-0CF4-560D-9813-9C10445D2290" build; then
        echo "✅ Xcode build successful!"
        
        # Install the app
        echo "📱 Installing app on device..."
        if xcodebuild -workspace LyoAILearningAssistant.xcworkspace -scheme LyoAILearningAssistant -destination "id=CD9B97F1-0CF4-560D-9813-9C10445D2290" install; then
            echo "✅ App installation successful!"
            SUCCESS=true
        else
            echo "❌ App installation failed"
        fi
    else
        echo "❌ Xcode build failed"
    fi
    cd ..
fi

# Verification
if [ "$SUCCESS" = true ]; then
    echo ""
    echo "🎉 DEPLOYMENT SUCCESSFUL!"
    echo "=============================================="
    echo "✅ LyoAILearningAssistant has been deployed to Hector's iPhone"
    echo "✅ Device ID: CD9B97F1-0CF4-560D-9813-9C10445D2290"
    echo "✅ SDK Version: 53.0.0"
    echo "✅ React Native: 0.76.3"
    echo "✅ iOS Deployment Target: 15.1"
    echo "✅ Deployment completed at: $(date)"
    echo ""
    echo "📱 The app should now be available on Hector's iPhone!"
    echo "🔍 Check the device for the 'Lyo - AI Learning Assistant' app"
else
    echo ""
    echo "❌ DEPLOYMENT FAILED"
    echo "=============================================="
    echo "Please check the error messages above and resolve any issues."
    echo "Common solutions:"
    echo "1. Ensure device is trusted and unlocked"
    echo "2. Check iOS version compatibility"
    echo "3. Verify developer certificates"
    echo "4. Try connecting via USB cable if using wireless"
fi

# Clean up Metro if we started it
if [ ! -z "$METRO_PID" ]; then
    echo "🧹 Cleaning up Metro bundler..."
    kill $METRO_PID 2>/dev/null || true
fi

echo ""
echo "Deployment script completed at: $(date)"
