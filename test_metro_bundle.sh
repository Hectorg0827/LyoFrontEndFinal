#!/bin/bash

# Metro Bundle Test and Fix Script
echo "🔧 Testing and fixing Metro bundle serving..."

# Kill any existing processes
echo "Stopping existing Metro processes..."
pkill -f "metro\|expo" 2>/dev/null || true
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
sleep 3

# Start Metro
echo "Starting Metro bundler..."
npx expo start --localhost --clear &
METRO_PID=$!

echo "Metro PID: $METRO_PID"

# Wait for Metro status endpoint
echo "Waiting for Metro to start..."
for i in {1..30}; do
    if curl -s http://127.0.0.1:8081/status > /dev/null 2>&1; then
        echo "✅ Metro status endpoint is responding"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Metro failed to start"
        kill $METRO_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

# Test the specific bundle URL that iOS is trying to access
echo ""
echo "Testing bundle endpoints..."

BUNDLE_URL="http://127.0.0.1:8081/node_modules/expo/AppEntry.bundle?platform=ios&dev=true&hot=false"
echo "Testing: $BUNDLE_URL"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BUNDLE_URL")
echo "Response: HTTP $RESPONSE"

if [ "$RESPONSE" = "200" ]; then
    echo "✅ Main bundle endpoint is working!"
else
    echo "❌ Main bundle endpoint failed. Trying alternatives..."
    
    # Try index.bundle
    INDEX_URL="http://127.0.0.1:8081/index.bundle?platform=ios&dev=true&hot=false"
    echo "Testing: $INDEX_URL"
    RESPONSE2=$(curl -s -o /dev/null -w "%{http_code}" "$INDEX_URL")
    echo "Response: HTTP $RESPONSE2"
    
    if [ "$RESPONSE2" = "200" ]; then
        echo "✅ Index bundle works!"
        echo "💡 Your app might need to be configured to use /index.bundle instead"
    else
        echo "❌ Index bundle also failed"
        
        # List available endpoints
        echo "Available Metro endpoints:"
        curl -s http://127.0.0.1:8081 | grep -o 'href="[^"]*"' | head -10 || echo "Could not list endpoints"
    fi
fi

echo ""
echo "📱 Metro is running. Here's what to do:"
echo "   1. Launch your iOS app (it should be installed already)"
echo "   2. If you get 'Could not connect to development server':"
echo "      - Shake the device/simulator"
echo "      - Tap 'Configure Bundler'"
echo "      - Enter: 127.0.0.1:8081"
echo "      - Tap 'Done' and reload"
echo ""
echo "🔍 Metro PID: $METRO_PID (to stop: kill $METRO_PID)"

# Keep script running
echo "Press Ctrl+C to stop Metro"
wait $METRO_PID
