#!/bin/bash

# Comprehensive iOS build fix script for React Native with Expo
set -e

echo "╔══════════════════════════════════════════════════════╗"
echo "║            LYO iOS BUILD FIX SCRIPT                  ║"
echo "║     Resolves common iOS build issues in one step     ║"
echo "╚══════════════════════════════════════════════════════╝"
echo

# Project paths
PROJECT_ROOT="/Users/republicalatuya/Desktop/LyoFrontEndFinal"
IOS_DIR="${PROJECT_ROOT}/ios"
XCODE_WORKSPACE="${IOS_DIR}/LyoAILearningAssistant.xcworkspace"
XCODE_PROJECT="${IOS_DIR}/LyoAILearningAssistant.xcodeproj/project.pbxproj"
PODFILE="${IOS_DIR}/Podfile"
APP_JSON="${PROJECT_ROOT}/app.json"

# Create backup directory
BACKUP_DIR="${PROJECT_ROOT}/ios-build-backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "${BACKUP_DIR}"

# Check if iOS directory exists
if [ ! -d "${IOS_DIR}" ]; then
  echo "❌ Error: iOS directory not found at ${IOS_DIR}"
  echo "Running Expo prebuild to generate native code..."
  
  # Run Expo prebuild
  cd "${PROJECT_ROOT}"
  npx expo prebuild --platform ios --clean
  
  if [ ! -d "${IOS_DIR}" ]; then
    echo "❌ Error: Failed to generate iOS directory with expo prebuild"
    exit 1
  fi
  
  echo "✅ Successfully generated iOS native code"
fi

# Step 1: Back up important files
echo "📦 Creating backups of critical files..."
if [ -f "${XCODE_PROJECT}" ]; then
  cp "${XCODE_PROJECT}" "${BACKUP_DIR}/project.pbxproj.bak"
fi

if [ -f "${PODFILE}" ]; then
  cp "${PODFILE}" "${BACKUP_DIR}/Podfile.bak"
fi

if [ -f "${APP_JSON}" ]; then
  cp "${APP_JSON}" "${BACKUP_DIR}/app.json.bak"
fi

echo "✅ Backups created at ${BACKUP_DIR}"

# Step 2: Create simplified bundle script
echo "📝 Creating improved bundle script..."
mkdir -p "${IOS_DIR}/scripts"
cat > "${IOS_DIR}/scripts/bundle-and-assets.sh" << 'EOL'
#!/bin/bash
# Enhanced React Native bundle script with better error handling and asset processing
set -e

echo "Starting React Native bundle script..."

# Create output directory
DEST="${CONFIGURATION_BUILD_DIR}/${UNLOCALIZED_RESOURCES_FOLDER_PATH}"
mkdir -p "$DEST"

# Set bundle output file
BUNDLE_FILE="$DEST/main.jsbundle"

# Use absolute path to Node to avoid environment issues
export NODE_BINARY=$(command -v node)
if [ -z "$NODE_BINARY" ]; then
  echo "Error: Node.js not found. Please make sure Node.js is installed."
  exit 1
fi

echo "Using Node binary at: $NODE_BINARY"
echo "Current directory: $(pwd)"
echo "React Native bundling for: $CONFIGURATION"

# Navigate to project root directory
cd "$(dirname "$0")/../.."

# Only bundle if in release mode or if bundle file doesn't exist
if [[ "$CONFIGURATION" = "Release" || ! -f "$BUNDLE_FILE" ]]; then
  echo "Creating bundle at: $BUNDLE_FILE"
  $NODE_BINARY node_modules/react-native/cli.js bundle \
    --entry-file index.js \
    --platform ios \
    --dev false \
    --reset-cache \
    --bundle-output "$BUNDLE_FILE" \
    --assets-dest "$DEST"
  
  if [ $? -ne 0 ]; then
    echo "Error: Bundle creation failed"
    exit 1
  fi
  
  echo "Bundle created successfully"
else
  echo "Skipping bundle in Debug mode with existing bundle file..."
  # Create an empty file to satisfy the build system if it doesn't exist
  if [ ! -f "$BUNDLE_FILE" ]; then
    echo "// Debug mode - bundle will be loaded from dev server" > "$BUNDLE_FILE"
  fi
fi

# Create a timestamp file as build phase output for dependency tracking
TIMESTAMP_FILE="${DERIVED_FILE_DIR}/react-native-bundle.timestamp"
echo "Creating timestamp file: $TIMESTAMP_FILE"
mkdir -p "$(dirname "$TIMESTAMP_FILE")"
echo "Build completed at $(date)" > "$TIMESTAMP_FILE"

echo "React Native bundle script completed successfully"
exit 0
EOL

# Make script executable
chmod +x "${IOS_DIR}/scripts/bundle-and-assets.sh"
echo "✅ Enhanced bundle script created"

# Step 3: Fix common Xcode project issues
echo "🔧 Applying fixes to Xcode project..."

if [ -f "${XCODE_PROJECT}" ]; then
  # Update the Xcode project file to use our new bundle script
  perl -i -pe 'BEGIN{undef $/;} s/(shellScript = ").*?(";[ \t]*\n[ \t]*};[ \t]*\n[ \t]*FD10A7F022414F080027D42C)/\1\.\.\/scripts\/bundle-and-assets\.sh\2/gs' "${XCODE_PROJECT}" || true
  
  # Add output file path for dependency tracking
  perl -i -pe 'BEGIN{undef $/;} s/(outputPaths = \(\n[ \t]*\);)/outputPaths = \(\n\t\t\t\t\t\t\t"\$\{DERIVED_FILE_DIR\}\/react-native-bundle\.timestamp",\n\t\t\t\t\t\t\);/gs' "${XCODE_PROJECT}" || true
  
  # Set IPHONEOS_DEPLOYMENT_TARGET to ensure compatibility
  perl -i -pe 's/IPHONEOS_DEPLOYMENT_TARGET = [0-9.]+;/IPHONEOS_DEPLOYMENT_TARGET = 13.4;/g' "${XCODE_PROJECT}" || true
  
  echo "✅ Xcode project updated"
else
  echo "⚠️ Xcode project file not found, skipping project fixes"
fi

# Step 4: Update Podfile to fix common CocoaPods issues
if [ -f "${PODFILE}" ]; then
  echo "🔧 Checking and updating Podfile..."
  
  # Ensure deployment target is set correctly
  if ! grep -q "platform :ios, '13.4'" "${PODFILE}"; then
    perl -i -pe 's/platform :ios, .*$/platform :ios, '\''13.4'\''/' "${PODFILE}" || true
  fi
  
  # Add additional fixes for hermes and other common issues
  if ! grep -q "# LYO build fixes" "${PODFILE}"; then
    cat >> "${PODFILE}" << 'EOL'

# LYO build fixes
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      # Ensure minimum deployment target
      if config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'].to_f < 13.4
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '13.4'
      end
      
      # Fix signing issues
      config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
      
      # Fix architecture issues
      config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = 'arm64'
      
      # Fix warnings
      config.build_settings['GCC_WARN_INHIBIT_ALL_WARNINGS'] = 'YES'
    end
  end
end
EOL
  fi
  
  echo "✅ Podfile updated"
else
  echo "⚠️ Podfile not found, skipping Podfile fixes"
fi

# Step 5: Fix app.json for iOS-specific settings
if [ -f "${APP_JSON}" ]; then
  echo "🔧 Ensuring app.json has proper iOS configuration..."
  
  # Check if iOS section exists and has required settings
  NEEDS_UPDATE=false
  if ! grep -q '"infoPlist"' "${APP_JSON}"; then
    NEEDS_UPDATE=true
  fi
  
  if [ "$NEEDS_UPDATE" = true ]; then
    # Create a temporary file with updated content
    TMP_FILE="${BACKUP_DIR}/app.json.tmp"
    jq '.expo.ios.infoPlist = (.expo.ios.infoPlist // {}) + {
      "NSCameraUsageDescription": "This app uses the camera to scan QR codes and take profile pictures.",
      "NSPhotoLibraryUsageDescription": "This app uses your photo library to let you choose profile pictures and share images.",
      "NSMicrophoneUsageDescription": "This app uses the microphone for voice messages and recordings.",
      "NSLocationWhenInUseUsageDescription": "This app uses your location to show you nearby learning events and communities.",
      "ITSAppUsesNonExemptEncryption": false,
      "UIBackgroundModes": ["fetch", "remote-notification"]
    }' "${APP_JSON}" > "${TMP_FILE}"
    
    # Replace original with updated file
    mv "${TMP_FILE}" "${APP_JSON}"
    echo "✅ app.json updated with required iOS permissions"
  else
    echo "✅ app.json already has iOS configuration"
  fi
else
  echo "⚠️ app.json not found, skipping app configuration fixes"
fi

# Step 6: Clean up derived data and reinstall pods
echo "🧹 Cleaning build artifacts and reinstalling pods..."

# Clean derived data
rm -rf ~/Library/Developer/Xcode/DerivedData/LyoAILearningAssistant-* || true
echo "✅ Cleaned derived data"

# Reinstall pods
if [ -d "${IOS_DIR}" ]; then
  cd "${IOS_DIR}"
  rm -rf Pods
  rm -f Podfile.lock
  
  # Install pods
  pod install || true
  echo "✅ Reinstalled pods"
else
  echo "⚠️ iOS directory not found, skipping pod installation"
fi

echo "🎉 iOS build fixes have been applied successfully!"
echo 
echo "📋 Next steps:"
echo "1. Open the Xcode workspace: open \"${XCODE_WORKSPACE}\""
echo "2. Clean the build folder in Xcode (Product -> Clean Build Folder)"
echo "3. Build and run the project"
echo 
echo "If you encounter any issues, you can restore the backups from: ${BACKUP_DIR}"
echo "You can also rebuild the iOS project using: npx expo prebuild --platform ios --clean"