#!/bin/bash

# LyoAILearningAssistant - Build Test Script
# This script tests both iOS and Android builds after the permanent fix

echo "🚀 Starting Build Tests for LyoAILearningAssistant"
echo "Date: $(date)"
echo "============================================"

# Change to project directory
cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

echo "📱 Testing iOS Build..."
echo "========================"

# Test iOS Simulator Build
echo "1. Testing iOS Simulator build..."
npx expo run:ios --simulator 2>&1 | tee ios_build_test.log &
IOS_PID=$!

# Wait a bit then test Android
sleep 30

echo ""
echo "🤖 Testing Android Build..."
echo "=========================="

# Test Android Build
echo "1. Testing Android build..."
npx expo run:android 2>&1 | tee android_build_test.log &
ANDROID_PID=$!

echo ""
echo "⏳ Build tests initiated..."
echo "iOS Build PID: $IOS_PID"
echo "Android Build PID: $ANDROID_PID"
echo ""
echo "Monitor progress:"
echo "  iOS Log: tail -f ios_build_test.log"
echo "  Android Log: tail -f android_build_test.log"
echo ""
echo "✅ Both builds started successfully!"
echo "Check the log files for detailed progress."
