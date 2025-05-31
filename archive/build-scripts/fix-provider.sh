#!/bin/zsh
# Fix ExpoModulesProvider issue by copying the file directly to the project

echo "📄 Copying ExpoModulesProvider.swift to project..."

# Create the provider file in the project directory
cat > /Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/LyoAILearningAssistant/ExpoModulesProvider.swift << 'EOF'
// ExpoModulesProvider.swift - Manual fix

import Foundation
import ExpoModulesCore

// The provider serves as a way for React Native code to access
// native modules that aren't directly importable through JS code
public class ExpoModulesProvider: ModuleRegistryProvider {
  public override func moduleClasses(for moduleType: ModuleType) -> [Module.Type] {
    return []
  }
}
EOF

echo "✅ Done! Now try building in Xcode again."
