#!/bin/bash

echo "🚀 Complete iOS App Launch with Metro Fix"
echo "========================================="

cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

# Step 1: Clean up any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "metro\|expo" 2>/dev/null || true
lsof -ti:8081 | xargs kill -9 2>/dev/null || true

# Step 2: Clear Metro cache
echo "🧹 Clearing Metro cache..."
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf /tmp/metro-* 2>/dev/null || true

# Step 3: Start Metro bundler
echo "🚀 Starting Metro bundler..."
npx expo start --localhost --clear &
METRO_PID=$!

echo "Metro PID: $METRO_PID"

# Step 4: Wait for Metro to be ready
echo "⏳ Waiting for Metro to start..."
for i in {1..30}; do
    if curl -s http://127.0.0.1:8081/status > /dev/null 2>&1; then
        echo "✅ Metro is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Metro failed to start"
        kill $METRO_PID 2>/dev/null || true
        exit 1
    fi
    echo "   Waiting... ($i/30)"
    sleep 2
done

# Step 5: Verify bundle is accessible
echo "🔍 Testing bundle endpoints..."
BUNDLE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:8081/index.bundle?platform=ios&dev=true&hot=false")
echo "   Bundle test: HTTP $BUNDLE_RESPONSE"

if [ "$BUNDLE_RESPONSE" != "200" ]; then
    echo "⚠️  Bundle not immediately available, but Metro is running"
fi

# Step 6: Launch iOS app
echo "📱 Launching iOS app..."
npx expo run:ios &
IOS_PID=$!

echo ""
echo "✅ LAUNCH COMPLETE!"
echo "==================="
echo "📱 iOS app is launching..."
echo "🌐 Metro bundler: http://127.0.0.1:8081"
echo "🔍 Metro PID: $METRO_PID"
echo "📱 iOS build PID: $IOS_PID"
echo ""
echo "💡 If the app shows 'Could not connect to development server':"
echo "   1. Shake the device/simulator"
echo "   2. Tap 'Configure Bundler'"
echo "   3. Enter: 127.0.0.1:8081"
echo "   4. Tap 'Done' and reload"
echo ""
echo "🛑 To stop everything: kill $METRO_PID $IOS_PID"
echo ""
echo "Waiting for iOS build to complete..."
wait $IOS_PID
