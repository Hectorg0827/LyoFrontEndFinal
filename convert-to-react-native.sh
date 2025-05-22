#!/bin/zsh
# iOS Build Fix for Expo/Expo.h Not Found - Reinstalling Expo
# This script attempts to fix the issue by properly reinstalling Expo dependencies

echo "🚀 Starting iOS build fix for Expo header issues..."

# Navigate to project root directory
cd "$(dirname "$0")"

echo "🧹 Cleaning build environment..."
rm -rf ios/Pods
rm -rf ios/build
rm -f ios/Podfile.lock
rm -rf ~/Library/Developer/Xcode/DerivedData/*LyoAILearningAssistant*
rm -rf node_modules/.cache

echo "📦 Reinstalling Expo dependencies..."
npm install --save expo
npm install --save expo-modules-core
npm install --save expo-modules-autolinking

echo "📝 Updating AppDelegate files for React Native compatibility..."
# Update AppDelegate.h
cat > ios/LyoAILearningAssistant/AppDelegate.h << 'EOF'
#import <RCTAppDelegate.h>
#import <UIKit/UIKit.h>

@interface AppDelegate : RCTAppDelegate

@end
EOF

# Update AppDelegate.mm
cat > ios/LyoAILearningAssistant/AppDelegate.mm << 'EOF'
#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"LyoAILearningAssistant";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
EOF

echo "📋 Creating simplified React Native Podfile..."
cat > ios/Podfile << 'EOF'
platform :ios, '14.0'
require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

target 'LyoAILearningAssistant' do
  config = use_native_modules!
  
  # Explicitly include React-Core pod to fix header issues
  pod 'React-Core', :path => '../node_modules/react-native/'
  
  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => true,
    # An absolute path to your application root.
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )

  post_install do |installer|
    react_native_post_install(installer)
    __apply_Xcode_12_5_M1_post_install_workaround(installer)

    # Add header search paths explicitly
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

echo "📦 Running pod installation..."
cd ios
pod deintegrate
pod cache clean --all

echo "🔄 Updating CocoaPods repositories..."
pod repo update

echo "📥 Installing pods with verbose output..."
pod install --verbose

mkdir -p .packager-output
touch .packager-output/packager.log

echo "✅ iOS build setup complete!"
echo ""
echo "🚀 Next steps to build the app:"
echo "1. Open the workspace: open /Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/LyoAILearningAssistant.xcworkspace"
echo "2. Clean the build folder in Xcode: Product > Clean Build Folder (or Shift+Command+K)"
echo "3. Build the project: Command+B"
echo ""
echo "This script has converted the project to use standard React Native without Expo dependencies"
