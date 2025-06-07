#!/bin/bash

set -e  # Exit on any error

echo "🚀 Starting iOS Development Environment"
echo "======================================"

# Function to check if port is in use
check_port() {
    if lsof -i :8081 >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Stop any existing Metro processes
echo "📱 Stopping existing Metro processes..."
pkill -f "expo start" || true
pkill -f "react-native start" || true
pkill -f "metro" || true
pkill -f "node.*8081" || true

# Wait for processes to stop
echo "⏳ Waiting for processes to stop..."
sleep 3

# Verify port is free
if check_port; then
    echo "⚠️  Port 8081 still in use, force killing..."
    lsof -ti :8081 | xargs kill -9 || true
    sleep 2
fi

# Start Metro development server
echo "🚀 Starting Metro development server..."
npx expo start --localhost --clear &
METRO_PID=$!

# Wait for Metro to start
echo "⏳ Waiting for Metro to start..."
sleep 8

# Check if Metro is running
if ! ps -p $METRO_PID > /dev/null; then
    echo "❌ Metro failed to start"
    exit 1
fi

# Verify Metro is responding
echo "🔍 Checking Metro connection..."
for i in {1..15}; do
    if curl -s http://localhost:8081 >/dev/null 2>&1; then
        echo "✅ Metro is responding on localhost:8081"
        break
    fi
    if [ $i -eq 15 ]; then
        echo "❌ Metro is not responding after 15 attempts"
        echo "🔧 Trying alternative Metro start method..."
        kill $METRO_PID || true
        sleep 2
        npx expo start --dev-client --localhost &
        METRO_PID=$!
        sleep 5
        if curl -s http://localhost:8081 >/dev/null 2>&1; then
            echo "✅ Metro started with alternative method"
            break
        else
            echo "❌ Metro failed to start with alternative method"
            exit 1
        fi
    fi
    echo "⏳ Attempt $i/15: Waiting for Metro to respond..."
    sleep 2
done

echo "📱 Metro is ready! You can now:"
echo "  • Press 'i' in the Metro terminal to open iOS simulator"
echo "  • Press 'a' to open Android emulator"
echo "  • Scan the QR code with Expo Go app"
echo ""
echo "🎯 Metro is running in the background (PID: $METRO_PID)"
echo "   To stop Metro later, run: kill $METRO_PID"
echo ""
echo "✅ Script completed successfully!"

# Bring Metro to foreground so user can interact with it
fg %1
