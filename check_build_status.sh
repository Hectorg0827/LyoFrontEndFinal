#!/bin/bash

echo "=== Checking iOS Build Status ==="

# Check if Metro is running
echo "Metro/Expo processes:"
ps aux | grep -E "(expo|metro|node)" | grep -v grep | head -5

echo ""
echo "Port 8081 status:"
lsof -i :8081 | head -5

echo ""
echo "iOS Simulator status:"
xcrun simctl list devices | grep Booted

echo ""
echo "Apps on simulator:"
DEVICE_ID=$(xcrun simctl list devices | grep Booted | grep -o '[A-F0-9\-]\{36\}' | head -1)
if [ ! -z "$DEVICE_ID" ]; then
    echo "Device ID: $DEVICE_ID"
    xcrun simctl list apps "$DEVICE_ID" | grep -E "(LyoAI|Learning|com\.)" | head -10
else
    echo "No booted simulator found"
fi
