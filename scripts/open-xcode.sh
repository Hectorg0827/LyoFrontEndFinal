#!/bin/bash
# Open the project in Xcode

# Navigate to the project directory
cd "$(dirname "$0")/.."

# Check if the iOS directory exists
if [ ! -d "ios" ]; then
  echo "❌ iOS directory not found. Did you run expo prebuild?"
  exit 1
fi

# Check if the Xcode workspace exists
if [ ! -d "ios/LyoAILearningAssistant.xcworkspace" ]; then
  echo "❌ Xcode workspace not found. Did you run pod install?"
  exit 1
fi

# Open the project in Xcode
echo "🚀 Opening Xcode project..."
open ios/LyoAILearningAssistant.xcworkspace

echo "✅ Xcode project opened. You can now build and run the app from Xcode."
