#!/bin/bash
# Real-time iOS Device Build Monitor

echo "📱 iOS Device Build Monitor - $(date)"
echo "=================================="

# Monitor for build output
BUILD_LOG="ios_device_build_$(date +%Y%m%d_%H%M%S).log"

# Start monitoring in background
echo "⏰ Starting build monitor..."
echo "📄 Logging to: $BUILD_LOG"

# Check for device connection
echo "🔍 Checking for connected iOS devices..."

if command -v xcrun &> /dev/null; then
    echo "✅ Xcode tools available"
    
    # Try different methods to detect devices
    echo "📱 Attempting device detection..."
    
    # Method 1: xcrun devicectl
    if xcrun devicectl list devices 2>/dev/null | grep -q "iPhone"; then
        echo "✅ iPhone detected via devicectl"
        xcrun devicectl list devices 2>/dev/null | grep "iPhone"
    fi
    
    # Method 2: instruments
    if xcrun instruments -s devices 2>/dev/null | grep -q "iPhone.*]$"; then
        echo "✅ iPhone detected via instruments"
        xcrun instruments -s devices 2>/dev/null | grep "iPhone.*]$"
    fi
    
    # Method 3: xctrace  
    if xcrun xctrace list devices 2>/dev/null | grep -q "iPhone" | grep -v "Simulator"; then
        echo "✅ iPhone detected via xctrace"
        xcrun xctrace list devices 2>/dev/null | grep "iPhone" | grep -v "Simulator"
    fi
    
else
    echo "❌ Xcode command line tools not found"
fi

echo ""
echo "🔔 If your iPhone isn't detected:"
echo "   1. Connect iPhone via USB cable"
echo "   2. Unlock your iPhone"
echo "   3. Tap 'Trust This Computer' when prompted"
echo "   4. Ensure Developer Mode is enabled in Settings > Privacy & Security"
echo ""

# Continue monitoring build process
echo "⏳ Monitoring build process..."
echo "   Press Ctrl+C to stop monitoring"
echo ""

# Real-time process monitoring
while true; do
    # Check for Expo processes
    if pgrep -f "expo" > /dev/null; then
        echo "[$(date +%H:%M:%S)] 🔄 Expo process active"
    fi
    
    # Check for any new log files
    NEW_LOGS=$(find . -name "*.log" -newer metro.log 2>/dev/null || true)
    if [[ -n "$NEW_LOGS" ]]; then
        echo "[$(date +%H:%M:%S)] 📄 New log files detected: $NEW_LOGS"
    fi
    
    # Check for build completion indicators
    if ls | grep -q "ios"; then
        echo "[$(date +%H:%M:%S)] 📱 iOS project structure detected"
    fi
    
    sleep 10
done
