#!/bin/zsh
# Fix for "Ignoring duplicate libraries" warning
# This script addresses the duplicate libraries issue by fixing the Podfile

echo "🚀 Fixing duplicate libraries in Podfile..."

# Navigate to project root directory
cd "$(dirname "$0")"

# Create a directory for the React Native bundle output if it doesn't exist
mkdir -p ios/build/generated

# First, back up the current Podfile
echo "📋 Backing up current Podfile..."
cp ios/Podfile ios/Podfile.duplicate_libs_bak

# Add a fix to the Podfile to prevent duplicate library warnings
cat > ios/Podfile << 'EOF'
platform :ios, '14.0'

# Add React Native dependency paths
require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

# Avoid duplicate library warnings
install! 'cocoapods', 
  :deterministic_uuids => false,
  :warn_for_multiple_pod_sources => false,
  :deduplicate_targets => true

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
    # Apply standard React Native post install steps
    react_native_post_install(installer)
    __apply_Xcode_12_5_M1_post_install_workaround(installer)
    
    # Fix duplicate library warnings
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        # Fix duplicate libraries by ensuring they're only included once
        if config.build_settings['OTHER_LDFLAGS']
          # Remove duplicate -lc++ entries
          if config.build_settings['OTHER_LDFLAGS'].is_a?(Array)
            libs = config.build_settings['OTHER_LDFLAGS']
            config.build_settings['OTHER_LDFLAGS'] = libs.uniq
          end
        end
        
        # Fix header search paths
        if config.build_settings['HEADER_SEARCH_PATHS']
          if config.build_settings['HEADER_SEARCH_PATHS'].is_a?(String)
            config.build_settings['HEADER_SEARCH_PATHS'] = [config.build_settings['HEADER_SEARCH_PATHS']]
          end
          config.build_settings['HEADER_SEARCH_PATHS'] << '${PODS_ROOT}/Headers/Public/React-Core'
        end
        
        # Fix code signing for bundles
        if target.respond_to?(:product_type) && target.product_type == "com.apple.product-type.bundle"
          config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
        end
      end
    end
  end
end
EOF

echo "📦 Reinstalling pods with the fixed Podfile..."
cd ios
pod deintegrate
pod cache clean --all
pod install

echo ""
echo "✅ Fixed duplicate libraries issue in Podfile"
echo ""
echo "Next steps:"
echo "1. Open your Xcode project: open LyoAILearningAssistant.xcworkspace"
echo "2. Clean the build folder: Product > Clean Build Folder"
echo "3. Build again: Product > Build"
echo ""
echo "The duplicate libraries warning should now be resolved."
