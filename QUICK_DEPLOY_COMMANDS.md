# 📱 QUICK DEPLOYMENT COMMANDS
## Ready-to-Use Commands for LyoAILearningAssistant

### 🍎 **iOS DEPLOYMENT**

#### To iPhone (Hector's Device):
```bash
cd /Users/republicalatuya/Desktop/LyoFrontEndFinal
npx expo run:ios --device
```

#### To iOS Simulator (Testing):
```bash
cd /Users/republicalatuya/Desktop/LyoFrontEndFinal
npx expo run:ios --simulator
```

### 🤖 **ANDROID DEPLOYMENT**

#### To Android Device:
```bash
cd /Users/republicalatuya/Desktop/LyoFrontEndFinal
npx expo run:android --device
```

#### To Android Emulator:
```bash
cd /Users/republicalatuya/Desktop/LyoFrontEndFinal
npx expo run:android
```

### 🧹 **CLEAN BUILD (If Needed)**

#### iOS Clean Build:
```bash
cd /Users/republicalatuya/Desktop/LyoFrontEndFinal
rm -rf ios/build
npx expo run:ios --simulator --clean
```

#### Android Clean Build:
```bash
cd /Users/republicalatuya/Desktop/LyoFrontEndFinal
cd android && ./gradlew clean && cd ..
npx expo run:android --clean
```

---
**✅ All systems ready for deployment!**
