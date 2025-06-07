#!/bin/bash

echo "🔧 iOS App Metro Connection Fix"
echo "================================"

cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

# Kill all existing Metro processes
echo "🛑 Stopping all Metro processes..."
pkill -f "expo start" || true
pkill -f "metro" || true
pkill -f "jest-worker" || true
pkill -f "8081" || true

# Force kill anything on port 8081
if lsof -i :8081 >/dev/null 2>&1; then
    echo "🔧 Force clearing port 8081..."
    lsof -ti :8081 | xargs kill -9 || true
fi

sleep 3

echo "🚀 Starting Metro for iOS Development Build..."
echo "📱 This will start Metro in dev-client mode for your iOS app"

# Start Metro specifically for development client (which your iOS app is)
npx expo start --dev-client --localhost --port 8081 &

sleep 5

echo "🔍 Testing Metro connection..."
if curl -s http://127.0.0.1:8081 >/dev/null 2>&1; then
    echo "✅ Metro is running and responding!"
    echo ""
    echo "📱 Now try one of these to reload your iOS app:"
    echo "  1. In iOS Simulator: Press Cmd+R"
    echo "  2. Shake your device and tap 'Reload'"
    echo "  3. In Metro terminal: Press 'r' to reload"
    echo ""
    echo "🎯 Your iOS app should now connect successfully!"
else
    echo "❌ Metro still not responding. Trying alternative method..."
    
    # Kill the background process and try different approach
    pkill -f "expo start" || true
    sleep 2
    
    echo "🔄 Trying React Native Metro..."
    npx react-native start --port 8081 &
    
    sleep 5
    
    if curl -s http://127.0.0.1:8081 >/dev/null 2>&1; then
        echo "✅ React Native Metro is running!"
        echo "📱 Try reloading your iOS app now"
    else
        echo "❌ Both Metro methods failed. Manual steps needed:"
        echo "1. Run: npx expo start --dev-client"
        echo "2. Press 'i' to open iOS simulator"
        echo "3. Or rebuild with: npx expo run:ios"
    fi
fi

echo ""
echo "🎯 Metro should now be accessible at: http://127.0.0.1:8081"
