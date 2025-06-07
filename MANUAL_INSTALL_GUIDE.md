# 🚀 MANUAL BUILD AND INSTALL GUIDE

## Step-by-Step Instructions to Install App on Your iPhone

### Step 1: Clean Environment
```bash
cd /Users/republicalatuya/Desktop/LyoFrontEndFinal
pkill -f "expo start" || true
pkill -f "metro" || true
pkill -f "xcodebuild" || true
rm -rf .expo/
rm -rf node_modules/.cache/
rm -rf ios/build/
rm -rf ios/DerivedData/
```

### Step 2: Check Device Connection
```bash
xcrun devicectl list devices
```
Look for "Hector's iPhone" and note its device ID.

### Step 3: Install Dependencies
```bash
npm install
cd ios
pod install --repo-update
cd ..
```

### Step 4: Build and Install on iPhone
Replace `DEVICE_ID` with the actual device ID from Step 2:
```bash
npx expo run:ios --device DEVICE_ID --configuration Debug
```

### Alternative Method (if above fails):
```bash
# Start Metro bundler first
npx expo start --clear &

# In another terminal, build for device
npx expo run:ios --device DEVICE_ID
```

### If you encounter the device selection error:
```bash
npx expo run:ios --device
```
Then manually select "Hector's iPhone" from the list.

### Expected Result:
- Build completes successfully
- App automatically installs on Hector's iPhone
- You can launch the app from the iPhone home screen

### Troubleshooting:
1. If Metro port conflict: `lsof -ti:8081 | xargs kill -9`
2. If CocoaPods issues: `cd ios && rm -rf Pods Podfile.lock && pod install && cd ..`
3. If device not found: Check iPhone is connected, unlocked, and trusted

Run these commands one by one in Terminal and let me know the output of each step!
