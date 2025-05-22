#!/bin/zsh
# Direct fix for Bundle React Native code and images build phase
# This creates a simplified bundle script that should work reliably

echo "🚀 Creating a simplified bundle script for React Native..."

# Navigate to project root directory
cd "$(dirname "$0")"

# Create a simplified bundle shell script
cat > ios/simple-bundle.sh << 'EOF'
#!/bin/bash
# Simplified React Native bundle script

set -e

# Create output directory
DEST="${CONFIGURATION_BUILD_DIR}/${UNLOCALIZED_RESOURCES_FOLDER_PATH}"
mkdir -p "$DEST"

# Set bundle output file
BUNDLE_FILE="$DEST/main.jsbundle"

# Create the JS bundle
export NODE_BINARY=node
cd "$(dirname "$0")/.."

# Only bundle if in release mode
if [[ "$CONFIGURATION" = "Release" ]]; then
  echo "Creating production bundle..."
  $NODE_BINARY node_modules/react-native/cli.js bundle \
    --entry-file index.js \
    --platform ios \
    --dev false \
    --reset-cache \
    --bundle-output "$BUNDLE_FILE" \
    --assets-dest "$DEST"
else
  echo "Skipping bundle in Debug mode..."
  # Create an empty file to satisfy the build system
  echo "// Debug mode - bundle will be loaded from dev server" > "$BUNDLE_FILE"
fi

# Create a timestamp file as build phase output
echo "Build completed at $(date)" > "${DERIVED_FILE_DIR}/react-native-bundle.timestamp"
EOF

# Make the script executable
chmod +x ios/simple-bundle.sh

echo ""
echo "✅ Created a simplified bundle script at ios/simple-bundle.sh"
echo ""
echo "Next steps:"
echo "1. Open your Xcode project: open ios/LyoAILearningAssistant.xcworkspace"
echo "2. Select your project in the navigator"
echo "3. Select your target (LyoAILearningAssistant)"
echo "4. Go to the 'Build Phases' tab"
echo "5. Find the 'Bundle React Native code and images' build phase"
echo "6. Replace the script content with: ../simple-bundle.sh"
echo "7. Add an output file: \${DERIVED_FILE_DIR}/react-native-bundle.timestamp"
echo "8. Clean and build the project"
echo ""
echo "This simplified script focuses on just the core functionality needed to create the bundle."
