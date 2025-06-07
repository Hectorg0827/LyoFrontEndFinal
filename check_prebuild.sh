#!/bin/bash

echo "📱 Real-time iOS Build Status Monitor"
echo "===================================="
echo "Time: $(date)"
echo ""

while true; do
    # Check if iOS directory exists
    if [[ -d "ios" ]]; then
        echo "✅ iOS project directory created!"
        ls -la ios/ 2>/dev/null | head -5
        break
    fi
    
    # Check for any running Expo processes
    if pgrep -f "expo" > /dev/null; then
        echo "⏳ Expo prebuild in progress... $(date +%H:%M:%S)"
    else
        echo "⚠️  No Expo process detected at $(date +%H:%M:%S)"
    fi
    
    sleep 5
done

echo ""
echo "🎉 Prebuild completed! Checking iOS project..."
if [[ -f "ios/Podfile" ]]; then
    echo "✅ Podfile found"
fi

if [[ -f "ios/LyoApp.xcworkspace" ]] || [[ -f "ios/LyoApp.xcodeproj" ]]; then
    echo "✅ Xcode project/workspace found"
fi

echo ""
echo "📱 Now connect your iPhone and we'll start the device build!"
