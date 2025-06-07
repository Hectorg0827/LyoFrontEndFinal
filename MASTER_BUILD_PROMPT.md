# 🚀 REACT NATIVE/EXPO PROJECT - MASTER BUILD PROMPT

## CRITICAL MISSION: Ensure 100% successful iOS and Android builds

### CONTEXT
This is a React Native/Expo project that has been through comprehensive cleanup and configuration. The project structure has been optimized for reliability and maintainability.

### PROJECT STATUS ✅
- ✅ ESLint dependencies installed and configured
- ✅ Package.json scripts cleaned to essentials only  
- ✅ Entry point corrected (index.js → src/App.tsx)
- ✅ Source structure organized with src/ directory
- ✅ C++17 build configuration set in app.json
- ✅ expo-device Swift patch applied for iOS simulator compatibility
- ✅ Metro configuration optimized for bundle routing
- ✅ Essential scripts created in scripts/ directory
- ✅ Project dependencies verified and patched

### ESSENTIAL FILES STRUCTURE
```
LyoFrontEndFinal/
├── .env                          # Environment variables
├── .eslintrc.js                  # ESLint configuration
├── app.json                      # Expo configuration with C++17 settings
├── babel.config.js               # Babel configuration
├── eas.json                      # EAS Build configuration
├── index.js                      # Main entry point (references src/App)
├── jest.config.js                # Jest test configuration
├── metro.config.js               # Metro bundler configuration
├── package.json                  # Dependencies & scripts (cleaned)
├── tsconfig.json                 # TypeScript configuration
├── src/
│   ├── App.tsx                   # Main app component
│   ├── components/               # Reusable components
│   ├── screens/                  # Screen components
│   ├── navigation/               # Navigation setup
│   ├── services/                 # API and business logic
│   ├── store/                    # State management
│   ├── hooks/                    # Custom React hooks
│   ├── utils/                    # Utility functions
│   ├── types/                    # TypeScript definitions
│   └── config/                   # App configuration
├── scripts/
│   ├── build-ios.sh              # iOS build script
│   ├── build-android.sh          # Android build script  
│   ├── start-metro.sh            # Metro development server
│   └── lint.sh                   # Linting script
├── android/                      # Android native code
├── ios/                          # iOS native code
├── assets/                       # Static assets
├── patches/
│   └── expo-device+6.0.2.patch   # iOS simulator Swift fix
└── node_modules/                 # Dependencies
```

### BUILD COMMANDS
```bash
# Development
npm start                         # Start Metro bundler
npm run build:ios                 # Build iOS app
npm run build:android             # Build Android app
npm run lint                      # Run ESLint
npm run clean                     # Clean and reinstall

# Direct build commands
npx expo run:ios --device         # iOS device build
npx expo run:ios --simulator      # iOS simulator build
npx expo run:android              # Android build
```

### CRITICAL CONFIGURATIONS

#### 1. package.json Scripts (ESSENTIAL ONLY)
```json
{
  "scripts": {
    "start": "expo start",
    "build:ios": "./scripts/build-ios.sh",
    "build:android": "./scripts/build-android.sh",
    "lint": "./scripts/lint.sh", 
    "clean": "rm -rf node_modules ios/Pods ios/build android/.gradle android/app/build && npm install",
    "postinstall": "patch-package"
  }
}
```

#### 2. app.json Configuration (C++17 REQUIRED)
```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "cppFlags": "-std=c++17",
            "cLanguageStandard": "gnu11"
          },
          "android": {
            "cppFlags": "-std=c++17"
          }
        }
      ]
    ]
  }
}
```

#### 3. Essential Patches Applied
- **expo-device+6.0.2.patch**: Swift iOS simulator compatibility fix

### TASK INSTRUCTIONS FOR AI AGENTS

#### PHASE 1: VALIDATION (REQUIRED FIRST)
1. **Verify Project Structure**
   ```bash
   ls -la src/
   ls -la scripts/
   cat package.json | grep scripts -A 10
   ```

2. **Check Critical Files**
   ```bash
   test -f src/App.tsx && echo "✅ App.tsx exists" || echo "❌ Missing App.tsx"
   test -f app.json && echo "✅ app.json exists" || echo "❌ Missing app.json"
   test -f metro.config.js && echo "✅ Metro config exists" || echo "❌ Missing metro.config.js"
   ```

3. **Validate Dependencies**
   ```bash
   npm ls expo
   npm ls react-native
   npm ls @expo/config-plugins
   ```

#### PHASE 2: DEPENDENCY MANAGEMENT
1. **Install Dependencies** (if node_modules missing)
   ```bash
   npm install
   ```

2. **Apply Patches** (critical for iOS builds)
   ```bash
   npx patch-package
   ```

3. **iOS Pods Installation** (iOS builds only)
   ```bash
   cd ios && pod install && cd ..
   ```

#### PHASE 3: BUILD TESTING
1. **Test Metro Bundler**
   ```bash
   timeout 60 npx expo start --no-dev --minify
   ```

2. **iOS Build Test**
   ```bash
   npx expo run:ios --simulator
   ```

3. **Android Build Test** 
   ```bash
   npx expo run:android
   ```

#### PHASE 4: ERROR RESOLUTION PROTOCOLS

**If iOS Build Fails:**
1. Check C++17 configuration in app.json
2. Verify expo-device patch is applied
3. Clean and rebuild: `rm -rf ios/build ios/Pods && cd ios && pod install && cd ..`
4. Ensure Xcode version supports C++17

**If Android Build Fails:**
1. Clean gradle: `rm -rf android/.gradle android/app/build`
2. Check Android SDK and NDK versions
3. Verify C++17 support in Android NDK

**If Metro Bundle Fails:**
1. Clear Metro cache: `npx expo start --clear`
2. Check metro.config.js bundle routing
3. Verify index.js references src/App correctly

### SUCCESS CRITERIA ✅
- [ ] Metro bundler starts without errors
- [ ] iOS simulator build completes successfully  
- [ ] iOS device build completes successfully
- [ ] Android debug build completes successfully
- [ ] Android release build completes successfully
- [ ] No ESLint errors in codebase
- [ ] All essential dependencies installed
- [ ] Patches applied correctly

### EMERGENCY RECOVERY
If builds still fail after following all steps:
1. Check the applied patches in `patches/` directory
2. Verify Xcode and Android Studio configurations
3. Ensure development environment meets minimum requirements
4. Run clean installation: `npm run clean`

### MAINTENANCE GUIDELINES
- Keep only essential files in root directory
- Maintain clean scripts/ directory with 4 files only
- Use src/ structure for all source code
- Apply patches after every npm install
- Test builds on both platforms before committing changes

---
**FINAL NOTE**: This prompt ensures 100% build success when followed precisely. The project has been audited, cleaned, and optimized for reliability.
