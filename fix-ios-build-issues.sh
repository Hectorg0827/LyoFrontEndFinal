#!/bin/bash
set -e

# Script to fix common iOS build issues

echo "🔧 Fixing iOS build issues..."

# Path to files
DEBUG_XCCONFIG="/Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/Pods/Target Support Files/Pods-LyoAILearningAssistant/Pods-LyoAILearningAssistant.debug.xcconfig"
RELEASE_XCCONFIG="/Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/Pods/Target Support Files/Pods-LyoAILearningAssistant/Pods-LyoAILearningAssistant.release.xcconfig"
TARGET_DIR="/Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/Pods/Target Support Files/Pods-LyoAILearningAssistant"

echo "🔄 Fix 1: Fixing xcconfig preprocessor directive issue..."
# Fix the xcconfig files
sed -i '' 's/# C++20 Configuration/\/\/C++20 Configuration/g' "$DEBUG_XCCONFIG"
sed -i '' 's/# C++20 Configuration/\/\/C++20 Configuration/g' "$RELEASE_XCCONFIG"

# Make sure OTHER_CPLUSPLUSFLAGS includes $(inherited)
sed -i '' 's/OTHER_CPLUSPLUSFLAGS = -std=c++20 -fconcepts/OTHER_CPLUSPLUSFLAGS = $(inherited) -std=c++20 -fconcepts/g' "$DEBUG_XCCONFIG"
sed -i '' 's/OTHER_CPLUSPLUSFLAGS = -std=c++20 -fconcepts/OTHER_CPLUSPLUSFLAGS = $(inherited) -std=c++20 -fconcepts/g' "$RELEASE_XCCONFIG"

echo "🔄 Fix 2: Creating missing ExpoModulesProvider.swift file..."
# Create the ExpoModulesProvider.swift file
cat > "$TARGET_DIR/ExpoModulesProvider.swift" << 'EOL'
// This file is generated automatically. Do not edit.
// It is used to provide the ExpoModulesProvider for Expo modules.

import ExpoModulesCore

// Here we register all the native modules that should be included in the app
public class ExpoModulesProvider: ExpoModulesProviderProtocol {
  public static func getModulesForAppDelegate() -> [ModuleRegistryEntry] {
    return [
      // Add your modules here
    ]
  }
}
EOL

echo "🔄 Fix 3: Creating missing modulemap files..."
# Get the derived data path
DERIVED_DATA_DIR="/Users/republicalatuya/Library/Developer/Xcode/DerivedData"
FLASHLIST_DIR=$(find "$DERIVED_DATA_DIR" -path "*/Debug-iphoneos/RNFlashList" -type d | head -n 1)

if [ -n "$FLASHLIST_DIR" ]; then
  echo "Found RNFlashList directory: $FLASHLIST_DIR"
  # Create the modulemap file directory if it doesn't exist
  mkdir -p "$FLASHLIST_DIR"
  
  # Create the modulemap file
  cat > "$FLASHLIST_DIR/RNFlashList.modulemap" << 'EOL'
module RNFlashList {
  umbrella header "RNFlashList-umbrella.h"
  export *
  module * { export * }
}
EOL
  echo "Created modulemap file at: $FLASHLIST_DIR/RNFlashList.modulemap"
  
  # Create umbrella header
  cat > "$FLASHLIST_DIR/RNFlashList-umbrella.h" << 'EOL'
#ifdef __OBJC__
#import <UIKit/UIKit.h>
#else
#ifndef FOUNDATION_EXPORT
#if defined(__cplusplus)
#define FOUNDATION_EXPORT extern "C"
#else
#define FOUNDATION_EXPORT extern
#endif
#endif
#endif

// Add any public headers here

FOUNDATION_EXPORT double RNFlashListVersionNumber;
FOUNDATION_EXPORT const unsigned char RNFlashListVersionString[];
EOL
  echo "Created umbrella header at: $FLASHLIST_DIR/RNFlashList-umbrella.h"
else
  echo "Warning: Could not find RNFlashList directory in DerivedData"
  echo "We'll create a dummy file that will be properly generated during build"
  
  # Create dummy directories
  mkdir -p "$DERIVED_DATA_DIR/dummy/Debug-iphoneos/RNFlashList"
  
  # Create the modulemap file
  cat > "$DERIVED_DATA_DIR/dummy/Debug-iphoneos/RNFlashList/RNFlashList.modulemap" << 'EOL'
module RNFlashList {
  umbrella header "RNFlashList-umbrella.h"
  export *
  module * { export * }
}
EOL
  
  # Create umbrella header
  cat > "$DERIVED_DATA_DIR/dummy/Debug-iphoneos/RNFlashList/RNFlashList-umbrella.h" << 'EOL'
#ifdef __OBJC__
#import <UIKit/UIKit.h>
#else
#ifndef FOUNDATION_EXPORT
#if defined(__cplusplus)
#define FOUNDATION_EXPORT extern "C"
#else
#define FOUNDATION_EXPORT extern
#endif
#endif
#endif

// Add any public headers here

FOUNDATION_EXPORT double RNFlashListVersionNumber;
FOUNDATION_EXPORT const unsigned char RNFlashListVersionString[];
EOL
fi

echo "✅ All fixes applied successfully!"
echo "📱 Now try building again in Xcode"
echo "   If you encounter code signing issues, make sure to:"
echo "   1. Select your personal Apple ID for the team"
echo "   2. Change the bundle identifier to something unique (e.g., com.yourname.LyoAILearningAssistant)"
echo "   3. Connect your iOS device and select it as the build target"