#!/bin/zsh
# iOS Build Fix Script for React/RCTAppDelegate.h Not Found Error
# This script fixes the specific "React/RCTAppDelegate.h file not found" error

echo "🚀 Starting iOS build fix for AppDelegate header issue..."

# Navigate to project root directory
cd "$(dirname "$0")"

echo "🧹 Cleaning build environment..."
rm -rf ios/Pods
rm -rf ios/build
rm -f ios/Podfile.lock
rm -rf ~/Library/Developer/Xcode/DerivedData/*LyoAILearningAssistant*

# Create necessary directories if they don't exist
mkdir -p ios/LyoAILearningAssistant/Supporting
mkdir -p ios/.packager-output

echo "📦 Reinstalling expo-asset package..."
npm install expo-asset@~11.1.5 --save

echo "📦 Running pod installation..."
cd ios
pod deintegrate
pod cache clean --all

echo "🔄 Updating CocoaPods repositories..."
pod repo update

echo "📥 Installing pods with verbose output..."
pod install --verbose

# Creating required build directories
mkdir -p .packager-output
touch .packager-output/packager.log

echo "✅ iOS build setup complete!"
echo ""
echo "🚀 Next steps to build the app:"
echo "1. Open the workspace: open /Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/LyoAILearningAssistant.xcworkspace"
echo "2. Clean the build folder in Xcode: Product > Clean Build Folder (or Shift+Command+K)"
echo "3. Build the project: Command+B"
echo ""
echo "The 'React/RCTAppDelegate.h file not found' error should now be fixed!"
