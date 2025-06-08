#!/bin/bash

echo "🚀 Starting Metro Bundler for LyoAI Learning Assistant..."
echo "📱 This will complete the deployment to Hector's iPhone"
echo ""

cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

echo "📂 Current directory: $(pwd)"
echo "📦 Starting Metro with tunnel mode..."
echo ""

# Start Metro bundler with tunnel for device connection
npx expo start --tunnel

echo ""
echo "✅ Metro bundler is now running!"
echo ""
echo "📱 ON HECTOR'S IPHONE:"
echo "1. Shake the device (physical shake gesture)"
echo "2. Developer menu will appear"  
echo "3. Tap 'Reload' or 'Refresh'"
echo "4. App will connect and load the main interface"
echo ""
echo "🎉 Deployment will be 100% complete!"
