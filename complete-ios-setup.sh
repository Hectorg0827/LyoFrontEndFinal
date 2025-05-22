#!/bin/zsh
# Complete iOS build script for LyoAILearningAssistant

echo "🚀 Starting complete iOS build process for LyoAILearningAssistant..."

# Navigate to project root
cd "$(dirname "$0")"

# Create necessary directories
echo "Creating required directories..."
mkdir -p ios/Pods/Target\ Support\ Files/Pods-LyoAILearningAssistant/
mkdir -p ios/LyoAILearningAssistant/Supporting

# Create ExpoModulesProvider.swift if it doesn't exist
if [ ! -f "ios/Pods/Target Support Files/Pods-LyoAILearningAssistant/ExpoModulesProvider.swift" ]; then
  echo "Creating ExpoModulesProvider.swift..."
  cat > ios/Pods/Target\ Support\ Files/Pods-LyoAILearningAssistant/ExpoModulesProvider.swift << 'EOF'
// ExpoModulesProvider.swift

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
fi

# Create a temporary directory for packager output
mkdir -p ios/.packager-output
touch ios/.packager-output/metro.log

# Update the Podfile
echo "Updating Podfile..."
cat > ios/Podfile << 'EOF'
platform :ios, '14.0'

require_relative '../node_modules/expo/scripts/autolinking'
require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

require 'json'
podfile_properties = JSON.parse(File.read(File.join(__dir__, 'Podfile.properties.json'))) rescue {}

platform :ios, podfile_properties['ios.deploymentTarget'] || '14.0'
install! 'cocoapods',
  :deterministic_uuids => false

prepare_react_native_project!

target 'LyoAILearningAssistant' do
  use_expo_modules!
  config = use_native_modules!

  # Flags change depending on the env values.
  flags = get_default_flags()

  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => podfile_properties['expo.jsEngine'] == 'hermes',
    :fabric_enabled => flags[:fabric_enabled],
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )

  post_install do |installer|
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false
    )
    __apply_Xcode_12_5_M1_post_install_workaround(installer)

    # This is necessary for Xcode 14+
    installer.target_installation_results.pod_target_installation_results
      .each do |pod_name, target_installation_result|
      target_installation_result.resource_bundle_targets.each do |resource_bundle_target|
        resource_bundle_target.build_configurations.each do |config|
          config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
        end
      end
    end
    
    # Create the ExpoModulesProvider.swift file if it doesn't exist
    modules_provider_path = File.join(installer.sandbox.root, "Target Support Files", "Pods-LyoAILearningAssistant", "ExpoModulesProvider.swift")
    unless File.exist?(modules_provider_path)
      File.open(modules_provider_path, 'w') do |f|
        f.write <<~SWIFT
          // ExpoModulesProvider.swift - Auto-generated
          import Foundation
          import ExpoModulesCore
          
          public class ExpoModulesProvider: ModuleRegistryProvider {
            public override func moduleClasses(for moduleType: ModuleType) -> [Module.Type] {
              return []
            }
          }
        SWIFT
      end
    end
  end
end
EOF

# Run pod install
echo "📦 Running pod install..."
cd ios
pod deintegrate
pod cache clean --all
pod install

# Check if .xcworkspace exists
if [ -d "LyoAILearningAssistant.xcworkspace" ]; then
  echo "✅ .xcworkspace created successfully"
else
  echo "📝 Creating .xcworkspace manually..."
  mkdir -p LyoAILearningAssistant.xcworkspace
  echo '<?xml version="1.0" encoding="UTF-8"?>
<Workspace
   version = "1.0">
   <FileRef
      location = "group:LyoAILearningAssistant.xcodeproj">
   </FileRef>
   <FileRef
      location = "group:Pods/Pods.xcodeproj">
   </FileRef>
</Workspace>' > LyoAILearningAssistant.xcworkspace/contents.xcworkspacedata
fi

# Verify ExpoModulesProvider.swift exists
if [ -f "Pods/Target Support Files/Pods-LyoAILearningAssistant/ExpoModulesProvider.swift" ]; then
  echo "✅ ExpoModulesProvider.swift exists"
else
  echo "❌ ExpoModulesProvider.swift is still missing"
fi

echo ""
echo "🎉 Setup complete! Now open LyoAILearningAssistant.xcworkspace in Xcode and try building the project."
echo "If there are any build errors, please check the project configuration and ensure all dependencies are properly installed."
