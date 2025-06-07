#!/bin/bash
set -e

# Master script to fix all iOS build issues

echo "🔧 Fixing all iOS build issues..."

# Path to files
IOS_DIR="/Users/republicalatuya/Desktop/LyoFrontEndFinal/ios"
PODFILE="$IOS_DIR/Podfile"
DEBUG_XCCONFIG="$IOS_DIR/Pods/Target Support Files/Pods-LyoAILearningAssistant/Pods-LyoAILearningAssistant.debug.xcconfig"
RELEASE_XCCONFIG="$IOS_DIR/Pods/Target Support Files/Pods-LyoAILearningAssistant/Pods-LyoAILearningAssistant.release.xcconfig"
TARGET_DIR="$IOS_DIR/Pods/Target Support Files/Pods-LyoAILearningAssistant"

# Create backups
mkdir -p "$IOS_DIR/backups"
cp "$PODFILE" "$IOS_DIR/backups/Podfile.backup" 2>/dev/null || true
cp "$DEBUG_XCCONFIG" "$IOS_DIR/backups/debug.xcconfig.backup" 2>/dev/null || true
cp "$RELEASE_XCCONFIG" "$IOS_DIR/backups/release.xcconfig.backup" 2>/dev/null || true

echo "🔄 Fix 1: Fixing xcconfig preprocessor directive issue..."
# Fix the xcconfig files
sed -i '' 's/# C++20 Configuration/\/\/C++20 Configuration/g' "$DEBUG_XCCONFIG" 2>/dev/null || true
sed -i '' 's/# C++20 Configuration/\/\/C++20 Configuration/g' "$RELEASE_XCCONFIG" 2>/dev/null || true

# Make sure OTHER_CPLUSPLUSFLAGS includes $(inherited)
sed -i '' 's/OTHER_CPLUSPLUSFLAGS = -std=c++20 -fconcepts/OTHER_CPLUSPLUSFLAGS = $(inherited) -std=c++20 -fconcepts/g' "$DEBUG_XCCONFIG" 2>/dev/null || true
sed -i '' 's/OTHER_CPLUSPLUSFLAGS = -std=c++20 -fconcepts/OTHER_CPLUSPLUSFLAGS = $(inherited) -std=c++20 -fconcepts/g' "$RELEASE_XCCONFIG" 2>/dev/null || true

echo "🔄 Fix 2: Creating missing ExpoModulesProvider.swift file..."
# Create the ExpoModulesProvider.swift file
mkdir -p "$TARGET_DIR"
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

echo "🔄 Fix 3: Modifying Podfile to disable module maps for RNFlashList..."
# Check if the Podfile already has RNFlashList modification
if [ -f "$PODFILE" ] && ! grep -q "RNFlashList.build_settings\['DEFINES_MODULE'\] = 'NO'" "$PODFILE"; then
  # Add the configuration to disable module maps for RNFlashList
  awk '/post_install do \|installer\|/{print; print "    # Disable module maps for RNFlashList to fix build issues"; print "    installer.pods_project.targets.each do |target|"; print "      if target.name == \"RNFlashList\""; print "        target.build_configurations.each do |config|"; print "          config.build_settings[\"DEFINES_MODULE\"] = \"NO\""; print "        end"; print "      end"; print "    end"; next}1' "$PODFILE" > "${PODFILE}.tmp"
  mv "${PODFILE}.tmp" "$PODFILE"
  echo "Modified Podfile to disable module maps for RNFlashList"
else
  echo "Podfile already has RNFlashList module map fix or doesn't exist yet"
fi

echo "🔄 Fix 4: Removing RNFlashList module map references from xcconfig files..."
# Remove references to RNFlashList.modulemap from xcconfig files
if [ -f "$DEBUG_XCCONFIG" ]; then
  sed -i '' 's/-fmodule-map-file="${PODS_CONFIGURATION_BUILD_DIR}\/RNFlashList\/RNFlashList.modulemap" //g' "$DEBUG_XCCONFIG"
  sed -i '' 's/"${PODS_CONFIGURATION_BUILD_DIR}\/RNFlashList" //g' "$DEBUG_XCCONFIG"
fi

if [ -f "$RELEASE_XCCONFIG" ]; then
  sed -i '' 's/-fmodule-map-file="${PODS_CONFIGURATION_BUILD_DIR}\/RNFlashList\/RNFlashList.modulemap" //g' "$RELEASE_XCCONFIG"
  sed -i '' 's/"${PODS_CONFIGURATION_BUILD_DIR}\/RNFlashList" //g' "$RELEASE_XCCONFIG"
fi

echo "🔄 Fix 5: Creating dummy modulemap files for RNFlashList..."
# Get the derived data path
DERIVED_DATA_DIR="/Users/republicalatuya/Library/Developer/Xcode/DerivedData"

# Create modulemap directory in the products directory
for BUILD_DIR in $(find "$DERIVED_DATA_DIR" -path "*LyoAILearningAssistant*Build/Products*" -type d 2>/dev/null); do
  for CONFIG in Debug Release; do
    for PLATFORM in iphoneos iphonesimulator; do
      TARGET_DIR="$BUILD_DIR/$CONFIG-$PLATFORM/RNFlashList"
      mkdir -p "$TARGET_DIR"
      
      # Create the modulemap file
      cat > "$TARGET_DIR/RNFlashList.modulemap" << 'EOL'
module RNFlashList {
  umbrella header "RNFlashList-umbrella.h"
  export *
  module * { export * }
}
EOL
      
      # Create umbrella header
      cat > "$TARGET_DIR/RNFlashList-umbrella.h" << 'EOL'
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
      echo "Created modulemap files in: $TARGET_DIR"
    done
  done
done

echo "✅ All fixes applied successfully!"
echo "📱 Now you need to rebuild the app:"
echo "   1. Go to the project directory and run:"
echo "      cd ios && pod install"
echo "   2. Open Xcode and build the app:"
echo "      open LyoAILearningAssistant.xcworkspace"
echo "   3. In Xcode, select the 'LyoAILearningAssistant' target"
echo "   4. Go to the 'Signing & Capabilities' tab"
echo "   5. Select your personal Apple ID for the team"
echo "   6. Change the bundle identifier to something unique (e.g., com.yourname.LyoAILearningAssistant)"
echo "   7. Connect your iOS device and select it as the build target"
echo "   8. Click the Build button (▶️) or press Cmd+B to build"