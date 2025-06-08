#!/bin/bash

# Simple Metro Bundler Starter for Physical Device
echo "🚀 Starting Metro Bundler for Hector's iPhone"
echo "============================================="

cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

# Clean up any existing processes
pkill -f metro 2>/dev/null || true
pkill -f expo 2>/dev/null || true

echo "Starting Metro bundler with tunnel mode..."
echo "This will create a QR code you can scan with the iPhone camera."
echo ""

# Start with tunnel mode - this bypasses local network issues
npx expo start --dev-client --tunnel

echo ""
echo "After Metro starts:"
echo "1. Open Camera app on Hector's iPhone"
echo "2. Scan the QR code displayed above"
echo "3. This will automatically connect the app to Metro"
echo "4. Close and reopen the Lyo app on the iPhone"
