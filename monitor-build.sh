#!/bin/bash
# Monitor iOS build progress

echo "🔍 Monitoring iOS build progress for Hector's iPhone..."

while true; do
    # Check for Metro bundler
    if lsof -i :8081 >/dev/null 2>&1; then
        echo "✅ Metro bundler is running on port 8081"
    fi
    
    # Check for build processes
    if ps aux | grep -E "(xcodebuild|expo)" | grep -v grep >/dev/null; then
        echo "🏗️  Build processes detected..."
        ps aux | grep -E "(xcodebuild|expo)" | grep -v grep | head -2
    fi
    
    # Check for device connection
    if xcrun devicectl list devices | grep "Hector's iPhone" | grep "available" >/dev/null; then
        echo "📱 Hector's iPhone is connected and available"
    fi
    
    echo "⏳ Waiting for build to progress... ($(date '+%H:%M:%S'))"
    sleep 10
done
