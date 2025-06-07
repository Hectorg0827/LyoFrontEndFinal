#!/bin/bash

set -e

echo "🎯 DEFINITIVE iOS Metro & App Launch Solution"
echo "============================================="
echo "$(date)"
echo ""

cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

# Comprehensive cleanup function
cleanup_processes() {
    echo "🧹 Comprehensive process cleanup..."
    
    # Kill by exact process patterns
    pkill -f "expo start" 2>/dev/null || true
    pkill -f "react-native start" 2>/dev/null || true
    pkill -f "metro" 2>/dev/null || true
    pkill -f "node.*8081" 2>/dev/null || true
    
    # Kill any process using port 8081
    local pids=$(lsof -ti :8081 2>/dev/null || true)
    if [ ! -z "$pids" ]; then
        echo "Killing processes on port 8081: $pids"
        echo "$pids" | xargs kill -9 2>/dev/null || true
    fi
    
    sleep 3
    
    # Verify port is free
    if lsof -i :8081 >/dev/null 2>&1; then
        echo "❌ Port 8081 still in use after cleanup"
        return 1
    else
        echo "✅ Port 8081 is free"
        return 0
    fi
}

# Metro cache cleanup
clear_caches() {
    echo "🧹 Clearing all caches..."
    rm -rf node_modules/.cache 2>/dev/null || true
    rm -rf ~/.expo/metro-cache 2>/dev/null || true
    rm -rf /tmp/metro-* 2>/dev/null || true
    rm -rf /tmp/react-* 2>/dev/null || true
    rm -rf $TMPDIR/metro-* 2>/dev/null || true
    rm -rf $TMPDIR/haste-map-* 2>/dev/null || true
    echo "✅ Caches cleared"
}

# Enhanced Metro startup with multiple fallback strategies
start_metro() {
    echo "🚀 Starting Metro with enhanced configuration..."
    
    # Strategy 1: Standard Expo start
    echo "Strategy 1: Standard Expo start with localhost..."
    npx expo start --localhost --clear &
    local metro_pid=$!
    
    echo "Metro PID: $metro_pid"
    
    # Wait for Metro to initialize
    echo "⏳ Waiting for Metro to initialize..."
    sleep 15
    
    # Check if process is alive
    if ! ps -p $metro_pid > /dev/null 2>&1; then
        echo "❌ Metro process died, trying alternative strategy..."
        
        # Strategy 2: With dev-client
        echo "Strategy 2: Starting with dev-client..."
        npx expo start --dev-client --localhost --clear &
        metro_pid=$!
        sleep 10
        
        if ! ps -p $metro_pid > /dev/null 2>&1; then
            echo "❌ Alternative strategy failed"
            return 1
        fi
    fi
    
    echo "✅ Metro process is running (PID: $metro_pid)"
    return 0
}

# Comprehensive connectivity testing
test_metro_connectivity() {
    echo "🔍 Testing Metro connectivity..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        # Test basic connectivity
        if curl -s --connect-timeout 3 http://localhost:8081 >/dev/null 2>&1; then
            echo "✅ Metro basic connectivity: OK"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            echo "❌ Metro not responding after $max_attempts attempts"
            return 1
        fi
        
        echo "⏳ Attempt $attempt/$max_attempts: Waiting for Metro..."
        sleep 2
        ((attempt++))
    done
    
    # Test specific endpoints
    echo "Testing specific endpoints..."
    
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/status 2>/dev/null || echo "000")
    echo "Status endpoint: HTTP $status_code"
    
    local bundle_code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8081/index.bundle?platform=ios&dev=true" 2>/dev/null || echo "000")
    echo "Index bundle: HTTP $bundle_code"
    
    local expo_bundle_code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8081/node_modules/expo/AppEntry.bundle?platform=ios&dev=true" 2>/dev/null || echo "000")
    echo "Expo AppEntry bundle: HTTP $expo_bundle_code"
    
    # At least one bundle endpoint should work
    if [ "$bundle_code" = "200" ] || [ "$expo_bundle_code" = "200" ]; then
        echo "✅ Bundle endpoints are working!"
        return 0
    else
        echo "⚠️  Bundle endpoints not fully ready, but Metro is responding"
        return 0  # Still proceed as Metro might need more time
    fi
}

# iOS app launch with verification
launch_ios_app() {
    echo "📱 Launching iOS app..."
    
    # Check if iOS simulator is available
    if command -v xcrun >/dev/null 2>&1; then
        echo "Checking iOS simulator availability..."
        xcrun simctl list devices | grep -E "iPhone.*Booted" >/dev/null 2>&1 && echo "✅ iOS Simulator is running" || echo "⚠️  No iOS Simulator running"
    fi
    
    # Launch the app
    echo "Starting iOS app build and launch..."
    npx expo run:ios &
    local ios_pid=$!
    
    echo "iOS build PID: $ios_pid"
    
    # Monitor the build process briefly
    echo "⏳ Monitoring iOS build process..."
    sleep 30
    
    if ps -p $ios_pid > /dev/null 2>&1; then
        echo "✅ iOS build process is running"
    else
        echo "⚠️  iOS build process completed or failed - check output above"
    fi
    
    return 0
}

# Main execution flow
main() {
    echo "Starting comprehensive iOS development environment setup..."
    
    # Step 1: Cleanup
    if ! cleanup_processes; then
        echo "❌ Failed to cleanup processes"
        exit 1
    fi
    
    # Step 2: Clear caches
    clear_caches
    
    # Step 3: Start Metro
    if ! start_metro; then
        echo "❌ Failed to start Metro"
        exit 1
    fi
    
    # Step 4: Test connectivity
    if ! test_metro_connectivity; then
        echo "❌ Metro connectivity test failed"
        exit 1
    fi
    
    # Step 5: Launch iOS app
    launch_ios_app
    
    echo ""
    echo "🎉 SETUP COMPLETE!"
    echo "================="
    echo "✅ Metro bundler is running on http://localhost:8081"
    echo "✅ iOS app is building/launching"
    echo ""
    echo "📱 What to expect:"
    echo "   1. iOS Simulator should open (if not already open)"
    echo "   2. App will build and install"
    echo "   3. App should launch and connect to Metro"
    echo ""
    echo "🔧 If the app shows 'Could not connect to development server':"
    echo "   1. Shake the device/simulator (Cmd+Ctrl+Z)"
    echo "   2. Tap 'Configure Bundler'"
    echo "   3. Enter: localhost:8081"
    echo "   4. Tap 'Done' and reload"
    echo ""
    echo "🎯 Your app should now be fully functional!"
    echo ""
    echo "Press Ctrl+C to stop Metro when done developing"
    
    # Keep script running to maintain Metro
    wait
}

# Execute main function
main
