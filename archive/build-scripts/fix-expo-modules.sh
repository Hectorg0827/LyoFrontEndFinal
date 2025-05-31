#!/bin/zsh
# Clean and rebuild iOS project

echo "🧹 Cleaning all iOS build artifacts..."

# Navigate to project root
cd "$(dirname "$0")"

# Remove Pods directory and related files
echo "Removing Pods directory and related files..."
rm -rf ios/Pods
rm -f ios/Podfile.lock
rm -f ios/LyoAILearningAssistant.xcworkspace/xcshareddata/swiftpm/Package.resolved

# Clean Xcode derived data for this project
echo "Cleaning Xcode derived data..."
DERIVED_DATA_PATH=~/Library/Developer/Xcode/DerivedData
find "$DERIVED_DATA_PATH" -name "*LyoAILearningAssistant*" -type d -exec rm -rf {} \; 2>/dev/null || true

# Clean build directory
echo "Removing build directory..."
rm -rf ios/build

# Create a new Podfile with explicit Expo modules integration
echo "Creating updated Podfile..."
cat > ios/Podfile << 'EOL'
platform :ios, '14.0'

require_relative '../node_modules/expo/scripts/autolinking'
require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

require 'json'
podfile_properties = JSON.parse(File.read(File.join(__dir__, 'Podfile.properties.json'))) rescue {}

installation_root = File.dirname(File.dirname(__FILE__))
project_path = File.join(installation_root, 'ios/LyoAILearningAssistant.xcodeproj')

platform :ios, podfile_properties['ios.deploymentTarget'] || '14.0'
install! 'cocoapods',
  :deterministic_uuids => false

prepare_react_native_project!

# If you are using a `react-native-flipper` your iOS build will fail when `NO_FLIPPER=1` is set.
# because `react-native-flipper` depends on (FlipperKit,...), which will be excluded. To fix this,
# you can also exclude `react-native-flipper` in `react-native.config.js`
#
# ```js
# module.exports = {
#   dependencies: {
#     ...(process.env.NO_FLIPPER ? { 'react-native-flipper': { platforms: { ios: null } } } : {}),
#   }
# }
# ```
flipper_config = FlipperConfiguration.disabled
if ENV['NO_FLIPPER'] == '1' then
  # Explicitly disabled through environment variables
  flipper_config = FlipperConfiguration.disabled
elsif podfile_properties.key?('ios.flipper') then
  # Configure Flipper in Podfile.properties.json
  if podfile_properties['ios.flipper'] == 'true' then
    flipper_config = FlipperConfiguration.enabled(["Debug", "Release"])
  elsif podfile_properties['ios.flipper'] != 'false' then
    flipper_config = FlipperConfiguration.enabled(["Debug", "Release"], { 'Flipper' => podfile_properties['ios.flipper'] })
  end
end

target 'LyoAILearningAssistant' do
  use_expo_modules!
  config = use_native_modules!

  # Flags change depending on the env values.
  flags = get_default_flags()

  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => podfile_properties['expo.jsEngine'] == 'hermes',
    :fabric_enabled => flags[:fabric_enabled],
    # An absolute path to your application root.
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )

  post_install do |installer|
    react_native_post_install(
      installer,
      config[:reactNativePath],
      # Set `mac_catalyst_enabled` to `true` in order to apply patches
      # necessary for Mac Catalyst builds
      :mac_catalyst_enabled => false
    )
    __apply_Xcode_12_5_M1_post_install_workaround(installer)

    # This is necessary for Xcode 14, because it signs resource bundles by default
    # when building for devices.
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

echo "📦 Running pod install with verbose output..."
cd ios
pod install --verbose | tee pod_install_log.txt

# Check if the required file exists
if [ -f "Pods/Target Support Files/Pods-LyoAILearningAssistant/ExpoModulesProvider.swift" ]; then
  echo "✅ ExpoModulesProvider.swift was successfully generated!"
else
  echo "❌ ExpoModulesProvider.swift was not generated. Check pod_install_log.txt for details."
fi

echo "✨ Setup complete! Now try building the project in Xcode."
