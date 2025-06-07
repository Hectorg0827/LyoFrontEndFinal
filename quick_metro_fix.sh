#!/bin/bash

echo "🚀 Quick Metro Fix for iOS Connection Error"
echo "==========================================="

# Kill any hanging processes
pkill -f expo || true
pkill -f metro || true
lsof -ti :8081 | xargs kill -9 2>/dev/null || true

echo "🔧 Starting Metro on exactly the URL your iOS app expects..."
echo "📱 URL: http://127.0.0.1:8081"
echo ""

# Start Metro specifically for the iOS app connection
npx expo start --localhost --port 8081 --host 127.0.0.1

echo "✅ Metro started - your iOS app should reconnect now!"
