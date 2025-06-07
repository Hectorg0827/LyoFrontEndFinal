#!/bin/zsh

echo "🔥 COMPREHENSIVE MONITORED BUILD & DEPLOYMENT SCRIPT"
echo "====================================================="
echo "📅 Date: $(date)"
echo "📱 Target: Your iPhone"
echo "📦 SDK: Expo 53.0.0"
echo ""

# Set up logging
BUILD_LOG="comprehensive_build_$(date +%Y%m%d_%H%M%S).log"
exec > >(tee -a "$BUILD_LOG") 2>&1

cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

echo "🧹 STEP 1: Clean Environment"
echo "=============================="
pkill -f "expo start" || true
pkill -f "metro" || true  
pkill -f "xcodebuild" || true
sleep 3

rm -rf .expo/
rm -rf node_modules/.cache/
rm -rf ios/build/
rm -rf ios/DerivedData/

echo "✅ Environment cleaned"

echo ""
echo "📦 STEP 2: Verify Dependencies"
echo "=============================="
echo "Expo version in package.json:"
grep '"expo"' package.json
echo ""
echo "Node modules check:"
if [ -d "node_modules" ]; then
    echo "✅ node_modules exists"
else
    echo "❌ node_modules missing - running npm install"
    npm install
fi

echo ""
echo "☕ STEP 3: CocoaPods Setup"
echo "========================="
cd ios
rm -rf Pods/ Podfile.lock
echo "Installing pods..."
pod install --verbose
cd ..
echo "✅ CocoaPods installed"

echo ""
echo "📦 STEP 4: Start Metro Bundler"
echo "=============================="
echo "Ensuring port 8081 is free..."
if lsof -ti:8081 -sTCP:LISTEN > /dev/null ; then
    echo "Port 8081 is in use. Attempting to kill the process..."
    kill -9 $(lsof -ti:8081 -sTCP:LISTEN) || echo "Failed to kill process on port 8081, or port was already free."
    sleep 2 # Give a moment for the port to be released
else
    echo "Port 8081 is already free."
fi

echo "Starting Metro bundler..."
npx expo start --clear --port 8081 &
METRO_PID=$!
echo "Metro PID: $METRO_PID"

echo "⏳ Waiting for Metro to initialize..."
sleep 15

# Check Metro status
if curl -s http://localhost:8081/status > /dev/null 2>&1; then
    echo "✅ Metro bundler is running and accessible"
else
    echo "⚠️ Metro might not be fully ready, checking..."
    sleep 10
    if curl -s http://localhost:8081/status > /dev/null 2>&1; then
        echo "✅ Metro bundler is now ready"
    else
        echo "❌ Metro bundler connection issues"
    fi
fi

echo ""
echo "📱 STEP 5: Build and Deploy to Your iPhone"
echo "=========================================="
echo "🚀 Starting build process..."

# Build with comprehensive monitoring
npx expo run:ios --device --configuration Debug 2>&1 | while IFS= read -r line; do
    echo "[$(date '+%H:%M:%S')] $line"
    
    # Check for specific errors
    if echo "$line" | grep -q -i "error\|failed\|fatal"; then
        echo "❌ ERROR DETECTED: $line"
    fi
    
    # Check for success indicators
    if echo "$line" | grep -q -i "success\|completed\|installed"; then
        echo "✅ SUCCESS: $line"
    fi
    
    # Check for device connection
    if echo "$line" | grep -q -i "device\|iphone"; then
        echo "📱 DEVICE: $line"
    fi
done

echo ""
echo "🏁 STEP 6: Verification"
echo "======================"
echo "Build log saved to: $BUILD_LOG"
echo "Metro PID: $METRO_PID"
echo ""
echo "📱 CHECK YOUR IPHONE:"
echo "   - App should be installing/installed"
echo "   - Look for LyoAI Learning Assistant icon"
echo "   - Tap to launch and verify functionality"
echo ""
echo "🛑 To stop Metro bundler: kill $METRO_PID"
echo ""
echo "🎉 Build process completed at $(date)"
