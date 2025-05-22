#!/bin/zsh
# All-in-one fix for React Native build issues
# This script addresses both the bundle script and duplicate libraries problems

echo "🚀 Starting all-in-one fix for React Native build issues..."

# Navigate to project root directory
cd "$(dirname "$0")"

#-------------------------------------------------------
# 1. Create a fixed bundle script
#-------------------------------------------------------
echo "📦 Creating simplified bundle script..."

mkdir -p ios/build/generated
mkdir -p ios/LyoAILearningAssistant/bundle

cat > ios/simple-bundle.sh << 'EOF'
#!/bin/bash
# Simplified React Native bundle script with output file for dependency analysis

set -e

# Create output directory
DEST="${CONFIGURATION_BUILD_DIR}/${UNLOCALIZED_RESOURCES_FOLDER_PATH}"
mkdir -p "$DEST"

# Set bundle output file
BUNDLE_FILE="$DEST/main.jsbundle"

# Create the JS bundle
export NODE_BINARY=node
cd "$(dirname "$0")/.."

# Only bundle if in release mode
if [[ "$CONFIGURATION" = "Release" ]]; then
  echo "Creating production bundle..."
  $NODE_BINARY node_modules/react-native/cli.js bundle \
    --entry-file index.js \
    --platform ios \
    --dev false \
    --reset-cache \
    --bundle-output "$BUNDLE_FILE" \
    --assets-dest "$DEST"
else
  echo "Skipping bundle in Debug mode..."
  # Create an empty file to satisfy the build system
  echo "// Debug mode - bundle will be loaded from dev server" > "$BUNDLE_FILE"
fi

# Create a timestamp file as build phase output
echo "Build completed at $(date)" > "${DERIVED_FILE_DIR}/react-native-bundle.timestamp"
EOF

chmod +x ios/simple-bundle.sh

#-------------------------------------------------------
# 2. Fix the Podfile to address duplicate libraries
#-------------------------------------------------------
echo "📋 Creating fixed Podfile..."

# First, back up the current Podfile
cp ios/Podfile ios/Podfile.all_in_one_bak

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
    
    # Fix various build issues
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

#-------------------------------------------------------
# 3. Create instructions for manually updating Xcode
#-------------------------------------------------------
echo "📝 Creating Xcode manual update instructions..."

cat > ios/xcode-manual-updates.txt << 'EOF'
To fix the "Bundle React Native code and images" build phase:

1. Open the Xcode project: open LyoAILearningAssistant.xcworkspace
2. Select your project in the navigator
3. Select your target (LyoAILearningAssistant)
4. Go to the "Build Phases" tab
5. Find and expand the "Bundle React Native code and images" build phase
6. Replace the script content with: ../simple-bundle.sh
7. Make sure "Based on dependency analysis" is checked (not always visible in some Xcode versions)
8. Click the + button under "Output Files" and add: ${DERIVED_FILE_DIR}/react-native-bundle.timestamp
9. Clean and build the project

This will ensure the bundle script runs correctly and only when necessary.
EOF

#-------------------------------------------------------
# 4. Reinstall pods and clean the build
#-------------------------------------------------------
echo "🧹 Reinstalling pods and cleaning build..."
cd ios
pod deintegrate
pod cache clean --all
pod install

echo ""
echo "✅ All-in-one fix completed!"
echo ""
echo "Next steps:"
echo "1. Open your Xcode project: open LyoAILearningAssistant.xcworkspace"
echo "2. Follow the manual update instructions in ios/xcode-manual-updates.txt"
echo "3. Clean the build folder: Product > Clean Build Folder"
echo "4. Build again: Product > Build"
echo ""
echo "This should resolve both:"
echo "- 'Command PhaseScriptExecution failed' error"
echo "- 'Ignoring duplicate libraries' warning"
echo ""
echo "If you still encounter issues, try checking:"
echo "- The bundle script output for more specific error messages"
echo "- Your package.json for conflicting dependencies"
