#!/bin/bash
set -e

# Script to fix missing ExpoModulesProvider.swift file

echo "🔧 Fixing missing ExpoModulesProvider.swift issue..."

# Directory path
TARGET_DIR="/Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/Pods/Target Support Files/Pods-LyoAILearningAssistant"

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

echo "✅ Created ExpoModulesProvider.swift file at: $TARGET_DIR/ExpoModulesProvider.swift"
echo "📱 Now try building again in Xcode"