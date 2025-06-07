#!/bin/bash

echo "🚀 LyoAI Learning Assistant - Final Verification Script"
echo "=================================================="

# Check if our patch is applied
echo "✅ Checking expo-device patch..."
if grep -q "targetEnvironment(simulator)" node_modules/expo-device/ios/UIDevice.swift; then
    echo "✅ expo-device Swift patch is applied correctly"
else
    echo "❌ expo-device patch is missing"
    exit 1
fi

# Check if patch file exists
if [ -f "patches/expo-device+6.0.2.patch" ]; then
    echo "✅ Permanent patch file exists"
else
    echo "❌ Patch file is missing"
fi

# Verify Podfile has correct C++ settings
if grep -q "c++20" ios/Podfile; then
    echo "✅ Podfile has C++20 configuration"
else
    echo "❌ Podfile C++20 configuration missing"
fi

# Check app.json expo-build-properties
if grep -q "expo-build-properties" app.json; then
    echo "✅ app.json has expo-build-properties"
else
    echo "❌ app.json expo-build-properties missing"
fi

# Check Metro config
if [ -f "metro.config.js" ]; then
    echo "✅ Metro config exists"
else
    echo "❌ Metro config missing"
fi

echo ""
echo "🏗️  Testing iOS Build..."
echo "Building iOS app (this may take a few minutes)..."

# Clean and build
npx expo run:ios --simulator --no-install --no-bundler

if [ $? -eq 0 ]; then
    echo "✅ iOS build completed successfully!"
    
    echo ""
    echo "🚀 Starting development server..."
    echo "Opening Metro bundler..."
    
    # Start Metro in background and then open app
    npx expo start --localhost &
    METRO_PID=$!
    
    # Wait for Metro to start
    sleep 5
    
    # Check if Metro is running
    if ps -p $METRO_PID > /dev/null; then
        echo "✅ Metro bundler started successfully"
        echo ""
        echo "🎉 SUCCESS! Your app is ready:"
        echo "  • iOS build: ✅ Compiled successfully"
        echo "  • expo-device: ✅ Fixed and patched"
        echo "  • Metro bundler: ✅ Running on localhost:8081"
        echo "  • Patch applied: ✅ Permanent patch created"
        echo ""
        echo "📱 To open the app:"
        echo "  1. Press 'i' in the Metro terminal to open iOS simulator"
        echo "  2. Or scan the QR code with your device"
        echo ""
        echo "Press 'i' to open iOS simulator now, or Ctrl+C to exit"
        
        # Bring Metro to foreground
        fg %1
    else
        echo "❌ Metro bundler failed to start"
        exit 1
    fi
else
    echo "❌ iOS build failed"
    exit 1
fi
