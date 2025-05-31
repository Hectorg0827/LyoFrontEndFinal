#!/bin/bash

echo "🚀 Starting iOS Build Monitor..."
echo "Timestamp: $(date)"
echo "Configuration: Debug"
echo ""

# Clean any previous build artifacts
echo "🧹 Cleaning previous build artifacts..."
rm -rf ios/build/
rm -rf ios/DerivedData/

# Start the build with comprehensive logging
echo "🔨 Starting Expo iOS build..."
echo "Command: npx expo run:ios --configuration Debug"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Run the build and capture output
npx expo run:ios --configuration Debug 2>&1 | while IFS= read -r line; do
    echo "$(date '+%H:%M:%S') | $line"
    
    # Check for specific errors we've been fixing
    if echo "$line" | grep -q "'string' file not found"; then
        echo "🚨 DETECTED: 'string' file not found error"
    elif echo "$line" | grep -q "char_traits.*unsigned char"; then
        echo "🚨 DETECTED: char_traits<unsigned char> error"
    elif echo "$line" | grep -q "Redefinition"; then
        echo "🚨 DETECTED: Redefinition error"
    elif echo "$line" | grep -q "BUILD SUCCEEDED"; then
        echo "✅ BUILD SUCCEEDED!"
    elif echo "$line" | grep -q "BUILD FAILED"; then
        echo "❌ BUILD FAILED!"
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Build completed at: $(date)"
