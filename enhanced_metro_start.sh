#!/bin/bash

set -e  # Exit on any error

LOG_FILE="/Users/republicalatuya/Desktop/LyoFrontEndFinal/metro_startup.log"
exec > >(tee -a "$LOG_FILE")
exec 2>&1

echo "🚀 Enhanced iOS Development Environment Startup"
echo "==============================================="
echo "$(date)"
echo ""

cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

# Function to check if port is in use
check_port() {
    if lsof -i :8081 >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Enhanced process cleanup
echo "📱 Comprehensive process cleanup..."
# Kill by process name patterns
pkill -f "expo start" 2>/dev/null || true
pkill -f "react-native start" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true
pkill -f "node.*8081" 2>/dev/null || true
pkill -f "expo.*localhost" 2>/dev/null || true

# Wait for processes to stop
echo "⏳ Waiting for processes to stop..."
sleep 5

# Force kill port users
if check_port; then
    echo "⚠️  Port 8081 still in use, force killing..."
    PIDS=$(lsof -ti :8081)
    if [ ! -z "$PIDS" ]; then
        echo "Killing PIDs: $PIDS"
        echo "$PIDS" | xargs kill -9 2>/dev/null || true
    fi
    sleep 3
fi

# Final port check
if check_port; then
    echo "❌ Cannot free port 8081. Manual intervention required."
    echo "Run: sudo lsof -i :8081"
    exit 1
else
    echo "✅ Port 8081 is free"
fi

# Environment verification
echo ""
echo "🔍 Environment verification..."
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Expo CLI: $(npx expo --version 2>/dev/null || echo 'Not found')"
echo "Current directory: $(pwd)"
echo "Package.json exists: $([ -f package.json ] && echo 'Yes' || echo 'No')"
echo "Metro config exists: $([ -f metro.config.js ] && echo 'Yes' || echo 'No')"
echo ""

# Clear Metro cache thoroughly
echo "🧹 Clearing Metro cache..."
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf /tmp/metro-* 2>/dev/null || true
rm -rf ~/.expo/metro-cache 2>/dev/null || true
rm -rf $TMPDIR/metro-* 2>/dev/null || true

# Clear React Native cache
echo "🧹 Clearing React Native cache..."
rm -rf /tmp/react-* 2>/dev/null || true
rm -rf $TMPDIR/react-* 2>/dev/null || true

# Start Metro development server with enhanced logging
echo "🚀 Starting Metro development server..."
echo "Command: npx expo start --localhost --clear"
npx expo start --localhost --clear &
METRO_PID=$!

echo "Metro PID: $METRO_PID"

# Extended wait for Metro to start
echo "⏳ Waiting for Metro to initialize..."
sleep 12

# Check if Metro process is alive
if ! ps -p $METRO_PID > /dev/null 2>&1; then
    echo "❌ Metro process died immediately"
    echo "Checking for error logs..."
    # Try to capture any output
    wait $METRO_PID 2>/dev/null || echo "Metro exit code: $?"
    exit 1
fi

echo "✅ Metro process is running (PID: $METRO_PID)"

# Comprehensive Metro connection testing
echo "🔍 Testing Metro connectivity..."

# Test 1: Basic connection
echo "Test 1: Basic Metro connection..."
for i in {1..20}; do
    if curl -s --connect-timeout 5 http://localhost:8081 >/dev/null 2>&1; then
        echo "✅ Metro is responding on localhost:8081"
        break
    fi
    if [ $i -eq 20 ]; then
        echo "❌ Metro is not responding after 20 attempts"
        echo "Checking Metro status..."
        ps -p $METRO_PID || echo "Metro process not found"
        exit 1
    fi
    echo "⏳ Attempt $i/20: Waiting for Metro to respond..."
    sleep 3
done

# Test 2: Status endpoint
echo "Test 2: Metro status endpoint..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/status 2>/dev/null || echo "000")
echo "Status endpoint response: HTTP $STATUS"

# Test 3: Bundle endpoint
echo "Test 3: Bundle endpoints..."
BUNDLE_INDEX=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8081/index.bundle?platform=ios&dev=true" 2>/dev/null || echo "000")
echo "Index bundle response: HTTP $BUNDLE_INDEX"

BUNDLE_EXPO=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8081/node_modules/expo/AppEntry.bundle?platform=ios&dev=true" 2>/dev/null || echo "000")
echo "Expo AppEntry bundle response: HTTP $BUNDLE_EXPO"

# Summary
echo ""
echo "📋 STARTUP SUMMARY"
echo "=================="
echo "Metro PID: $METRO_PID"
echo "Metro Status: $(ps -p $METRO_PID > /dev/null && echo 'Running' || echo 'Stopped')"
echo "Port 8081: $(check_port && echo 'In use' || echo 'Free')"
echo "Basic connectivity: $(curl -s http://localhost:8081 >/dev/null 2>&1 && echo 'OK' || echo 'FAILED')"
echo ""

if [ "$BUNDLE_INDEX" = "200" ] || [ "$BUNDLE_EXPO" = "200" ]; then
    echo "✅ SUCCESS: Metro is serving bundles correctly!"
    echo ""
    echo "📱 Next steps:"
    echo "  1. Launch iOS app from Xcode or simulator"
    echo "  2. If connection fails, shake device and configure bundler to: localhost:8081"
    echo "  3. The app should connect and load successfully"
    echo ""
    echo "🎯 Metro is ready for iOS development!"
else
    echo "⚠️  WARNING: Bundle endpoints not fully responding"
    echo "Metro is running but may need more time to initialize"
    echo "Try launching the iOS app anyway - it might work"
fi

echo ""
echo "To stop Metro: kill $METRO_PID"
echo "Log file: $LOG_FILE"
echo ""
echo "🚀 Metro startup complete!"
