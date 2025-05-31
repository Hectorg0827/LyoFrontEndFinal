#!/bin/zsh
# Complete fix for RCTAppDelegate.h not found

echo "🛠️ Starting comprehensive React Native build fix..."

# Navigate to project root
cd "$(dirname "$0")"

# Update AppDelegate.h to use the proper import path
cat > ios/LyoAILearningAssistant/AppDelegate.h << 'EOF'
#import <UIKit/UIKit.h>
#import <Expo/Expo.h>

@interface AppDelegate : EXAppDelegateWrapper

@end
EOF

echo "✓ Updated AppDelegate.h"

# Also create a matching AppDelegate.mm file to ensure compatibility
cat > ios/LyoAILearningAssistant/AppDelegate.mm << 'EOF'
#import "AppDelegate.h"
#import <ExpoModulesCore/EXAppDelegateWrapper.h>

@implementation AppDelegate

@end
EOF

echo "✓ Updated AppDelegate.mm"

# Clean build artifacts
echo "🧹 Cleaning build artifacts..."
rm -rf ios/build
rm -rf ios/Pods
rm -f ios/Podfile.lock

# Create an updated Podfile that ensures React headers are available
cat > ios/Podfile << 'EOF'
platform :ios, '14.0'

# React Native and Expo integration
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
  # Explicitly include React Native pod with header_dir specified
  pod 'React', :path => '../node_modules/react-native/'
  pod 'React-Core', :path => '../node_modules/react-native/'
  
  # Include Expo modules
  use_expo_modules!
  config = use_native_modules!

  # Flags change depending on the env values
  flags = get_default_flags()

  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => podfile_properties['expo.jsEngine'] == 'hermes',
    :fabric_enabled => flags[:fabric_enabled],
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )

  post_install do |installer|
    # React Native post install
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false
    )
    
    # M1 workaround
    __apply_Xcode_12_5_M1_post_install_workaround(installer)

    # Fix for Xcode 14+ resource bundles code signing
    installer.target_installation_results.pod_target_installation_results
      .each do |pod_name, target_installation_result|
      target_installation_result.resource_bundle_targets.each do |resource_bundle_target|
        resource_bundle_target.build_configurations.each do |config|
          config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
        end
      end
    end
    
    # Fix for Header Search Paths
    installer.pods_project.targets.each do |target|
      if target.name == 'React-Core'
        target.build_configurations.each do |config|
          config.build_settings['HEADER_SEARCH_PATHS'] ||= '$(inherited)'
          config.build_settings['HEADER_SEARCH_PATHS'] << ' "${PODS_ROOT}/Headers/Private/React-Core"'
        end
      end
    end
  end
end
EOF

echo "✓ Created updated Podfile"

# Install pods
echo "📦 Running pod install..."
cd ios
pod deintegrate
pod cache clean --all
pod install --repo-update

echo ""
echo "✨ Setup complete! Now try opening your project in Xcode:"
echo "open /Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/LyoAILearningAssistant.xcworkspace"
