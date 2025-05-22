#!/bin/zsh
# Final iOS build script after fixing AppDelegate.mm
# This script rebuilds the project with the fixed AppDelegate.mm

echo "🚀 Starting final iOS build with fixed AppDelegate..."

# Navigate to project root directory
cd "$(dirname "$0")"

echo "🧹 Cleaning build environment..."
rm -rf ios/Pods
rm -rf ios/build
rm -f ios/Podfile.lock

echo "📋 Updating Podfile to focus on React-Core..."
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
        # Handle header search paths
        if config.build_settings['HEADER_SEARCH_PATHS']
          if config.build_settings['HEADER_SEARCH_PATHS'].is_a?(String)
            config.build_settings['HEADER_SEARCH_PATHS'] = [config.build_settings['HEADER_SEARCH_PATHS']]
          end
          config.build_settings['HEADER_SEARCH_PATHS'] << '${PODS_ROOT}/Headers/Public/React-Core'
        end
        
        # Disable code signing for bundles
        if target.respond_to?(:product_type) && target.product_type == "com.apple.product-type.bundle"
          config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
        end
      end
    end
  end
end
EOF

echo "📦 Installing pods..."
cd ios
pod deintegrate
pod cache clean --all
pod install

mkdir -p .packager-output
touch .packager-output/packager.log

echo "✅ Final iOS build setup complete!"
echo ""
echo "🚀 Next steps to build the app:"
echo "1. Open the workspace: open LyoAILearningAssistant.xcworkspace"
echo "2. Clean the build folder in Xcode (Product > Clean Build Folder)"
echo "3. Build the project (Command+B)"
echo ""
echo "Your AppDelegate.mm file has been fixed with a minimal implementation that should build successfully."
echo "Once the build is successful, you can gradually add back React Native functionality as needed."
