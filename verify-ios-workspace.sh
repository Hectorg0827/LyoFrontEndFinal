#!/bin/bash

echo "🔍 iOS Workspace Verification"
echo "=============================="

cd /Users/republicalatuya/Desktop/LyoFrontEndFinal/ios

# Check workspace file
if [ -d "LyoAILearningAssistant.xcworkspace" ]; then
    echo "✅ LyoAILearningAssistant.xcworkspace exists"
    if [ -f "LyoAILearningAssistant.xcworkspace/contents.xcworkspacedata" ]; then
        echo "✅ Workspace contents file exists"
        echo "📄 Workspace content:"
        cat "LyoAILearningAssistant.xcworkspace/contents.xcworkspacedata"
    else
        echo "❌ Workspace contents file missing"
    fi
else
    echo "❌ Workspace directory missing"
fi

echo -e "\n🔧 Checking related files:"

# Check Podfile.lock
if [ -f "Podfile.lock" ]; then
    echo "✅ Podfile.lock exists"
else
    echo "⚠️  Podfile.lock missing (pod install may not have completed)"
fi

# Check Pods directory
if [ -d "Pods" ] && [ -f "Pods/Pods.xcodeproj/project.pbxproj" ]; then
    echo "✅ Pods project exists"
else
    echo "❌ Pods project missing"
fi

# Check main project
if [ -f "LyoAILearningAssistant.xcodeproj/project.pbxproj" ]; then
    echo "✅ Main Xcode project exists"
else
    echo "❌ Main Xcode project missing"
fi

echo -e "\n🏁 Status:"
if [ -d "LyoAILearningAssistant.xcworkspace" ] && [ -f "LyoAILearningAssistant.xcworkspace/contents.xcworkspacedata" ]; then
    echo "✅ iOS workspace is ready for building!"
    echo ""
    echo "You can now build with:"
    echo "cd /Users/republicalatuya/Desktop/LyoFrontEndFinal && npx expo run:ios"
else
    echo "❌ Workspace setup incomplete"
fi
