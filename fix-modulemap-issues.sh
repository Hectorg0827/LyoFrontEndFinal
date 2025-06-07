#!/bin/bash
set -e

# Script to fix module map issues for RNFlashList

echo "🔧 Fixing RNFlashList module map issues..."

# Path to files
IOS_DIR="/Users/republicalatuya/Desktop/LyoFrontEndFinal/ios"
PODFILE="$IOS_DIR/Podfile"
DEBUG_XCCONFIG="$IOS_DIR/Pods/Target Support Files/Pods-LyoAILearningAssistant/Pods-LyoAILearningAssistant.debug.xcconfig"
RELEASE_XCCONFIG="$IOS_DIR/Pods/Target Support Files/Pods-LyoAILearningAssistant/Pods-LyoAILearningAssistant.release.xcconfig"

# Create a backup of the Podfile
cp "$PODFILE" "${PODFILE}.backup"

echo "🔄 Approach 1: Modifying Podfile to disable module maps for RNFlashList..."
# Check if the Podfile already has RNFlashList modification
if ! grep -q "RNFlashList.build_settings\['DEFINES_MODULE'\] = 'NO'" "$PODFILE"; then
  # Add the configuration to disable module maps for RNFlashList
  awk '/post_install do \|installer\|/{print; print "    # Disable module maps for RNFlashList to fix build issues"; print "    installer.pods_project.targets.each do |target|"; print "      if target.name == \"RNFlashList\""; print "        target.build_configurations.each do |config|"; print "          config.build_settings[\"DEFINES_MODULE\"] = \"NO\""; print "        end"; print "      end"; print "    end"; next}1' "$PODFILE" > "${PODFILE}.tmp"
  mv "${PODFILE}.tmp" "$PODFILE"
  echo "Modified Podfile to disable module maps for RNFlashList"
else
  echo "Podfile already has RNFlashList module map fix"
fi

echo "🔄 Approach 2: Removing RNFlashList module map references from xcconfig files..."
# Remove references to RNFlashList.modulemap from xcconfig files
sed -i '' 's/-fmodule-map-file="${PODS_CONFIGURATION_BUILD_DIR}\/RNFlashList\/RNFlashList.modulemap" //g' "$DEBUG_XCCONFIG"
sed -i '' 's/-fmodule-map-file="${PODS_CONFIGURATION_BUILD_DIR}\/RNFlashList\/RNFlashList.modulemap" //g' "$RELEASE_XCCONFIG"

# Remove from SWIFT_INCLUDE_PATHS
sed -i '' 's/"${PODS_CONFIGURATION_BUILD_DIR}\/RNFlashList" //g' "$DEBUG_XCCONFIG"
sed -i '' 's/"${PODS_CONFIGURATION_BUILD_DIR}\/RNFlashList" //g' "$RELEASE_XCCONFIG"

echo "🔄 Approach 3: Creating dummy modulemap file..."
# Get the derived data path
DERIVED_DATA_DIR="/Users/republicalatuya/Library/Developer/Xcode/DerivedData"

# Create dummy RNFlashList directory and files in all possible locations
for BUILD_DIR in $(find "$DERIVED_DATA_DIR" -path "*LyoAILearningAssistant*" -type d 2>/dev/null); do
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

echo "✅ All module map fixes applied!"
echo "📱 Now you need to rebuild the app:"
echo "   1. Go to the project directory and run:"
echo "      cd ios && pod install"
echo "   2. Open Xcode and build the app:"
echo "      open LyoAILearningAssistant.xcworkspace"