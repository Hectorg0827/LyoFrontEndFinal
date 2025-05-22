#!/bin/zsh
# Manual fix for React Native bundle script build phase issues

echo "🚀 Applying manual fix for React Native bundle script issues..."

# Navigate to project root directory
cd "$(dirname "$0")"

# Create the React Native bundle output directory
mkdir -p ios/build/generated
mkdir -p ios/LyoAILearningAssistant/bundle

# Create a bundle-fixes.sh script with the corrected configuration
cat > ios/bundle-fixes.sh << 'EOF'
#!/bin/zsh
# Modified bundle script to fix build issues

# Exit if any command fails
set -e

# Bundle the app
export NODE_BINARY=node
export BUNDLE_COMMAND="bundle"
export SOURCEMAP_FILE="${CONFIGURATION_BUILD_DIR}/${UNLOCALIZED_RESOURCES_FOLDER_PATH}/main.jsbundle.map"

# Create output directory
DEST="${CONFIGURATION_BUILD_DIR}/${UNLOCALIZED_RESOURCES_FOLDER_PATH}"
mkdir -p "$DEST"

# Make sure we have a clean output file
BUNDLE_OUTPUT="$DEST/main.jsbundle"
if [ -f "$BUNDLE_OUTPUT" ]; then
  echo "Bundle already exists, removing..."
  rm "$BUNDLE_OUTPUT"
fi

# Run the bundle script with explicit output path
"$NODE_BINARY" -e "require('path').dirname(require.resolve('react-native/package.json')) + '/scripts/react-native-xcode.sh'"

# Create a timestamp file to mark successful execution
touch "${DERIVED_FILE_DIR}/react-native-bundle.timestamp"
EOF

# Make the bundle fixes script executable
chmod +x ios/bundle-fixes.sh

echo ""
echo "✅ Created a fixed bundle script at ios/bundle-fixes.sh"
echo ""
echo "Next, you'll need to update Xcode to use this script:"
echo ""
echo "1. Open your Xcode project: open ios/LyoAILearningAssistant.xcworkspace"
echo "2. Select your project in the navigator"
echo "3. Select your target (LyoAILearningAssistant)"
echo "4. Go to the 'Build Phases' tab"
echo "5. Find and expand the 'Bundle React Native code and images' build phase"
echo "6. Replace the script content with: ../bundle-fixes.sh"
echo "7. Make sure 'Based on dependency analysis' is checked"
echo "8. Click the + button under 'Output Files' and add: \${DERIVED_FILE_DIR}/react-native-bundle.timestamp"
echo "9. Clean and build the project"
echo ""
echo "This will ensure the bundle script runs correctly and only when necessary."
