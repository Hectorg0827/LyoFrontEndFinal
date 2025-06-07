#!/bin/zsh

echo "🚀 DIRECT BUILD FOR HECTOR'S IPHONE"
echo "===================================="

cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

# Clean processes
echo "🧹 Cleaning processes..."
pkill -f "expo start" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true
pkill -f "xcodebuild" 2>/dev/null || true
sleep 2

# Check device
echo "📱 Checking device connection..."
DEVICE_ID=$(xcrun devicectl list devices | grep "Hector's iPhone" | awk '{print $4}' | head -1)
if [ -z "$DEVICE_ID" ]; then
    echo "❌ Hector's iPhone not found. Available devices:"
    xcrun devicectl list devices
    exit 1
fi
echo "✅ Found Hector's iPhone: $DEVICE_ID"

# Install dependencies if needed
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing npm packages..."
    npm install
fi

# Install pods if needed
echo "☕ Checking iOS pods..."
if [ ! -d "ios/Pods" ]; then
    echo "Installing CocoaPods..."
    cd ios
    pod install
    cd ..
fi

# Build directly for device
echo "🔨 Building for device..."
npx expo run:ios --device "$DEVICE_ID" --configuration Debug

echo "✅ Build completed!"
