#!/bin/bash
set -e

# Set variables
PROJECT_DIR="/Users/republicalatuya/Desktop/LyoFrontEndFinal"
IOS_DIR="$PROJECT_DIR/ios"
APP_NAME="LyoAILearningAssistant"
DEVICE_NAME="Walkiris" # or "Hector's iPhone"

echo "🔍 Checking available devices..."
xcrun xctrace list devices

echo "🧹 Cleaning build artifacts..."
cd "$PROJECT_DIR"
rm -rf ios/build
rm -rf ios/Pods
rm -rf ios/Podfile.lock

echo "📦 Creating Podfile with C++20 configuration..."
cat > ios/Podfile << 'EOL'
require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

platform :ios, '14.0'
prepare_react_native_project!

target 'LyoAILearningAssistant' do
  config = use_native_modules!
  
  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => true
  )

  post_install do |installer|
    # https://github.com/facebook/react-native/blob/main/packages/react-native/scripts/react_native_pods.rb#L197-L202
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false
    )
    
    # C++20 fixes for specific libraries, excluding incompatible libraries
    excluded_pods = ['glog', 'fmt', 'DoubleConversion', 'boost', 'libwebp', 'libavif', 'libdav1d', 'sqlite3']
    react_cpp20_pods = ['React-graphics', 'React-utils', 'React-Fabric', 'React-runtimeexecutor', 'React-cxxreact']
    
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '13.0'
        
        # Skip pods that are known to fail with C++20
        next if excluded_pods.any? { |excluded_pod| target.name.include?(excluded_pod) }
        
        # Apply C++20 only to React components that need it
        if react_cpp20_pods.any? { |react_pod| target.name.include?(react_pod) }
          config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++20'
          config.build_settings['OTHER_CPLUSPLUSFLAGS'] = ['-std=c++20', '-fconcepts']
        end
      end
    end
    
    # Explicitly set workspace for all targets
    installer.pods_project.build_configurations.each do |config|
      config.build_settings['CONFIGURATION_BUILD_DIR'] = '$PODS_CONFIGURATION_BUILD_DIR'
      config.build_settings['SWIFT_VERSION'] = '5.0'
    end
  end
end
EOL

echo "📱 Installing pods..."
cd "$IOS_DIR"
pod install

echo "🛠️ Ensuring xcconfig files have C++20 configuration..."
# Check if xcconfig files exist
if [ -f "$IOS_DIR/Pods/Target Support Files/Pods-$APP_NAME/Pods-$APP_NAME.debug.xcconfig" ]; then
  # Add C++20 configuration if not already present
  if ! grep -q "CLANG_CXX_LANGUAGE_STANDARD = c++20" "$IOS_DIR/Pods/Target Support Files/Pods-$APP_NAME/Pods-$APP_NAME.debug.xcconfig"; then
    echo -e "\n//C++20 Configuration\nCLANG_CXX_LANGUAGE_STANDARD = c++20\nGCC_ENABLE_CPP_CONCEPTS = YES\nOTHER_CPLUSPLUSFLAGS = \$(inherited) -std=c++20 -fconcepts" >> "$IOS_DIR/Pods/Target Support Files/Pods-$APP_NAME/Pods-$APP_NAME.debug.xcconfig"
    echo -e "\n//C++20 Configuration\nCLANG_CXX_LANGUAGE_STANDARD = c++20\nGCC_ENABLE_CPP_CONCEPTS = YES\nOTHER_CPLUSPLUSFLAGS = \$(inherited) -std=c++20 -fconcepts" >> "$IOS_DIR/Pods/Target Support Files/Pods-$APP_NAME/Pods-$APP_NAME.release.xcconfig"
  fi
fi

echo "📱 Opening Xcode for code signing and build..."
cd "$PROJECT_DIR"
open ios/LyoAILearningAssistant.xcworkspace

echo "✅ Build complete. If Xcode opens, configure code signing and run the app from there."
echo "In Xcode, select the 'LyoAILearningAssistant' target. Go to the 'Signing & Capabilities' tab."
echo "Select your personal Apple ID for the team. You may need to change the bundle identifier to something unique."
echo "Then click the Build button (▶️) or press Cmd+B to build."