#!/bin/bash

# Script to ensure Metro bundler is running correctly and the app can connect.
echo "🚀 Ensuring Metro Bundler and App Connectivity"
echo "================================================="

# Navigate to project directory
cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

# Step 1: Stop any existing Metro bundler instances
echo "🛑 Stopping any existing Metro bundler processes..."
lsof -ti tcp:8081 | xargs kill -9 2>/dev/null || echo "No existing Metro process found on port 8081."

# Step 2: Start the Metro bundler with cache clearing, specifically for iOS
echo "✨ Starting Metro bundler for iOS (this might take a moment)..."
echo "If your app is on a physical device, ensure it's on the same Wi-Fi network."

# The '--ios' flag helps configure the bundler for the iOS environment.
# '--clear' resets the Metro cache.
npx expo start --ios --clear

echo "
✅ Metro Bundler Started!"
echo "-------------------------"
echo "Your app should now be able to connect."
echo "- If using a Simulator: Open the LyoAILearningAssistant app on your simulator."
echo "- If using a Physical Device: Open the Expo Go app, scan the QR code from the terminal, or open LyoAILearningAssistant if it's a development build."
echo "- If the app is already open and showing the red error screen, try reloading it (Shake device or Cmd+R in Simulator)."
