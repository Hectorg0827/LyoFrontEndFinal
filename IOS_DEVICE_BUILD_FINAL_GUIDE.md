# iOS Device Build Final Guide

This guide provides step-by-step instructions for building and installing the Lyo AI Learning Assistant app on an iOS device.

## Prerequisites

- Xcode installed on your Mac
- iOS device with iOS 14.0 or later
- Apple Developer account (personal Apple ID is sufficient for development builds)
- USB cable to connect your device to your Mac (optional)

## Build Process

1. **Clean the environment**
   
   The build script will clean any previous build artifacts to ensure a fresh build.

2. **Configure C++20 compatibility**
   
   The app requires C++20 for certain React Native components, particularly React-graphics. The script applies C++20 settings selectively to only the components that need it.

3. **Install CocoaPods dependencies**
   
   The script creates an optimized Podfile and installs all required dependencies.

4. **Configure Xcode signing**
   
   After the Pods are installed, you'll need to configure code signing in Xcode:
   
   - Open the Xcode workspace
   - Select the 'LyoAILearningAssistant' target
   - Go to the 'Signing & Capabilities' tab
   - Select your personal Apple ID for the team
   - You may need to change the bundle identifier to something unique (e.g., com.yourname.LyoAILearningAssistant)

5. **Build and run on device**
   
   - Connect your iOS device to your Mac
   - Select your device from the device dropdown in Xcode
   - Click the Build button (▶️) or press Cmd+B to build

## Running the Build Script

1. Make the script executable:
   ```bash
   chmod +x build-ios-final.sh
   ```

2. Run the script:
   ```bash
   ./build-ios-final.sh
   ```

3. Follow the on-screen instructions to complete the code signing in Xcode.

## Troubleshooting

### Common Issues

1. **C++20 compilation errors**
   
   If you encounter C++20 compilation errors, check if the affected component is in the list of React components that need C++20 in the Podfile.

2. **Preprocessor directive issues in xcconfig files**
   
   If you encounter an error like: `unsupported preprocessor directive 'C++20'`, this is caused by incorrect comment syntax in xcconfig files.

3. **Missing ExpoModulesProvider.swift file**
   
   If you see an error like: `Build input file cannot be found: 'ExpoModulesProvider.swift'`, the file is missing from the Pods directory.

4. **RNFlashList module map issues**
   
   If you encounter an error like: `Module map file '/path/to/RNFlashList.modulemap' not found`, this is a common issue with RNFlashList library.

5. **Fix All Build Issues at Once**
   
   For the quickest resolution to common build issues, run the comprehensive fix script:
   
   ```bash
   chmod +x fix-all-ios-build-issues.sh
   ./fix-all-ios-build-issues.sh
   ```
   
   This script fixes:
   - XCConfig preprocessor directive issues
   - Missing ExpoModulesProvider.swift file
   - RNFlashList module map issues
   - Other common build issues

5. **Code signing issues**
   
   - Ensure your Apple ID is added to Xcode
   - Try using a unique bundle identifier
   - If needed, in Xcode, go to Preferences > Accounts, and verify your Apple ID is set up correctly

6. **Missing Pods or incorrect configuration**
   
   If Pods are missing or configured incorrectly, run the script again to regenerate the Podfile and reinstall dependencies.

7. **"Could not find developer disk image" error**
   
   If your iOS device is running a newer iOS version than supported by your Xcode version, you'll need to update Xcode.

## What the Script Does

The `build-ios-final.sh` script automates these steps:

1. Checks available devices
2. Cleans build artifacts
3. Creates a Podfile with proper C++20 configuration
4. Installs pods with optimized settings
5. Ensures xcconfig files have C++20 configuration
6. Opens Xcode for code signing and final build

## Important Notes

- The C++20 configuration is applied selectively to avoid compatibility issues with libraries that don't support C++20.
- Certain libraries (glog, fmt, DoubleConversion, boost, etc.) are explicitly excluded from C++20 flags.
- The iOS deployment target is set to iOS 14.0 to ensure compatibility with React Native libraries.

## After Installation

Once the app is installed on your device:

1. You may need to trust the developer certificate on your iOS device:
   - Go to Settings > General > Device Management
   - Find your Apple ID and tap "Trust"

2. The app should now be ready to use on your device.
