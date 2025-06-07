#!/bin/bash

set -e  # Exit on any error

echo "🚀 iOS Development Environment Setup"
echo "===================================="

# Parse command line arguments
BUILD_APP=false
CLEAR_CACHE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --build)
            BUILD_APP=true
            shift
            ;;
        --clear)
            CLEAR_CACHE=true
            shift
            ;;
        --help)
            echo "Usage: $0 [--build] [--clear] [--help]"
            echo "  --build    Build and install the app on iOS simulator"
            echo "  --clear    Clear all caches before starting"
            echo "  --help     Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for available options"
            exit 1
            ;;
    esac
done

# Function to check if port is in use
check_port() {
    if lsof -i :8081 >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Stop any existing Metro processes
echo "📱 Stopping existing Metro/Expo processes..."
pkill -f "expo start" || true
pkill -f "react-native start" || true
pkill -f "metro" || true
pkill -f "node.*8081" || true

# Wait for processes to stop
echo "⏳ Waiting for processes to stop..."
sleep 3

# Force kill if port still in use
if check_port; then
    echo "⚠️  Port 8081 still in use, force killing..."
    lsof -ti :8081 | xargs kill -9 || true
    sleep 2
fi

# Clear caches if requested
if [ "$CLEAR_CACHE" = true ]; then
    echo "🧹 Clearing all caches..."
    rm -rf node_modules/.cache || true
    rm -rf .expo || true
    npx expo install --fix || true
fi

# Build app if requested
if [ "$BUILD_APP" = true ]; then
    echo "🏗️  Building iOS app..."
    echo "This may take several minutes..."
    
    # Ensure iOS simulator is available
    xcrun simctl list devices | grep -q "Booted" || {
        echo "📱 Starting iOS simulator..."
        open -a Simulator
        sleep 5
    }
    
    # Build and install the app
    npx expo run:ios
    
    if [ $? -eq 0 ]; then
        echo "✅ App built and installed successfully!"
    else
        echo "❌ App build failed"
        exit 1
    fi
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

echo ""
echo "🎉 SUCCESS! Development environment is ready!"
echo "============================================"
echo "📱 Metro is running on: http://localhost:8081"
echo "🆔 Metro PID: $METRO_PID"
echo ""
echo "📋 Available actions:"
echo "  • Press 'i' → Open iOS simulator"
echo "  • Press 'a' → Open Android emulator" 
echo "  • Press 'w' → Open web browser"
echo "  • Press 'r' → Reload app"
echo "  • Scan QR code → Open on physical device"
echo ""
echo "🛑 To stop Metro: kill $METRO_PID"
echo ""

# Bring Metro to foreground for user interaction
echo "🎯 Bringing Metro to foreground..."
fg %1
