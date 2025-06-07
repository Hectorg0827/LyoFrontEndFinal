#!/bin/bash

echo "Quick Metro Test Results:"
echo "========================"

# Check Metro process
if lsof -i :8081 >/dev/null 2>&1; then
    echo "✅ Metro is running on port 8081"
    METRO_PID=$(lsof -ti :8081)
    echo "   PID: $METRO_PID"
else
    echo "❌ Metro is not running on port 8081"
fi

# Test bundle endpoints
echo ""
echo "Testing bundle endpoints..."

# Test main bundle
RESPONSE1=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8081/index.bundle?platform=ios&dev=true" 2>/dev/null || echo "FAIL")
echo "Index bundle: $RESPONSE1"

# Test expo bundle (the one iOS was originally trying to access)
RESPONSE2=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8081/node_modules/expo/AppEntry.bundle?platform=ios&dev=true" 2>/dev/null || echo "FAIL")
echo "Expo AppEntry bundle: $RESPONSE2"

echo ""
if [ "$RESPONSE1" = "200" ] || [ "$RESPONSE2" = "200" ]; then
    echo "✅ SUCCESS: Metro is serving bundles correctly!"
    echo "🚀 Your iOS app should be able to connect now."
    echo ""
    echo "Next steps:"
    echo "1. Open iOS Simulator (if not already open)"
    echo "2. Build and install the app: npx expo run:ios"
    echo "3. Or if already installed, just launch the LyoAILearningAssistant app"
else
    echo "❌ Metro is not serving bundles correctly"
    echo "   Try restarting Metro with: ./start_and_run_ios.sh"
fi

echo ""
echo "Metro middleware is working if you see bundle request logs above."
