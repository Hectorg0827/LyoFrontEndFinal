#!/bin/zsh
# Comprehensive iOS Build Fix for LyoAILearningAssistant
# This script implements a complete solution for building the iOS app properly

echo "🚀 Starting comprehensive iOS build fix..."

# Navigate to project root directory
cd "$(dirname "$0")"

echo "🧹 Cleaning build environment..."
rm -rf ios/Pods
rm -rf ios/build
rm -f ios/Podfile.lock
rm -rf ~/Library/Developer/Xcode/DerivedData/*LyoAILearningAssistant*

# Create necessary directories
mkdir -p ios/LyoAILearningAssistant/Supporting
mkdir -p ios/.packager-output

echo "📝 Updating AppDelegate files for Expo compatibility..."
# Update AppDelegate.h
cat > ios/LyoAILearningAssistant/AppDelegate.h << 'EOF'
#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <Expo/Expo.h>

@interface AppDelegate : EXAppDelegateWrapper

@end
EOF

# Update AppDelegate.mm
cat > ios/LyoAILearningAssistant/AppDelegate.mm << 'EOF'
#import "AppDelegate.h"
#import <Expo/Expo.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  self.moduleName = @"LyoAILearningAssistant";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to your React component.
  self.initialProps = @{};
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

@end
EOF

echo "📋 Creating optimized Podfile..."
cat > ios/Podfile << 'EOF'
require File.join(File.dirname(`node --print "require.resolve('expo/package.json')"`), "scripts/autolinking")
require File.join(File.dirname(`node --print "require.resolve('react-native/package.json')"`), "scripts/react_native_pods")
require File.join(File.dirname(`node --print "require.resolve('@react-native-community/cli-platform-ios/package.json')"`), "native_modules")

require 'json'
podfile_properties = JSON.parse(File.read(File.join(__dir__, 'Podfile.properties.json'))) rescue {}

platform :ios, podfile_properties['ios.deploymentTarget'] || '14.0'
install! 'cocoapods',
  :deterministic_uuids => false

prepare_react_native_project!

target 'LyoAILearningAssistant' do
  use_expo_modules!
  config = use_native_modules!
  
  # Force include React-Core to ensure header availability
  pod 'React-Core', :path => '../node_modules/react-native/'
  
  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => podfile_properties['expo.jsEngine'] == 'hermes',
    :fabric_enabled => false,
    # An absolute path to your application root.
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )

  post_install do |installer|
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false
    )
    __apply_Xcode_12_5_M1_post_install_workaround(installer)

    # Ensure correct header search paths
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        # Add React-Core headers explicitly
        if !config.build_settings['HEADER_SEARCH_PATHS'].nil?
          if config.build_settings['HEADER_SEARCH_PATHS'].is_a?(String)
            config.build_settings['HEADER_SEARCH_PATHS'] = [config.build_settings['HEADER_SEARCH_PATHS']]
          end
          config.build_settings['HEADER_SEARCH_PATHS'] << '${PODS_ROOT}/Headers/Public/React-Core'
        end
        
        # Fix code signing for resource bundles
        if target.respond_to?(:product_type) && target.product_type == "com.apple.product-type.bundle"
          config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
        end
      end
    end
    
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
EOF

# Create a helper file for ExpoModulesProvider since it's required
echo "📄 Creating ExpoModulesProvider.swift for Expo integration..."
cat > ios/LyoAILearningAssistant/Supporting/ExpoModulesProvider.swift << 'EOF'
// ExpoModulesProvider.swift - Generated for Expo project
import Foundation

@objc public class ExpoModulesProvider: NSObject {
    @objc public static func modulesForAppDelegate() -> [AnyClass] {
        return []
    }
}
EOF

echo "📦 Running pod installation..."
cd ios
pod deintegrate
pod cache clean --all

# Ensure pod repo is up-to-date
echo "🔄 Updating CocoaPods repositories..."
pod repo update

echo "📥 Installing pods with verbose output..."
pod install --verbose

# Ensure correct directory structure for packager output
echo "🛠️ Creating additional required directories..."
mkdir -p .packager-output
touch .packager-output/packager.log

echo "✅ iOS build setup complete!"
echo ""
echo "🚀 Next steps to build the app:"
echo "1. Open the workspace: open /Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/LyoAILearningAssistant.xcworkspace"
echo "2. Clean the build folder in Xcode: Product > Clean Build Folder (or Shift+Command+K)"
echo "3. Build the project: Command+B"
echo ""
echo "If you encounter any issues, you can check these files:"
echo "- Podfile: /Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/Podfile"
echo "- AppDelegate.h: /Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/LyoAILearningAssistant/AppDelegate.h"
echo "- AppDelegate.mm: /Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/LyoAILearningAssistant/AppDelegate.mm"
echo ""
echo "For troubleshooting: pod install may take several minutes to complete."
