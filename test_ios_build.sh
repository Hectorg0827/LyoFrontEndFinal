#!/bin/bash

echo "=== Starting iOS Build Test ==="
echo "Date: $(date)"
echo "Working Directory: $(pwd)"

cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

echo "=== Listing connected devices ==="
xcrun xctrace list devices

echo "=== Starting React Native iOS build ==="
npx react-native run-ios --device "Hector's iPhone"

echo "=== Build completed at $(date) ==="
