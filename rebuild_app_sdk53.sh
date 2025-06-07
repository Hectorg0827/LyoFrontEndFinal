#!/bin/zsh

echo "🚀 Starting comprehensive app rebuild with SDK 53..."
echo "=================================================="

# Navigate to project directory
cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

# Step 1: Kill all running processes
echo "🛑 Stopping all running processes..."
pkill -f "expo start" || true
pkill -f "metro" || true
pkill -f "react-native start" || true
sleep 3

# Step 2: Clean all caches and build artifacts
echo "🧹 Cleaning all caches and build artifacts..."
rm -rf node_modules/.cache
rm -rf .expo
rm -rf ios/build
rm -rf ios/Pods
rm -rf ios/*.xcworkspace
watchman watch-del-all 2>/dev/null || true

# Step 3: Verify package.json has SDK 53
echo "📦 Verifying SDK 53 configuration..."
if grep -q "expo.*53" package.json; then
    echo "✅ SDK 53 confirmed in package.json"
else
    echo "❌ SDK 53 not found in package.json"
    exit 1
fi

# Step 4: Clean install dependencies
echo "📥 Clean installing dependencies..."
rm -rf node_modules package-lock.json
npm install

# Step 5: Regenerate iOS project
echo "🍎 Regenerating iOS project with SDK 53..."
rm -rf ios
npx expo prebuild --platform ios --clean

# Step 6: Verify iOS project creation
if [ -d "ios" ]; then
    echo "✅ iOS project created successfully"
    ls -la ios/
else
    echo "❌ Failed to create iOS project"
    exit 1
fi

# Step 7: Install CocoaPods dependencies
echo "☕ Installing CocoaPods dependencies..."
cd ios
pod install --repo-update
cd ..

# Step 8: Start Metro bundler
echo "📦 Starting Metro bundler..."
npx expo start --clear --dev-client &
METRO_PID=$!
echo "Metro PID: $METRO_PID"

# Step 9: Wait for Metro to initialize
echo "⏳ Waiting for Metro to initialize..."
sleep 15

# Step 10: Check Metro status
if curl -s http://localhost:8081/status > /dev/null 2>&1; then
    echo "✅ Metro bundler is running"
else
    echo "⚠️ Metro might not be ready, but continuing..."
fi

# Step 11: Build and deploy to device
echo "📱 Building and deploying to device..."
npx expo run:ios --device --no-build-cache

echo "🎉 Rebuild completed!"
echo "📱 Metro bundler PID: $METRO_PID"
echo "🛑 To stop Metro: kill $METRO_PID"
