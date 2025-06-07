#!/bin/bash

echo "🔧 Metro Bundle Server Fix"
echo "=========================="

cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

# Kill existing processes
echo "Stopping existing processes..."
pkill -f "metro\|expo" 2>/dev/null || true
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
sleep 3

# Start Metro with the fixed configuration
echo "Starting Metro with bundle fix..."
npx expo start --localhost --clear &
METRO_PID=$!

echo "Metro PID: $METRO_PID"
echo "Waiting for Metro to start..."

# Wait for Metro to be responsive
for i in {1..20}; do
    if curl -s http://127.0.0.1:8081/status > /dev/null 2>&1; then
        echo "✅ Metro is running!"
        break
    fi
    sleep 2
done

# Test bundle URL
echo ""
echo "Testing bundle access..."
curl -s -I "http://127.0.0.1:8081/index.bundle?platform=ios&dev=true" | head -1

echo ""
echo "✅ Metro is ready at: http://127.0.0.1:8081"
echo ""
echo "🚀 NOW LAUNCH YOUR iOS APP:"
echo "   Option 1: From Xcode - press the play button"
echo "   Option 2: Run: npx expo run:ios"
echo "   Option 3: The app should already be installed on your simulator"
echo ""
echo "💡 If connection fails, shake device and configure bundler to: 127.0.0.1:8081"
echo ""
echo "Press Ctrl+C to stop Metro"

# Keep Metro running
wait $METRO_PID
