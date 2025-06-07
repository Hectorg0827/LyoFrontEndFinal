#!/bin/bash
echo "🚀 Starting iOS Device Deployment..."
echo "Time: $(date)"
echo "=================================="

cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

echo "✅ Checking device connection..."
if xcrun devicectl list devices &>/dev/null; then
    echo "✅ Device tools available"
else
    echo "⚠️  Using alternative device detection"
fi

echo "✅ Starting Expo iOS build for device..."
npx expo run:ios --device --verbose
