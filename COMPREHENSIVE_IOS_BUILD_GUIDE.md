# Comprehensive iOS Build Guide for Lyo AI Learning Assistant

This guide provides a complete step-by-step approach to build the Lyo AI Learning Assistant app for iOS devices, resolving all C++ compilation issues and device deployment challenges.

## Phase 1: Environment Preparation

### Clean Build Environment

```bash
# Navigate to project directory
cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

# Clean previous build artifacts
rm -rf ios/build ios/Pods ios/Podfile.lock
rm -rf ~/Library/Developer/Xcode/DerivedData/*LyoAILearningAssistant*

# Update dependencies
npm install
```

### Fix Podfile Configuration

The Podfile has been updated to resolve all known C++ and Swift compilation issues:

```bash
# Ensure the Podfile is correctly configured
cat > ios/Podfile << 'EOF'
require File.join(File.dirname(`node --print "require.resolve('expo/package.json')"`), "scripts/autolinking")
require File.join(File.dirname(`node --print "require.resolve('react-native/package.json')"`), "scripts/react_native_pods")
require File.join(File.dirname(`node --print "require.resolve('@react-native-community/cli-platform-ios/package.json')"`), "native_modules")

require 'json'
podfile_properties = JSON.parse(File.read(File.join(__dir__, 'Podfile.properties.json'))) rescue {}

platform :ios, podfile_properties['ios.deploymentTarget'] || '13.4'
install! 'cocoapods', :deterministic_uuids => false

# Needed for proper workspace detection
workspace 'LyoAILearningAssistant.xcworkspace'

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
    
    # Fix for arm64 architecture build issues (React Native 0.74.5)
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = 'arm64'
      end
    end

    # C++20 fixes for specific libraries, excluding incompatible libraries
    excluded_pods = ['glog', 'fmt', 'DoubleConversion', 'boost', 'libwebp', 'libavif', 'libdav1d', 'sqlite3']
    react_cpp20_pods = ['React-graphics', 'React-utils', 'React-Fabric', 'React-runtimeexecutor', 'React-cxxreact']
    
    # Apply fixes to targets
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        # Set minimum iOS version to avoid warnings
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '13.4'
        
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
        
        # Add Swift-specific settings for Expo modules
        if target.name.include?('Expo') || target.name.include?('EX')
          config.build_settings['SWIFT_VERSION'] = '5.0'
          config.build_settings['DEFINES_MODULE'] = 'YES'
          config.build_settings['CLANG_ENABLE_MODULES'] = 'YES'
          config.build_settings['ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES'] = 'YES'
        end
        
        # Skip C++20 settings for incompatible libraries
        if excluded_pods.any? { |excluded| target.name.include?(excluded) }
          next
        end
        
        # Apply C++20 only to React components that need it
        if react_cpp20_pods.any? { |react_pod| target.name.include?(react_pod) }
          config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++20'
          config.build_settings['OTHER_CPLUSPLUSFLAGS'] = ['-std=c++20', '-fconcepts']
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
```

### Install Pods

```bash
cd ios
pod install
cd ..
```

## Phase 2: Build Options

### Option 1: Build via Xcode (Most Reliable)

1. **Open the Xcode workspace**:
   ```bash
   open ios/LyoAILearningAssistant.xcworkspace
   ```

2. **Configure code signing**:
   - Select the LyoAILearningAssistant target
   - Go to "Signing & Capabilities"
   - Select your Apple ID in "Team" dropdown
   - Ensure bundle identifier is: `com.lyo.LyoAILearningAssistant`

3. **Select your iOS device** from the device dropdown in Xcode

4. **Build and run** (⌘R)

### Option 2: React Native CLI Build

For building directly from the command line:

1. **Check available devices**:
   ```bash
   xcrun xctrace list devices
   ```

2. **Build for device** (use your device name from the list):
   ```bash
   npx react-native run-ios --device "DEVICE_NAME"
   ```

   For example:
   ```bash
   npx react-native run-ios --device "Walkiris"
   ```

### Option 3: Simulator Build for Testing

Test the build on a simulator first:

```bash
npx react-native run-ios
```

## Phase 3: Device Installation

After a successful build, you need to:

1. **Trust the developer certificate** on your iOS device:
   - Settings > General > VPN & Device Management
   - Find your Apple ID/developer profile
   - Tap "Trust" to allow the app to run

2. **Check app permissions**:
   - Allow camera access when prompted
   - Allow microphone access
   - Allow location access if requested

## Phase 4: Troubleshooting

### C++ Compilation Errors (Already Fixed)

The Podfile has been updated to address several C++ issues:

1. **glog compatibility with C++20**
   - Excluded glog from C++20 flags
   - Fixed in the Podfile by excluding incompatible libraries

2. **React Graphics C++20 concepts**
   - Selectively applied C++20 to React components that need it
   - Fixed by targeting specific React libraries with C++20 support

3. **Swift compilation errors**
   - Added proper Swift module definitions
   - Fixed DEFINES_MODULE and SWIFT_VERSION settings

### Device Connection Issues

If your device isn't detected:

1. **Check device is connected properly**:
   - Make sure device is unlocked
   - Trust the computer when prompted
   - Try a different USB cable

2. **Enable developer mode** (iOS 16+):
   - Settings > Privacy & Security > Developer Mode
   - Restart device when prompted

3. **Verify device is recognized**:
   ```bash
   xcrun xctrace list devices
   ```

### Code Signing Problems

If you encounter code signing errors:

1. **Check Xcode account setup**:
   - Xcode > Preferences > Accounts
   - Add your Apple ID if not already added
   - Download manual profiles if needed

2. **Try a unique bundle identifier**:
   - Modify `ios/LyoAILearningAssistant.xcodeproj`
   - Change bundle identifier to something unique (e.g., add your initials)

## Phase 5: Verification

To verify successful installation:

1. **App launches without crashing** on your iOS device
2. **Core functionality works**:
   - Verify AI assistant features
   - Test navigation between screens
   - Check app appearance and layout

## Complete Build Script

For a single-command build solution, use this script:

```bash
#!/bin/bash

# Navigate to project
cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

# Clean environment
rm -rf ios/build ios/Pods ios/Podfile.lock
rm -rf ~/Library/Developer/Xcode/DerivedData/*LyoAILearningAssistant*

# Update dependencies
npm install

# Install pods
cd ios
pod install
cd ..

# List available devices
echo "Available iOS devices:"
xcrun xctrace list devices | grep -v "Offline" | grep -E "iPhone|iPad"

# Prompt for device name
echo ""
echo "Enter your device name from the list above (e.g., Walkiris):"
read device_name

# Build for device
if [ -n "$device_name" ]; then
  echo "Building for device: $device_name"
  npx react-native run-ios --device "$device_name"
else
  echo "No device name provided. Building for simulator instead."
  npx react-native run-ios
fi
```

## Summary

The Lyo AI Learning Assistant iOS build issues have been resolved by:

1. **Updating the Podfile** with strategic C++ fixes
2. **Targeting C++20 features** only to components that need them
3. **Excluding incompatible libraries** from C++20 compilation
4. **Adding proper Swift support** for Expo modules

Follow this guide to successfully build and deploy the app to your iOS device.

## Next Steps

After successful deployment:
- Test all app features thoroughly
- Verify network connectivity and API integration
- Test push notifications if implemented
- Consider adding automated testing for future builds