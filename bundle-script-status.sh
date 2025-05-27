#!/bin/bash
# Summary script to check if all the fixes have been applied correctly

echo "==== React Native Bundle Script Status Check ===="
echo "Date: $(date)"

# Check if the simple-bundle.sh script exists and is executable
if [ -f "ios/simple-bundle.sh" ] && [ -x "ios/simple-bundle.sh" ]; then
  echo "✅ simple-bundle.sh exists and is executable"
else
  echo "❌ simple-bundle.sh has issues:"
  [ -f "ios/simple-bundle.sh" ] || echo "   - File does not exist"
  [ -x "ios/simple-bundle.sh" ] || echo "   - File is not executable"
  chmod +x ios/simple-bundle.sh 2>/dev/null
  echo "   - Attempted to make it executable"
fi

# Check if the Xcode project is configured to use simple-bundle.sh
if grep -q "shellScript = \"\.\.\/simple-bundle\.sh\";" "ios/LyoAILearningAssistant.xcodeproj/project.pbxproj"; then
  echo "✅ Xcode project is configured to use simple-bundle.sh"
else
  echo "❌ Xcode project is NOT configured to use simple-bundle.sh"
  echo "   Current configuration: $(grep -A 1 "shellPath = /bin/bash" ios/LyoAILearningAssistant.xcodeproj/project.pbxproj | grep "shellScript" | head -1)"
fi

# Check the output directories
echo
echo "==== Output Directories Status ===="
if [ -d "ios/build" ]; then
  echo "✅ Build directory exists"
  BUNDLE_DIR="${CONFIGURATION_BUILD_DIR:-ios/build}/${UNLOCALIZED_RESOURCES_FOLDER_PATH:-Resources}"
  echo "📂 Expected bundle directory: $BUNDLE_DIR"
  mkdir -p "$BUNDLE_DIR" 2>/dev/null
  echo "   - Attempted to create it if it didn't exist"
else
  echo "ℹ️ Build directory doesn't exist yet (will be created during build)"
fi

# Checking for timestamp directory
if [ -n "${DERIVED_FILE_DIR:-}" ] && [ -d "${DERIVED_FILE_DIR}" ]; then
  echo "✅ DERIVED_FILE_DIR exists: ${DERIVED_FILE_DIR}"
else
  echo "ℹ️ DERIVED_FILE_DIR is not set or directory doesn't exist"
  echo "   - Timestamp file will use fallback location in the bundle script"
  # Create a fallback directory just in case
  mkdir -p "ios/build/derived" 2>/dev/null
fi

echo
echo "==== Next Steps ===="
echo "1. Try building the project in Xcode"
echo "2. If you still encounter issues, check the Xcode build log for specific errors"
echo "3. For advanced troubleshooting, run: ./run-lyo-in-xcode.sh (if available)"
echo
echo "For additional assistance, check the script output at each stage of the build process."
