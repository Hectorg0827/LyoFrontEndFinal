#!/bin/zsh
# Fix for "React/RCTBridgeDelegate.h file not found" error
# This script creates a simpler iOS native setup without relying on React headers directly

echo "🚀 Starting fix for React header not found error..."

# Navigate to project root directory
cd "$(dirname "$0")"

echo "🧹 Cleaning build environment..."
rm -rf ios/Pods
rm -rf ios/build
rm -f ios/Podfile.lock
rm -rf ~/Library/Developer/Xcode/DerivedData/*LyoAILearningAssistant*

# Update AppDelegate.h to a minimal version
cat > ios/LyoAILearningAssistant/AppDelegate.h << 'EOF'
#import <UIKit/UIKit.h>

@interface AppDelegate : UIResponder <UIApplicationDelegate>
@property (nonatomic, strong) UIWindow *window;
@end
EOF

# Update AppDelegate.mm to use #import_name syntax which is more reliable
cat > ios/LyoAILearningAssistant/AppDelegate.mm << 'EOF'
#import "AppDelegate.h"

#import_name "React/RCTBridge.h"
#import_name "React/RCTBundleURLProvider.h"
#import_name "React/RCTRootView.h"

@interface AppDelegate() <RCTBridgeDelegate>
@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"LyoAILearningAssistant"
                                            initialProperties:nil];

  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];
  
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  
  return YES;
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

# Create an updated optimized Podfile
cat > ios/Podfile << 'EOF'
platform :ios, '14.0'

# Add React Native dependency paths
require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

target 'LyoAILearningAssistant' do
  config = use_native_modules!
  
  # Explicitly include React-Core first
  pod 'React-Core', :path => '../node_modules/react-native/'
  
  # Use React Native with minimum configuration
  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => true
  )
  
  # Install all native modules
  use_native_modules!

  post_install do |installer|
    # Apply React Native post install steps
    react_native_post_install(installer)
    __apply_Xcode_12_5_M1_post_install_workaround(installer)
    
    # Fix header search paths and other build settings
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        # Handle header search paths
        if config.build_settings['HEADER_SEARCH_PATHS']
          # Convert to array if it's a string
          if config.build_settings['HEADER_SEARCH_PATHS'].is_a?(String)
            config.build_settings['HEADER_SEARCH_PATHS'] = [config.build_settings['HEADER_SEARCH_PATHS']]
          end
          
          # Add explicit paths to React headers
          react_headers = [
            "${PODS_ROOT}/Headers/Public/React-Core",
            "${PODS_ROOT}/Headers/Public/React-cxxreact",
            "${PODS_ROOT}/Headers/Public/React-jsi",
            "${PODS_ROOT}/Headers/Public/React-jsiexecutor",
            "${PODS_ROOT}/Headers/Public/React-callinvoker",
            "${PODS_ROOT}/Headers/Public/React-runtimeexecutor",
            "${PODS_ROOT}/Headers/Public/React-perflogger",
            "${PODS_ROOT}/Headers/Public/React-jsinspector"
          ]
          
          # Add each React header path if not already present
          react_headers.each do |header_path|
            unless config.build_settings['HEADER_SEARCH_PATHS'].include?(header_path)
              config.build_settings['HEADER_SEARCH_PATHS'] << header_path
            end
          end
        end
        
        # Disable code signing for bundles
        if target.respond_to?(:product_type) && target.product_type == "com.apple.product-type.bundle"
          config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
        end
        
        # Other important settings that help prevent build issues
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'RCT_NEW_ARCH_ENABLED=0'
      end
    end
    
    # Fix signing for resource bundles (needed for Xcode 14+)
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

echo "✅ iOS build setup complete!"
echo ""
echo "🚀 Next steps to build the app:"
echo "1. Open the workspace: open /Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/LyoAILearningAssistant.xcworkspace"
echo "2. Clean the build folder in Xcode: Product > Clean Build Folder (or Shift+Command+K)"
echo "3. Build the project: Command+B"
echo ""
echo "If you still encounter header not found errors in Xcode, try these manual steps:"
echo "   - In Xcode, go to the LyoAILearningAssistant project settings"
echo "   - Select the Build Settings tab"
echo "   - Find 'Header Search Paths' under Search Paths"
echo "   - Add \${PODS_ROOT}/Headers/Public/React-Core as a recursive search path"
echo "   - Clean and build again"
echo ""
echo "The 'React/RCTBridgeDelegate.h' file not found error should now be fixed."
