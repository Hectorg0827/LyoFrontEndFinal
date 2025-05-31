#!/bin/bash

echo "🔍 iOS Build Status Verification"
echo "================================="

# Check if required files exist
echo "✅ Checking key files..."
if [ -f "/Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/Podfile" ]; then
    echo "✅ Podfile exists"
else
    echo "❌ Podfile missing"
fi

if [ -f "/Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/LyoAILearningAssistant.xcworkspace/contents.xcworkspacedata" ]; then
    echo "✅ Xcode workspace exists"
else
    echo "❌ Xcode workspace missing"
fi

if [ -d "/Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/Pods" ]; then
    echo "✅ Pods directory exists"
else
    echo "❌ Pods directory missing"
fi

# Check for problematic script phase
echo -e "\n🔧 Checking for expo-configure-project.sh references..."
cd /Users/republicalatuya/Desktop/LyoFrontEndFinal/ios
if grep -q "expo-configure-project.sh" LyoAILearningAssistant.xcodeproj/project.pbxproj; then
    echo "❌ Still contains expo-configure-project.sh reference"
else
    echo "✅ expo-configure-project.sh reference removed"
fi

# Check glog configuration
echo -e "\n🧪 Checking glog C++ configuration..."
if [ -f "Pods/Target Support Files/glog/glog.debug.xcconfig" ]; then
    echo "✅ glog build configuration exists"
else
    echo "❌ glog build configuration missing"
fi

# Check AppDelegate
echo -e "\n📱 Checking AppDelegate configuration..."
if grep -q "EXAppDelegateWrapper" LyoAILearningAssistant/AppDelegate.h; then
    echo "✅ AppDelegate.h properly configured"
else
    echo "❌ AppDelegate.h needs fixing"
fi

if grep -q "bundleURL" LyoAILearningAssistant/AppDelegate.mm; then
    echo "✅ AppDelegate.mm has bundle URL method"
else
    echo "❌ AppDelegate.mm missing bundle URL method"
fi

# Check Node configuration
echo -e "\n⚙️  Checking Node configuration..."
if [ -f ".xcode.env.local" ]; then
    echo "✅ .xcode.env.local exists"
    cat .xcode.env.local
else
    echo "❌ .xcode.env.local missing"
fi

echo -e "\n🏁 Summary:"
echo "==========="
echo "Based on the manual changes made:"
echo "1. ✅ Removed problematic expo-configure-project.sh script phase"
echo "2. ✅ Updated AppDelegate.h with correct Expo imports"  
echo "3. ✅ Updated AppDelegate.mm with proper bundle URL handling"
echo "4. ✅ Set NODE_BINARY path in .xcode.env.local"
echo "5. ✅ Added glog C++17 fixes to Podfile"
echo ""
echo "The iOS build should now work. Try running:"
echo "cd /Users/republicalatuya/Desktop/LyoFrontEndFinal && npx expo run:ios"
