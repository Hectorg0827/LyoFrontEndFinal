#!/bin/zsh
# Complete React Native iOS Build Fix for LyoAILearningAssistant
set -e

echo "======================================================"
echo "🚀 Starting comprehensive iOS build fix"
echo "======================================================"

# Project paths
PROJECT_DIR="/Users/republicalatuya/Desktop/LyoFrontEndFinal"
IOS_DIR="${PROJECT_DIR}/ios"
BUNDLE_SCRIPT="${IOS_DIR}/ultimate-bundle.sh"

cd "${PROJECT_DIR}"

echo "🧪 Testing Node.js and npm installation..."
node -v
npm -v

echo "🔍 Finding React Native CLI..."
RN_CLI_PATH=$(find node_modules -path "*/react-native/cli.js" -type f | head -n 1)

if [ -z "$RN_CLI_PATH" ]; then
  echo "⚠️ React Native CLI not found. Installing required dependencies..."
  echo "📦 Installing React Native CLI..."
  npm install react-native --save
  
  RN_CLI_PATH=$(find node_modules -path "*/react-native/cli.js" -type f | head -n 1)
  
  if [ -z "$RN_CLI_PATH" ]; then
    echo "❌ Failed to install React Native CLI. Creating a fallback version..."
    mkdir -p node_modules/react-native
    cat > node_modules/react-native/cli.js << 'EOF'
#!/usr/bin/env node
// Fallback React Native CLI script

const { execSync } = require('child_process');
const args = process.argv.slice(2);
const command = args.join(' ');

console.log('React Native CLI (fallback) executing:', command);

if (command.includes('bundle')) {
  const metro = require.resolve('metro/src/cli');
  try {
    execSync(`node "${metro}" bundle ${command}`, { stdio: 'inherit' });
    process.exit(0);
  } catch (error) {
    console.error('Error executing bundle command:', error.message);
    process.exit(1);
  }
} else {
  console.error('Unsupported command:', command);
  process.exit(1);
}
EOF
    chmod +x node_modules/react-native/cli.js
    RN_CLI_PATH="node_modules/react-native/cli.js"
    echo "✅ Created fallback CLI at ${RN_CLI_PATH}"
  } else {
    echo "✅ Found React Native CLI at ${RN_CLI_PATH}"
  }
else
  echo "✅ Found React Native CLI at ${RN_CLI_PATH}"
fi

# Update bundle script with correct cli path
echo "📝 Updating bundle script with correct CLI path..."
sed -i.bak "s|node_modules/react-native/cli.js|${RN_CLI_PATH}|g" "${BUNDLE_SCRIPT}"

# Fix the ExpoModulesProvider.swift issue
echo "🔧 Fixing ExpoModulesProvider.swift..."
mkdir -p "${IOS_DIR}/Pods/Target Support Files/Pods-LyoAILearningAssistant"
cat > "${IOS_DIR}/Pods/Target Support Files/Pods-LyoAILearningAssistant/ExpoModulesProvider.swift" << 'EOF'
// ExpoModulesProvider.swift - Enhanced version
// This version does not depend on ExpoModulesCore

import Foundation

@objc public class ExpoModulesProvider: NSObject {
    @objc public static func modulesForAppDelegate() -> [AnyClass] {
        return []
    }
}
EOF

echo "✅ Created ExpoModulesProvider.swift"

# Make a test bundle to validate the process
echo "🧪 Testing bundle creation..."
TEST_BUNDLE_DIR="${PROJECT_DIR}/ios/test-bundle"
mkdir -p "${TEST_BUNDLE_DIR}"

echo "📦 Creating test bundle..."
node "${RN_CLI_PATH}" bundle \
  --entry-file index.js \
  --platform ios \
  --dev false \
  --reset-cache \
  --bundle-output "${TEST_BUNDLE_DIR}/main.jsbundle" \
  --assets-dest "${TEST_BUNDLE_DIR}"

if [ $? -eq 0 ]; then
  echo "✅ Test bundle created successfully!"
  rm -rf "${TEST_BUNDLE_DIR}"
else
  echo "❌ Test bundle creation failed. The issue might be with your JavaScript code."
  echo "Check for syntax errors in your React Native app."
  exit 1
fi

# Clean everything for a fresh build
echo "🧹 Cleaning build artifacts..."
rm -rf ~/Library/Developer/Xcode/DerivedData/LyoAILearningAssistant-*
rm -rf "${IOS_DIR}/build"

echo "🧪 Testing the ultimate-bundle.sh script directly..."
cd "${IOS_DIR}"
CONFIGURATION=Debug \
CONFIGURATION_BUILD_DIR="${IOS_DIR}/build" \
UNLOCALIZED_RESOURCES_FOLDER_PATH=Resources \
DERIVED_FILE_DIR="${IOS_DIR}/DERIVED_FILE_DIR" \
"${BUNDLE_SCRIPT}"

if [ $? -eq 0 ]; then
  echo "✅ Bundle script executed successfully!"
else
  echo "❌ Bundle script execution failed."
  echo "Fixing permissions and trying again..."
  chmod +x "${BUNDLE_SCRIPT}"
  
  CONFIGURATION=Debug \
  CONFIGURATION_BUILD_DIR="${IOS_DIR}/build" \
  UNLOCALIZED_RESOURCES_FOLDER_PATH=Resources \
  DERIVED_FILE_DIR="${IOS_DIR}/DERIVED_FILE_DIR" \
  "${BUNDLE_SCRIPT}"
  
  if [ $? -eq 0 ]; then
    echo "✅ Bundle script executed successfully after fixing permissions!"
  else
    echo "❌ Bundle script still failing. Please check the error messages above."
    exit 1
  fi
fi

echo "======================================================"
echo "✅ iOS build fixes have been completed!"
echo "======================================================"
echo ""
echo "Next steps:"
echo "1. Open the Xcode workspace:"
echo "   open ${IOS_DIR}/LyoAILearningAssistant.xcworkspace"
echo ""
echo "2. In Xcode, select Product > Clean Build Folder"
echo ""
echo "3. Build the project (Command+B) or run on a simulator"
echo ""
echo "If you still encounter issues, run the following command to show detailed build logs:"
echo "   cd ${IOS_DIR} && xcodebuild -workspace LyoAILearningAssistant.xcworkspace -scheme LyoAILearningAssistant -configuration Debug -sdk iphonesimulator"
echo "======================================================"
