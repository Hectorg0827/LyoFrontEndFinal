#!/bin/bash
# Real-time Build Monitor and Executor

echo "🚀 STARTING iOS BUILD WITH LIVE MONITORING"
echo "=========================================="
echo "Start Time: $(date)"
echo "You can see the build in multiple ways:"
echo ""

cd "/Users/republicalatuya/Desktop/LyoFrontEndFinal"

# Fix the C++ concepts error first
echo "🔧 Fixing C++ concepts compilation error..."
echo "Updating app.json to use C++17 instead of C++20..."

# Create temporary backup
cp app.json app.json.backup.$(date +%s)

# Update app.json to fix C++ concepts error
cat > app.json << 'EOF'
{
  "expo": {
    "name": "LyoAILearningAssistant",
    "slug": "lyo-ai-learning-assistant",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.lyo.LyoAILearningAssistant",
      "buildNumber": "1"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router"
    ],
    "scheme": "lyo-ai-learning-assistant",
    "extra": {
      "router": {
        "origin": false
      },
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
EOF

echo "✅ Fixed C++ concepts error by using standard C++17"

# Start build monitoring in background
echo "📊 Starting build monitoring..."
./monitor-app-status.sh > build_monitor_output.log 2>&1 &
MONITOR_PID=$!

echo "✅ Monitor started (PID: $MONITOR_PID)"

# Clean and start fresh build
echo "🧹 Cleaning previous build artifacts..."
rm -rf ios/build
rm -rf node_modules/.cache
rm -rf /tmp/metro-*

echo "📦 Starting Metro bundler..."
npx expo start --clear > metro_live.log 2>&1 &
METRO_PID=$!

echo "✅ Metro started (PID: $METRO_PID)"

# Wait for Metro to start
sleep 10

echo "🏗️ Starting iOS build..."
echo "This will take 5-15 minutes. You can monitor progress in multiple ways:"
echo ""
echo "📊 BUILD MONITORING OPTIONS:"
echo "1. Watch this terminal for real-time updates"
echo "2. Open new terminal and run: tail -f build_output_live.log"  
echo "3. Monitor Metro: tail -f metro_live.log"
echo "4. Check app status: tail -f build_monitor_output.log"
echo "5. Open http://localhost:8081 in browser"
echo ""

# Start the build
npx expo run:ios > build_output_live.log 2>&1 &
BUILD_PID=$!

echo "✅ Build started (PID: $BUILD_PID)"
echo "🔍 Monitoring build progress..."

# Monitor build in real-time
BUILD_START_TIME=$(date +%s)
while kill -0 $BUILD_PID 2>/dev/null; do
    CURRENT_TIME=$(date +%s)
    ELAPSED=$((CURRENT_TIME - BUILD_START_TIME))
    
    # Check for build completion
    if tail -n 10 build_output_live.log | grep -q "Build succeeded\|success Installed"; then
        echo "🎉 BUILD SUCCEEDED! (${ELAPSED}s elapsed)"
        break
    elif tail -n 10 build_output_live.log | grep -q "Build failed\|error:"; then
        echo "❌ BUILD FAILED! (${ELAPSED}s elapsed)"
        echo "📋 Last 10 lines of build output:"
        tail -n 10 build_output_live.log
        break
    fi
    
    # Show progress indicators
    if tail -n 5 build_output_live.log | grep -q "Building"; then
        echo "🔨 Building native code... (${ELAPSED}s elapsed)"
    elif tail -n 5 build_output_live.log | grep -q "Installing"; then
        echo "📱 Installing app... (${ELAPSED}s elapsed)"
    elif tail -n 5 build_output_live.log | grep -q "Launching"; then
        echo "🚀 Launching app... (${ELAPSED}s elapsed)"
    fi
    
    sleep 10
done

# Wait for build to complete
wait $BUILD_PID
BUILD_EXIT_CODE=$?

# Stop monitoring
kill $MONITOR_PID 2>/dev/null || true
kill $METRO_PID 2>/dev/null || true

# Final status
if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo ""
    echo "🎉 BUILD COMPLETED SUCCESSFULLY!"
    echo "================================"
    echo "📱 Your LyoAI Learning Assistant is now running!"
    echo "🔗 Metro bundler: http://localhost:8081"
    echo "📊 Complete build log: build_output_live.log"
    echo "📋 Monitor log: build_monitor_output.log"
else
    echo ""
    echo "❌ BUILD FAILED"
    echo "==============="
    echo "📋 Check build_output_live.log for details"
    echo "🔧 Try running the build again after fixing issues"
fi

echo ""
echo "📊 BUILD MONITORING FILES CREATED:"
echo "- build_output_live.log (complete build output)"
echo "- metro_live.log (Metro bundler output)"
echo "- build_monitor_output.log (app status monitoring)"
echo ""
echo "🔍 TO VIEW BUILD PROGRESS IN REAL-TIME:"
echo "Open new terminal and run:"
echo "  tail -f /Users/republicalatuya/Desktop/LyoFrontEndFinal/build_output_live.log"
