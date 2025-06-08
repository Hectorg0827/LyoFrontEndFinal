#!/bin/bash

echo "🚀 Fixing Metro Bundler Connection for Physical Device"
echo "====================================================="
echo "Target Device: Hector's iPhone"
echo "Current IP: $(ipconfig getifaddr en0)"
echo "Timestamp: $(date)"
echo ""

# Kill any existing Metro processes
echo "🧹 Cleaning up existing Metro processes..."
pkill -f metro || echo "No existing metro processes found"
pkill -f expo || echo "No existing expo processes found"

echo ""
echo "🔧 Starting Metro bundler for physical device..."

# Start Metro bundler with the correct configuration for physical devices
echo "Starting Expo development server..."
export REACT_NATIVE_PACKAGER_HOSTNAME=$(ipconfig getifaddr en0)
echo "Using IP address: $REACT_NATIVE_PACKAGER_HOSTNAME"

# Start the bundler
npx expo start --dev-client --host tunnel &
METRO_PID=$!

echo "Metro bundler started with PID: $METRO_PID"
echo ""

sleep 5

echo "📱 Next Steps to Fix Your App:"
echo "=============================="
echo ""
echo "1. 🔄 RESTART THE APP on Hector's iPhone:"
echo "   - Double-tap home button and swipe up to close the app"
echo "   - Reopen 'Lyo - AI Learning Assistant'"
echo ""
echo "2. 🌐 IF APP STILL SHOWS SPLASH SCREEN:"
echo "   - Shake the device to open the developer menu"
echo "   - Tap 'Configure Bundle' or 'Settings'"
echo "   - Enter the server URL: http://$(ipconfig getifaddr en0):8081"
echo "   - Tap 'Reload' or restart the app"
echo ""
echo "3. 📶 ALTERNATIVE - Use Tunnel Mode:"
echo "   - The bundler is starting with --host tunnel"
echo "   - This creates a public URL that works through firewalls"
echo "   - Look for the tunnel URL in the output below"
echo ""
echo "4. 🔗 OR SCAN QR CODE:"
echo "   - Open Camera app on Hector's iPhone"
echo "   - Scan the QR code that appears in the terminal"
echo "   - This will automatically configure the connection"
echo ""

echo "📊 Monitoring Metro bundler output..."
echo "======================================"

# Wait for Metro to fully start
sleep 10

# Check if Metro is running
if ps -p $METRO_PID > /dev/null; then
    echo "✅ Metro bundler is running successfully!"
    echo "🔍 Check the terminal output above for:"
    echo "   - QR code to scan with iPhone camera"
    echo "   - Tunnel URL (if available)"
    echo "   - Local network URL: http://$(ipconfig getifaddr en0):8081"
else
    echo "❌ Metro bundler failed to start"
    echo "Trying alternative startup method..."
    npx expo start --dev-client
fi

echo ""
echo "🎯 TO FIX THE SPLASH SCREEN ISSUE:"
echo "=================================="
echo "1. Close the app completely on the iPhone"
echo "2. Reopen it - it should now connect to Metro"
echo "3. If still stuck, shake device → Configure Bundle → Use tunnel URL"
