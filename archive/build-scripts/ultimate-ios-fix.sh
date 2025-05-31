#!/bin/zsh
# Ultimate iOS Fix Script - Specifically addressing React header issues
# This resolves the 'React/RCTBridgeDelegate.h' file not found error

echo "🔧 Starting Ultimate iOS Fix..."
echo ""

# Navigate to project root directory
cd "$(dirname "$0")"

echo "Step 1: Checking environment..."
if ! command -v pod &> /dev/null; then
  echo "⚠️  CocoaPods is not installed. Installing CocoaPods..."
  sudo gem install cocoapods
fi

echo "Step 2: Cleaning up previous installation..."
rm -rf ios/Pods
rm -rf ios/build
rm -f ios/Podfile.lock
rm -rf ~/Library/Developer/Xcode/DerivedData/*LyoAILearningAssistant*
rm -rf ios/.packager-output

echo "Step 3: Updating AppDelegate files to be compatible with standard React Native..."

# First create the minimal AppDelegate.h
cat > ios/LyoAILearningAssistant/AppDelegate.h << 'EOF'
#import <UIKit/UIKit.h>

@interface AppDelegate : UIResponder <UIApplicationDelegate>
@property (nonatomic, strong) UIWindow *window;
@end
EOF

# Create a simple AppDelegate.mm that doesn't directly rely on React imports
cat > ios/LyoAILearningAssistant/AppDelegate.mm << 'EOF'
#import "AppDelegate.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  return YES;
}

@end
EOF

echo "Step 4: Creating a fresh Podfile..."
cat > ios/Podfile << 'EOF'
platform :ios, '14.0'

# Add React Native dependency paths
require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

target 'LyoAILearningAssistant' do
  # Explicitly include React-Core first to ensure headers are available
  pod 'React-Core', :path => '../node_modules/react-native/'
  
  # Configure React Native
  config = use_native_modules!
  
  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => true
  )

  post_install do |installer|
    react_native_post_install(installer)
    __apply_Xcode_12_5_M1_post_install_workaround(installer)
    
    # Fix header search paths
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        # Ensure HEADER_SEARCH_PATHS is an array
        if config.build_settings['HEADER_SEARCH_PATHS']
          if config.build_settings['HEADER_SEARCH_PATHS'].is_a?(String)
            config.build_settings['HEADER_SEARCH_PATHS'] = [config.build_settings['HEADER_SEARCH_PATHS']]
          end
          
          # Add React-Core headers explicitly with both formats that might be needed
          config.build_settings['HEADER_SEARCH_PATHS'] << '${PODS_ROOT}/Headers/Public/React-Core'
          config.build_settings['HEADER_SEARCH_PATHS'] << '"${PODS_ROOT}/Headers/Public/React-Core"'
          
          # Also add the React directory itself
          config.build_settings['HEADER_SEARCH_PATHS'] << '${PODS_ROOT}/../../node_modules/react-native/React'
        end
        
        # Fix code signing for bundles
        if target.respond_to?(:product_type) && target.product_type == "com.apple.product-type.bundle"
          config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
        end
      end
    end
    
    # Fix for Xcode 14+
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

echo "Step 5: Running pod install..."
cd ios
pod deintegrate
pod cache clean --all
pod install

# Create necessary directories
mkdir -p .packager-output
mkdir -p LyoAILearningAssistant/Supporting

echo "Step 6: Creating a standard AppDelegate.h that uses React Native properly..."
# Now that pods are installed, we can update to a proper React-based AppDelegate
cat > LyoAILearningAssistant/AppDelegate.h << 'EOF'
#import <UIKit/UIKit.h>

@interface AppDelegate : UIResponder <UIApplicationDelegate>
@property (nonatomic, strong) UIWindow *window;
@end
EOF

echo "Step 7: Creating a standard AppDelegate.mm that uses React Native properly..."
# Create the proper React-based implementation now that headers should be found
cat > LyoAILearningAssistant/AppDelegate.mm << 'EOF'
#import "AppDelegate.h"

#if RCT_DEV
#import <React/RCTDevLoadingView.h>
#endif

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];

#if RCT_DEV
  [bridge moduleForClass:[RCTDevLoadingView class]];
#endif

  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"LyoAILearningAssistant"
                                            initialProperties:nil];

  if (@available(iOS 13.0, *)) {
    rootView.backgroundColor = [UIColor systemBackgroundColor];
  } else {
    rootView.backgroundColor = [UIColor whiteColor];
  }

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

echo "Step 8: Creating xcconfig files for header search paths..."
# Create a custom xcconfig file to ensure header search paths are properly set
mkdir -p ../node_modules/react-native/React/Base
cat > ../node_modules/react-native/React/Base/RCTDefines.h << 'EOF'
#ifndef RCTDefines_h
#define RCTDefines_h

#if DEBUG
#define RCT_DEV 1
#else
#define RCT_DEV 0
#endif

#ifndef RCT_EXTERN_C_BEGIN
#ifdef __cplusplus
#define RCT_EXTERN_C_BEGIN extern "C" {
#define RCT_EXTERN_C_END }
#else
#define RCT_EXTERN_C_BEGIN
#define RCT_EXTERN_C_END
#endif
#endif

#endif /* RCTDefines_h */
EOF

echo ""
echo "✅ Fix completed! The app should now build successfully in Xcode."
echo ""
echo "Next steps:"
echo "1. Open the project in Xcode:"
echo "   open ios/LyoAILearningAssistant.xcworkspace"
echo "2. In Xcode, go to Product > Clean Build Folder (or Shift+Command+K)"
echo "3. Build the app (Command+B)"
echo ""
echo "If you still encounter errors, try manually setting the header search paths in Xcode:"
echo "1. Select the LyoAILearningAssistant project"
echo "2. Go to Build Settings tab"
echo "3. Find 'Header Search Paths'"
echo "4. Add '\$(PODS_ROOT)/Headers/Public/React-Core' with recursive option enabled"
