#!/bin/bash

echo "🚀 Monitoring final deployment to Hector's iPhone..."
echo "Target Device: CD9B97F1-0CF4-560D-9813-9C10445D2290 (Hector's iPhone)"
echo "Deployment Target: iOS 15.1"
echo "React Native: 0.76.3"
echo "Expo SDK: 53.0.0"
echo "Time: $(date)"
echo "=========================="

# Function to check build progress
check_build_progress() {
    echo "📊 Checking build status..."
    
    # Check for Xcode build process
    if pgrep -f "xcodebuild" > /dev/null; then
        echo "✅ Xcode build process is running"
        
        # Check if there are any current build logs
        if [ -d "ios/build" ]; then
            echo "📁 Build directory exists"
            find ios/build -name "*.log" -mtime 0 | head -3
        fi
    else
        echo "⚠️ No active Xcode build process detected"
    fi
    
    # Check device connectivity
    echo "📱 Device Status:"
    xcrun devicectl list devices | grep "CD9B97F1-0CF4-560D-9813-9C10445D2290" || echo "❌ Device not found"
    
    # Check for Metro bundler
    if pgrep -f "metro" > /dev/null; then
        echo "📦 Metro bundler is running"
    else
        echo "⚠️ Metro bundler not detected"
    fi
    
    echo "------------------------"
}

# Monitor every 30 seconds
while true; do
    check_build_progress
    sleep 30
done
