#!/bin/zsh

echo "🚀 METRO BUNDLER STARTER FOR LYOAI APP"
echo "======================================"
echo ""
echo "Current Status:"
echo "✅ App installed on iPhone"
echo "✅ Initialization screen showing"
echo "🔄 Metro bundler needed to load JavaScript"
echo ""

# Navigate to project
cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

echo "📂 Project directory: $(pwd)"

# Kill any existing Metro processes
pkill -f "expo start" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true

echo ""
echo "🚀 Starting Metro bundler with tunnel mode..."
echo "This will allow your iPhone to connect from anywhere"
echo ""

# Start Metro bundler
npx expo start --tunnel

echo ""
echo "✅ Metro bundler started!"
echo ""
echo "📱 NOW ON YOUR IPHONE:"
echo "1. Shake the device (physical shake gesture)"
echo "2. Developer menu will appear"
echo "3. Tap 'Reload' or 'Refresh'"
echo "4. App will connect and load the main interface"
echo ""
echo "🎉 Deployment will be complete!"
