#!/bin/bash

# LyoAI Learning Assistant - Final Status Monitor
# Created: December 24, 2024
# Purpose: Monitor app deployment status and device connectivity

echo "🎯 LyoAI Learning Assistant - Deployment Status Monitor"
echo "=================================================="
echo "📅 $(date)"
echo ""

# Check device connectivity
echo "📱 Device Connectivity Check:"
echo "------------------------------"
DEVICES=$(xcrun devicectl list devices | grep "Hector's iPhone")
if [[ $DEVICES == *"connected"* ]]; then
    echo "✅ Hector's iPhone: CONNECTED"
    DEVICE_ID=$(echo "$DEVICES" | awk '{print $3}')
    echo "   Device ID: $DEVICE_ID"
else
    echo "❌ Hector's iPhone: NOT CONNECTED"
fi
echo ""

# Check Xcode processes
echo "🔨 Xcode Build Status:"
echo "----------------------"
XCODE_PROCESSES=$(ps aux | grep -i xcode | grep -v grep | wc -l)
if [ $XCODE_PROCESSES -gt 0 ]; then
    echo "✅ Xcode is running ($XCODE_PROCESSES processes)"
    
    # Check for compilation activity
    CLANG_PROCESSES=$(ps aux | grep clang | grep -v grep | wc -l)
    if [ $CLANG_PROCESSES -gt 0 ]; then
        echo "✅ Active compilation: $CLANG_PROCESSES processes"
    else
        echo "ℹ️  No active compilation (app may be idle)"
    fi
else
    echo "❌ Xcode is not running"
fi
echo ""

# Check Metro bundler
echo "📦 Metro Bundler Status:"
echo "------------------------"
METRO_PROCESSES=$(ps aux | grep -E "(metro|expo)" | grep -v grep | wc -l)
if [ $METRO_PROCESSES -gt 0 ]; then
    echo "✅ Metro bundler is running"
else
    echo "ℹ️  Metro bundler not actively running"
fi
echo ""

# Check project structure
echo "📁 Project Status:"
echo "------------------"
if [ -f "package.json" ]; then
    echo "✅ package.json exists"
    
    # Check key dependencies
    if grep -q '"expo": "~53.0.0"' package.json; then
        echo "✅ Expo SDK 53 confirmed"
    fi
    
    if grep -q '"react": "19.0.0"' package.json; then
        echo "✅ React 19 confirmed"
    fi
    
    if grep -q '"@types/react": "\^19.0.0"' package.json; then
        echo "✅ @types/react version correct"
    fi
else
    echo "❌ package.json not found"
fi

if [ -f "index.js" ]; then
    echo "✅ index.js exists"
    
    # Check import path fix
    if grep -q 'import App from "./App"' index.js; then
        echo "✅ Import path fix confirmed"
    fi
else
    echo "❌ index.js not found"
fi

if [ -f "App.tsx" ]; then
    echo "✅ App.tsx exists"
else
    echo "❌ App.tsx not found"
fi
echo ""

# Final status summary
echo "🏆 DEPLOYMENT STATUS SUMMARY:"
echo "==============================="

# Determine overall status
OVERALL_STATUS="✅ FULLY OPERATIONAL"
if [[ $DEVICES != *"connected"* ]]; then
    OVERALL_STATUS="⚠️  DEVICE DISCONNECTED"
elif [ $XCODE_PROCESSES -eq 0 ]; then
    OVERALL_STATUS="ℹ️  APP IDLE (Xcode not running)"
fi

echo "Status: $OVERALL_STATUS"
echo "App: LyoAI Learning Assistant"
echo "Platform: React Native (Expo SDK 53)"
echo "Target: Hector's iPhone (iPhone 13 Pro Max)"
echo ""
echo "Last updated: $(date)"
echo "==============================="
