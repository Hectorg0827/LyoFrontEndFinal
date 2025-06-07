#!/bin/bash

TEST_LOG="/Users/republicalatuya/Desktop/LyoFrontEndFinal/app_launch_test.log"

echo "🚀 Comprehensive App Launch Test" > $TEST_LOG
echo "================================" >> $TEST_LOG
echo "$(date)" >> $TEST_LOG
echo "" >> $TEST_LOG

cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

# Test 1: Metro Status
echo "Test 1: Metro Process Status" >> $TEST_LOG
METRO_PID=$(lsof -ti :8081 2>/dev/null || echo "NONE")
if [ "$METRO_PID" != "NONE" ]; then
    echo "✅ Metro is running (PID: $METRO_PID)" >> $TEST_LOG
    ps -p $METRO_PID >> $TEST_LOG 2>&1 || echo "❌ Metro process not found" >> $TEST_LOG
else
    echo "❌ Metro is not running on port 8081" >> $TEST_LOG
fi

# Test 2: Metro Connectivity
echo "" >> $TEST_LOG
echo "Test 2: Metro Connectivity" >> $TEST_LOG
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/status 2>/dev/null || echo "000")
echo "Status endpoint: HTTP $STATUS_CODE" >> $TEST_LOG

BUNDLE_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8081/index.bundle?platform=ios&dev=true" 2>/dev/null || echo "000")
echo "Bundle endpoint: HTTP $BUNDLE_CODE" >> $TEST_LOG

EXPO_BUNDLE_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8081/node_modules/expo/AppEntry.bundle?platform=ios&dev=true" 2>/dev/null || echo "000")
echo "Expo AppEntry bundle: HTTP $EXPO_BUNDLE_CODE" >> $TEST_LOG

# Test 3: iOS Simulator Status
echo "" >> $TEST_LOG
echo "Test 3: iOS Simulator Status" >> $TEST_LOG
BOOTED_DEVICES=$(xcrun simctl list devices | grep "Booted" | wc -l)
echo "Booted simulators: $BOOTED_DEVICES" >> $TEST_LOG

if [ $BOOTED_DEVICES -gt 0 ]; then
    echo "Booted devices:" >> $TEST_LOG
    xcrun simctl list devices | grep "Booted" >> $TEST_LOG
fi

# Test 4: App Installation Check
echo "" >> $TEST_LOG
echo "Test 4: App Installation Check" >> $TEST_LOG
APP_FOUND=$(find ~/Library/Developer/CoreSimulator/Devices -name "*.app" -path "*/LyoAILearningAssistant.app" 2>/dev/null | wc -l)
echo "App installations found: $APP_FOUND" >> $TEST_LOG

# Test 5: Build the app
echo "" >> $TEST_LOG
echo "Test 5: Building iOS App" >> $TEST_LOG
echo "Starting iOS build..." >> $TEST_LOG
npx expo run:ios >> $TEST_LOG 2>&1 &
BUILD_PID=$!
echo "Build PID: $BUILD_PID" >> $TEST_LOG

# Wait for build to progress
sleep 60

# Check build status
if ps -p $BUILD_PID > /dev/null 2>&1; then
    echo "✅ Build process is still running" >> $TEST_LOG
else
    echo "⚠️  Build process completed or failed" >> $TEST_LOG
fi

# Final summary
echo "" >> $TEST_LOG
echo "=== FINAL SUMMARY ===" >> $TEST_LOG
echo "Metro running: $([ "$METRO_PID" != "NONE" ] && echo 'YES' || echo 'NO')" >> $TEST_LOG
echo "Metro responding: $([ "$BUNDLE_CODE" = "200" ] && echo 'YES' || echo 'NO')" >> $TEST_LOG
echo "Simulators booted: $BOOTED_DEVICES" >> $TEST_LOG
echo "App builds found: $APP_FOUND" >> $TEST_LOG
echo "Test completed at: $(date)" >> $TEST_LOG

echo "✅ Test completed! Check results at: $TEST_LOG"
echo ""
echo "Quick summary:"
echo "Metro PID: $METRO_PID"
echo "Bundle endpoint: HTTP $BUNDLE_CODE"
echo "Booted simulators: $BOOTED_DEVICES"
echo ""
echo "📱 If Metro is working (HTTP 200), you can:"
echo "1. Open iOS Simulator"
echo "2. Launch the app if it's already installed"
echo "3. Or wait for the build to complete"
