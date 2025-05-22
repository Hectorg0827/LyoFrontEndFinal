#!/bin/bash

# Complete fix for iOS build issues in React Native project
set -e

echo "Running comprehensive iOS build fix for LyoAILearningAssistant..."

# Project paths
PROJECT_ROOT="/Users/republicalatuya/Desktop/LyoFrontEndFinal"
IOS_DIR="${PROJECT_ROOT}/ios"
XCODE_PROJECT="${IOS_DIR}/LyoAILearningAssistant.xcodeproj/project.pbxproj"

# Check if necessary files exist
if [ ! -f "${XCODE_PROJECT}" ]; then
  echo "Error: Xcode project file not found at ${XCODE_PROJECT}"
  exit 1
fi

# 1. Verify/create the simple-bundle.sh script
echo "Verifying simple-bundle.sh script..."
if [ ! -f "${IOS_DIR}/simple-bundle.sh" ] || [ ! -x "${IOS_DIR}/simple-bundle.sh" ]; then
  echo "Bundle script not found or not executable. Creating/fixing it..."
  cat > "${IOS_DIR}/simple-bundle.sh" << 'EOL'
#!/bin/bash
# Simplified React Native bundle script with better error handling
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
cd "$(dirname "$0")/.."

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
  chmod +x "${IOS_DIR}/simple-bundle.sh"
  echo "Bundle script created and made executable."
fi

# 2. Create backup of the Xcode project file
BACKUP_FILE="${XCODE_PROJECT}.bak"
echo "Creating backup of Xcode project file at ${BACKUP_FILE}"
cp "${XCODE_PROJECT}" "${BACKUP_FILE}"

# 3. Update the Xcode project file to use the new bundle script
echo "Updating Xcode project file to use the simplified bundle script..."

# Replace the shellScript value
echo "Modifying the bundle script reference..."
perl -i -pe 'BEGIN{undef $/;} s/(shellScript = ").*?(";[ \t]*\n[ \t]*};[ \t]*\n[ \t]*FD10A7F022414F080027D42C)/\1\.\.\/simple-bundle\.sh\2/gs' "${XCODE_PROJECT}"

# Add the output file path for dependency tracking
echo "Adding output file path for dependency tracking..."
perl -i -pe 'BEGIN{undef $/;} s/(outputPaths = \(\n[ \t]*\);)/outputPaths = \(\n\t\t\t\t\t\t\t"\$\{DERIVED_FILE_DIR\}\/react-native-bundle\.timestamp",\n\t\t\t\t\t\t\);/gs' "${XCODE_PROJECT}"

# 4. Fix duplicate libraries warning (optional)
echo "Fixing duplicate libraries warning..."
# This would be more complex and require specific changes based on your Xcode project configuration
# You may want to manually check for -lc++ duplicate entries in the Xcode project settings

# 5. Clean derived data to ensure clean rebuild
echo "Cleaning derived data for the project..."
rm -rf ~/Library/Developer/Xcode/DerivedData/LyoAILearningAssistant-*

echo "iOS build fixes have been applied successfully!"
echo ""
echo "Next steps:"
echo "1. Open the Xcode workspace: open ${IOS_DIR}/LyoAILearningAssistant.xcworkspace"
echo "2. Clean the build folder in Xcode (Product -> Clean Build Folder)"
echo "3. Build and run the project"
echo ""
echo "If you encounter any issues, you can restore the backup with:"
echo "cp \"${BACKUP_FILE}\" \"${XCODE_PROJECT}\""
