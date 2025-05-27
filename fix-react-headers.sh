#!/bin/zsh
# Focused fix for React header issues - Quick fix for RCTBridgeDelegate not found error
# This script specifically addresses the React/RCTBridgeDelegate.h file not found issue

echo "🚀 Starting focused fix for React headers..."

# Navigate to project root directory
cd "$(dirname "$0")"

echo "1️⃣ Updating the Podfile to ensure React-Core headers are properly included..."
cat > ios/Podfile << 'EOF'
platform :ios, '14.0'

# React Native dependencies
require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

target 'LyoAILearningAssistant' do
  # Explicitly include React-Core pod FIRST to ensure headers are properly installed
  pod 'React-Core', :path => '../node_modules/react-native/'
  
  # Use native modules
  config = use_native_modules!
  
  # Standard React Native setup
  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => true
  )

  post_install do |installer|
    react_native_post_install(installer)
    __apply_Xcode_12_5_M1_post_install_workaround(installer)
    
    # Fix header search paths - crucial for finding React headers
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        # Fix header search paths
        if config.build_settings['HEADER_SEARCH_PATHS']
          if config.build_settings['HEADER_SEARCH_PATHS'].is_a?(String)
            config.build_settings['HEADER_SEARCH_PATHS'] = [config.build_settings['HEADER_SEARCH_PATHS']]
          end
          
          # Essential: Add paths to React-Core headers
          config.build_settings['HEADER_SEARCH_PATHS'] << '${PODS_ROOT}/Headers/Public/React-Core'
          config.build_settings['HEADER_SEARCH_PATHS'] << '${PODS_ROOT}/Headers/Public'
        end
        
        # Fix code signing for resource bundles
        if target.respond_to?(:product_type) && target.product_type == "com.apple.product-type.bundle"
          config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
        end
      end
    end
  end
end
EOF

echo "2️⃣ Cleaning and reinstalling pods..."
cd ios
rm -rf Pods
rm -f Podfile.lock
pod deintegrate
pod cache clean --all

echo "3️⃣ Running pod install..."
pod install

echo ""
echo "✅ Fixed Podfile with explicit React-Core headers!"
echo ""
echo "Next steps:"
echo "1. Open your project in Xcode:"
echo "   open LyoAILearningAssistant.xcworkspace"
echo ""
echo "2. If you still see 'React/RCTBridgeDelegate.h file not found' errors in Xcode:"
echo "   - Go to Build Settings in your project"
echo "   - Search for 'Header Search Paths'"
echo "   - Add: \${PODS_ROOT}/Headers/Public/React-Core"
echo "   - Make sure it's set to 'recursive'"
echo ""
echo "3. Clean and build your project in Xcode"
