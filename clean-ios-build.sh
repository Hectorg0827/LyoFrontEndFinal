#!/bin/bash
# Clean iOS build script for LyoAILearningAssistant

cd "$(dirname "$0")"
echo "🧹 Cleaning iOS build artifacts..."

# Remove Pods directory and related files
echo "Removing Pods directory and Podfile.lock..."
rm -rf ios/Pods
rm -f ios/Podfile.lock

# Remove build artifacts
echo "Removing build directory..."
rm -rf ios/build

# Remove derived data (Xcode cache)
echo "Removing Xcode derived data for this project..."
DERIVED_DATA_PATH=~/Library/Developer/Xcode/DerivedData
if [ -d "$DERIVED_DATA_PATH" ]; then
    find "$DERIVED_DATA_PATH" -name "*LyoAILearningAssistant*" -type d -exec rm -rf {} \; 2>/dev/null || true
fi

# Reinstall pods
echo "📦 Reinstalling pods..."
cd ios
pod deintegrate
pod cache clean --all
pod setup
pod install

# Check if .xcworkspace was created
if [ -d "LyoAILearningAssistant.xcworkspace" ]; then
    echo "✅ Success! LyoAILearningAssistant.xcworkspace was created."
else
    echo "❌ Failed to create LyoAILearningAssistant.xcworkspace."
fi

echo "✨ Done! You can now open LyoAILearningAssistant.xcworkspace in Xcode."
