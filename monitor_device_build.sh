#!/bin/bash

echo "📱 REAL-TIME iOS DEVICE BUILD MONITOR"
echo "====================================="
echo "🕐 Started: $(date)"
echo "🎯 Target: Hector's iPhone"
echo "📦 App: LyoAI Learning Assistant"
echo "====================================="

# Function to log with timestamp
log_with_time() {
    echo "[$(date +%H:%M:%S)] $1"
}

log_with_time "🔍 Monitoring build process..."

# Monitor for 30 minutes max
TIMEOUT=1800
START_TIME=$(date +%s)

while true; do
    CURRENT_TIME=$(date +%s)
    ELAPSED=$((CURRENT_TIME - START_TIME))
    
    if [[ $ELAPSED -gt $TIMEOUT ]]; then
        log_with_time "⏰ Build timeout reached (30 minutes)"
        break
    fi
    
    # Check for Expo processes
    if pgrep -f "expo run:ios" > /dev/null; then
        log_with_time "✅ Expo build process active"
    elif pgrep -f "expo" > /dev/null; then
        log_with_time "🔄 Expo process running"
    fi
    
    # Check for CocoaPods processes
    if pgrep -f "pod install" > /dev/null; then
        log_with_time "📦 CocoaPods installation in progress"
    fi
    
    # Check for Xcode build processes
    if pgrep -f "xcodebuild" > /dev/null; then
        log_with_time "🔨 Xcode build in progress"
    fi
    
    # Check if workspace was created
    if [[ -f "ios/LyoAILearningAssistant.xcworkspace/contents.xcworkspacedata" ]]; then
        log_with_time "✅ Xcode workspace created successfully"
    fi
    
    # Check for device connection prompts
    if [[ -f "ios/build" ]] && [[ -d "ios/build" ]]; then
        BUILD_FILES=$(find ios/build -name "*.log" 2>/dev/null | wc -l)
        if [[ $BUILD_FILES -gt 0 ]]; then
            log_with_time "📄 Build log files detected: $BUILD_FILES"
        fi
    fi
    
    # Check for common success indicators
    if ps aux | grep -q "Installing.*iPhone"; then
        log_with_time "🎉 App installation detected!"
    fi
    
    # Check for device-related processes
    if ps aux | grep -q "ios-deploy\|devicectl\|instruments"; then
        log_with_time "📱 Device deployment tools active"
    fi
    
    sleep 10
done

log_with_time "🏁 Monitoring completed"
