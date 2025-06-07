#!/bin/bash

echo "📱 COMPREHENSIVE iOS DEPLOYMENT STATUS"
echo "======================================"
echo "🕐 Current Time: $(date)"
echo ""

# Check project structure
echo "📂 PROJECT STRUCTURE:"
echo "✅ Root project directory: $(pwd)"
if [[ -d "ios" ]]; then
    echo "✅ iOS directory exists"
    echo "📁 iOS directory contents:"
    ls -la ios/ | head -10
else
    echo "❌ iOS directory missing"
fi
echo ""

# Check for workspace
echo "🏗️  XCODE WORKSPACE STATUS:"
if [[ -f "ios/LyoAILearningAssistant.xcworkspace/contents.xcworkspacedata" ]]; then
    echo "✅ Xcode workspace exists"
else
    echo "⏳ Xcode workspace not yet created"
fi

if [[ -f "ios/Podfile.lock" ]]; then
    echo "✅ Podfile.lock exists"
    echo "📦 Installed pods: $(grep -c "^  " ios/Podfile.lock)"
else
    echo "⏳ Podfile.lock not yet created"
fi
echo ""

# Check device connection options
echo "📱 DEVICE CONNECTION STATUS:"
echo "🔍 Checking for connected devices..."

# Method 1: Check USB devices
USB_DEVICES=$(system_profiler SPUSBDataType 2>/dev/null | grep -i iphone | wc -l)
if [[ $USB_DEVICES -gt 0 ]]; then
    echo "✅ iPhone detected via USB ($USB_DEVICES device(s))"
else
    echo "⚠️  No iPhone detected via USB"
fi

# Method 2: Check with instruments
INSTRUMENTS_DEVICES=$(xcrun instruments -s devices 2>/dev/null | grep -E "iPhone.*\]$" | grep -v Simulator | wc -l)
if [[ $INSTRUMENTS_DEVICES -gt 0 ]]; then
    echo "✅ iPhone detected via instruments ($INSTRUMENTS_DEVICES device(s))"
    echo "📱 Available devices:"
    xcrun instruments -s devices 2>/dev/null | grep -E "iPhone.*\]$" | grep -v Simulator
else
    echo "⚠️  No iPhone detected via instruments"
fi

echo ""
echo "🔧 TROUBLESHOOTING STEPS:"
echo "1. Connect your iPhone via USB cable"
echo "2. Unlock your iPhone"  
echo "3. When prompted, tap 'Trust This Computer'"
echo "4. Ensure Developer Mode is enabled:"
echo "   Settings > Privacy & Security > Developer Mode > ON"
echo "5. Make sure your iPhone is not in DFU or Recovery mode"
echo ""

# Check for running processes
echo "⚙️  ACTIVE PROCESSES:"
if pgrep -f "pod install" > /dev/null; then
    echo "✅ CocoaPods installation running"
fi

if pgrep -f "expo" > /dev/null; then
    echo "✅ Expo process running"
fi

if pgrep -f "xcodebuild" > /dev/null; then
    echo "✅ Xcode build process running"
fi

echo ""
echo "🎯 NEXT STEPS:"
echo "1. Wait for CocoaPods installation to complete"
echo "2. Connect your iPhone if not already connected"
echo "3. Run: npx expo run:ios --device"
echo "4. Select your device when prompted"
echo ""
