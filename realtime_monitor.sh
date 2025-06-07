#!/bin/bash

# Real-time Build Monitor and Deploy Script
# This script monitors the build process and provides detailed feedback

set -e

PROJECT_DIR="/Users/republicalatuya/Desktop/LyoFrontEndFinal"
LOG_FILE="$PROJECT_DIR/realtime_build.log"
DEVICE_ID="CD9B97F1-0CF4-560D-9813-9C10445D2290"

echo "🚀 LyoAILearningAssistant - Real-time Build Monitor"
echo "=================================================="
echo "Target Device: Hector's iPhone ($DEVICE_ID)"
echo "Project: $PROJECT_DIR"
echo "Log File: $LOG_FILE"
echo "=================================================="

cd "$PROJECT_DIR"

# Clean up any existing processes
echo "🧹 Cleaning up processes..."
killall node 2>/dev/null || true
killall Metro 2>/dev/null || true
killall Simulator 2>/dev/null || true

# Clear the log file
> "$LOG_FILE"

# Function to show build progress
monitor_build() {
    echo "📊 Monitoring build progress..."
    tail -f "$LOG_FILE" &
    TAIL_PID=$!
    
    # Build the app
    npx expo run:ios --device "$DEVICE_ID" > "$LOG_FILE" 2>&1 &
    BUILD_PID=$!
    
    # Wait for build to complete
    wait $BUILD_PID
    BUILD_STATUS=$?
    
    # Stop monitoring
    kill $TAIL_PID 2>/dev/null || true
    
    return $BUILD_STATUS
}

# Start the build process
echo "🔨 Starting build process..."
if monitor_build; then
    echo "✅ BUILD SUCCESSFUL!"
    echo "📱 App should now be installed on Hector's iPhone"
    echo "🎉 Deployment completed successfully!"
else
    echo "❌ BUILD FAILED!"
    echo "📋 Build log contents:"
    echo "======================"
    cat "$LOG_FILE"
    echo "======================"
    
    # Check for specific errors and suggest fixes
    if grep -q "fconcepts" "$LOG_FILE"; then
        echo "🔧 Detected compiler flag issue. Attempting fix..."
        ./fix_build_and_deploy.sh
    elif grep -q "udid" "$LOG_FILE"; then
        echo "🔧 Detected device selection issue. Available devices:"
        xcrun devicectl list devices
    elif grep -q "bundle" "$LOG_FILE"; then
        echo "🔧 Detected bundle issue. Metro bundler may need restart."
    fi
fi

echo "📄 Full build log saved to: $LOG_FILE"
