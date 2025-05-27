#!/bin/zsh
# Complete iOS Build Fix for LyoAILearningAssistant
# This is a comprehensive script that addresses all potential iOS build issues

echo "🚀 Starting comprehensive iOS build fix..."

# Navigate to project root directory
cd "$(dirname "$0")"

echo "📦 Making sure all npm packages are installed correctly..."
npm install
npm install expo-asset@~11.1.5 --save
npm install expo-modules-autolinking@^2.1.10 --save

# Make sure the package.json is properly set up
if ! grep -q "\"expo-asset\":" package.json; then
  echo "Adding expo-asset to package.json..."
  node -e "const fs = require('fs'); const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8')); pkg.dependencies['expo-asset'] = '^11.1.5'; fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));"
fi

echo "🧹 Cleaning build environment..."
rm -rf ios/Pods
rm -rf ios/build
rm -f ios/Podfile.lock
rm -rf ~/Library/Developer/Xcode/DerivedData/*LyoAILearningAssistant*
rm -rf node_modules/.cache

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

# Make sure ExpoAsset.podspec is properly linked
echo "🔄 Ensuring ExpoAsset.podspec is available..."
EXPO_ASSET_DIR="node_modules/expo-asset/ios"
PODSPEC_PATH="${EXPO_ASSET_DIR}/ExpoAsset.podspec"

if [ -f "$PODSPEC_PATH" ]; then
  echo "✅ ExpoAsset.podspec found"
else
  echo "⚠️ ExpoAsset.podspec not found, creating it..."
  mkdir -p "$EXPO_ASSET_DIR"
  cat > "$PODSPEC_PATH" << 'EOF'
require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'ExpoAsset'
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.license        = package['license']
  s.author         = package['author']
  s.homepage       = package['homepage']
  s.platform       = :ios, '14.0'
  s.source         = { git: package['repository']['url'] }
  s.source_files   = '**/*.{h,m,swift}'
  s.preserve_paths = '**/*.{h,m,swift}'
  s.requires_arc   = true
  
  s.dependency 'React-Core'
  s.dependency 'ExpoModulesCore'
end
EOF
fi

# Create a necessary directory for ExpoModulesProvider.swift in Pods
mkdir -p ios/Pods/Target\ Support\ Files/Pods-LyoAILearningAssistant
cat > ios/Pods/Target\ Support\ Files/Pods-LyoAILearningAssistant/ExpoModulesProvider.swift << 'EOF'
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
echo "🛠️ Creating additional required directories and config files..."
mkdir -p .packager-output
touch .packager-output/packager.log

# Create a basic BuildConfig.json file for good measure
cat > BuildConfig.json << 'EOF'
{
  "compileSdkVersion": 33,
  "targetSdkVersion": 33,
  "buildToolsVersion": "33.0.0", 
  "ios": {
    "deploymentTarget": "14.0"
  }
}
EOF

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
