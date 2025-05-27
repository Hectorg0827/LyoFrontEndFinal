#!/bin/zsh
# Quick fix for React Native header issues
# This script focuses on properly installing the React-Core pod

echo "🚀 Starting quick fix for React header issues..."

# Navigate to project root directory
cd "$(dirname "$0")"

# Let's fix the Podfile first
cat > ios/Podfile << 'EOF'
platform :ios, '14.0'
require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

target 'LyoAILearningAssistant' do
  # Explicitly include React-Core with direct path first
  pod 'React-Core', :path => '../node_modules/react-native/'

  # Get all native modules
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
        config.build_settings['HEADER_SEARCH_PATHS'] ||= '$(inherited)'
        if config.build_settings['HEADER_SEARCH_PATHS'].is_a?(String)
          config.build_settings['HEADER_SEARCH_PATHS'] = [config.build_settings['HEADER_SEARCH_PATHS']]
        end
        config.build_settings['HEADER_SEARCH_PATHS'] << '${PODS_ROOT}/Headers/Public/React-Core'
        
        # Disable code signing for bundles
        if target.respond_to?(:product_type) && target.product_type == "com.apple.product-type.bundle"
          config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
        end
      end
    end
  end
end
EOF

echo "🧹 Cleaning the pod installation..."
cd ios
rm -rf Pods
rm -f Podfile.lock
pod deintegrate
pod cache clean --all

echo "📦 Installing pods..."
pod install

echo "✅ React headers installation fixed!"
echo ""
echo "Next steps:"
echo "1. Open the workspace: open LyoAILearningAssistant.xcworkspace"
echo "2. Build the project in Xcode"
echo ""
echo "If you still encounter issues, try the more comprehensive fix script:"
echo "cd /Users/republicalatuya/Desktop/LyoFrontEndFinal && ./fix-react-headers-final.sh"
