#!/bin/bash
set -e

# Script to fix xcconfig preprocessor directive issue

echo "🔧 Fixing xcconfig preprocessor directive issue..."

# Path to xcconfig files
DEBUG_XCCONFIG="/Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/Pods/Target Support Files/Pods-LyoAILearningAssistant/Pods-LyoAILearningAssistant.debug.xcconfig"
RELEASE_XCCONFIG="/Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/Pods/Target Support Files/Pods-LyoAILearningAssistant/Pods-LyoAILearningAssistant.release.xcconfig"

# Fix the xcconfig files
sed -i '' 's/# C++20 Configuration/\/\/C++20 Configuration/g' "$DEBUG_XCCONFIG"
sed -i '' 's/# C++20 Configuration/\/\/C++20 Configuration/g' "$RELEASE_XCCONFIG"

# Make sure OTHER_CPLUSPLUSFLAGS includes $(inherited)
sed -i '' 's/OTHER_CPLUSPLUSFLAGS = -std=c++20 -fconcepts/OTHER_CPLUSPLUSFLAGS = $(inherited) -std=c++20 -fconcepts/g' "$DEBUG_XCCONFIG"
sed -i '' 's/OTHER_CPLUSPLUSFLAGS = -std=c++20 -fconcepts/OTHER_CPLUSPLUSFLAGS = $(inherited) -std=c++20 -fconcepts/g' "$RELEASE_XCCONFIG"

echo "✅ xcconfig files fixed successfully!"
echo "📱 Now open Xcode and build the app:"
echo "open ios/LyoAILearningAssistant.xcworkspace"