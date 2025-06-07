# LyoAILearningAssistant - Maintenance Guide

## 🔧 Permanent Build Solution

This guide outlines the permanent fix implemented to resolve all iOS and Android build issues.

## 🎯 What Was Fixed

### 1. Root Cause Issues Resolved
- ✅ **Dependency Chaos**: Removed 150+ conflicting build scripts and patches
- ✅ **Version Conflicts**: Standardized to Expo SDK 51 with compatible versions
- ✅ **iOS C++ Issues**: Single, stable C++17 configuration
- ✅ **Android NDK Issues**: Proper NDK and Gradle configuration
- ✅ **Build Configuration**: Clean, maintainable setup

### 2. Key Changes Made
- **package.json**: Stripped to essential, stable dependencies
- **app.json**: Optimized Expo configuration with build properties
- **iOS Podfile**: Clean, single-purpose configuration
- **babel.config.js**: Simplified, working configuration
- **Project Structure**: Removed all temporary fixes and patches

## 🚀 How to Use

### Initial Setup (One Time)
```bash
./permanent_build_fix.sh
```

### Daily Development
```bash
# Start development server
npm start

# Build for iOS
npm run ios

# Build for Android  
npm run android

# Clean builds when needed
npm run clean
```

### Adding Features Back
1. **Start Small**: Add one feature at a time
2. **Test Builds**: Run builds after each addition
3. **Use Expo Install**: Always use `npx expo install <package>` for Expo-compatible versions
4. **Avoid Custom Patches**: Use official solutions when possible

## 📋 Build Commands

### Development
- `npm start` - Start Metro bundler
- `npm run ios` - Run on iOS device/simulator
- `npm run android` - Run on Android device/emulator

### Production
- `npm run build:ios` - Build iOS release
- `npm run build:android` - Build Android release

### Maintenance
- `npm run clean` - Clean all build artifacts
- `npx expo doctor` - Check for issues
- `npx expo install --fix` - Fix dependency versions

## 🛡️ Best Practices

### Do's ✅
- Use `npx expo install` for adding packages
- Keep dependencies minimal and up-to-date
- Test builds frequently during development
- Use the provided clean commands when issues arise

### Don'ts ❌
- Don't create custom patch scripts
- Don't modify Podfile manually without understanding
- Don't mix Expo SDK versions
- Don't add untested/experimental packages

## 🔍 Troubleshooting

### iOS Build Issues
1. Run `npm run clean`
2. Delete `ios/Pods` and `ios/build`
3. Run `cd ios && pod install`
4. Try build again

### Android Build Issues  
1. Run `npm run clean`
2. Delete `android/.gradle` and `android/app/build`
3. Run `cd android && ./gradlew clean`
4. Try build again

### Dependency Issues
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install`
3. Run `npx expo install --fix`
4. Rebuild platforms if needed

## 📁 Project Structure

```
LyoFrontEndFinal/
├── App.tsx                 # Main app component
├── package.json           # Dependencies (KEEP MINIMAL)
├── app.json              # Expo configuration
├── babel.config.js       # Babel configuration
├── assets/               # App assets
├── ios/                  # iOS native code
│   └── Podfile          # CocoaPods configuration
├── android/              # Android native code
└── src/                  # Source code
```

## 🔄 Version Management

### Current Stable Versions
- **Expo SDK**: 51.0.28
- **React Native**: 0.74.5
- **React**: 18.2.0

### Updating Dependencies
```bash
# Check for updates
npx expo install --fix

# Update Expo SDK (major updates)
npx expo upgrade
```

## 🚨 Emergency Reset

If builds completely break:
```bash
# Nuclear option - complete reset
rm -rf node_modules ios android .expo
./permanent_build_fix.sh
```

## 📞 Support

For issues not covered in this guide:
1. Check `npx expo doctor` output
2. Review build logs in console
3. Ensure following exact dependency versions in package.json
4. Consider reverting recent changes and adding them incrementally

---

**Remember**: This solution prioritizes stability over features. Add complexity gradually and test frequently.
