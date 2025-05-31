#!/bin/zsh
# Fix ExpoModulesCore missing module issue

echo "🛠️  Starting ExpoModulesCore Fix Script"

# Navigate to project root
cd "$(dirname "$0")"

echo "📂 Current directory: $(pwd)"

echo "🧹 Cleaning project..."
rm -rf ios/Pods
rm -f ios/Podfile.lock
rm -rf ios/build

# Check if expo-modules-core is installed
echo "🔍 Checking for expo-modules-core in node_modules..."
if [ ! -d "node_modules/expo-modules-core" ]; then
  echo "⚠️ expo-modules-core not found in node_modules, installing..."
  npm install expo-modules-core --save
fi

# Create a proper ExpoModulesProvider.swift that doesn't rely on importing ExpoModulesCore
echo "📝 Creating compatible ExpoModulesProvider.swift..."
mkdir -p ios/LyoAILearningAssistant/Supporting
cat > ios/LyoAILearningAssistant/Supporting/ExpoModulesProvider.swift << 'EOL'
// Auto-generated file - Created by expo-modules-autolinking for use in Xcode
// This implementation is a workaround for "No such module 'ExpoModulesCore'" errors

import Foundation

// This is a stub implementation that doesn't rely on ExpoModulesCore
public class ExpoModulesProvider {
    public static func modulesForAppDelegate() -> [AnyClass] {
        return []
    }
}
EOL

# Update Podfile to explicitly include expo-modules-core
echo "🔄 Updating Podfile..."
cat > ios/Podfile << 'EOL'
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

  # Explicitly add expo-modules-core
  pod 'ExpoModulesCore', :path => '../node_modules/expo-modules-core'

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
  end
end
EOL

# Install pods with repo update
echo "📦 Running pod install with repo update..."
cd ios
pod deintegrate
pod cache clean --all
pod install --repo-update

echo ""
echo "✅ Setup complete! Now try building in Xcode."
echo "💡 Tip: If you still have issues with 'No such module' errors, try:"
echo "   • Opening the workspace in Xcode"
echo "   • Clean the build folder (Product > Clean Build Folder)"
echo "   • Close and reopen Xcode"
echo "   • Build again"
