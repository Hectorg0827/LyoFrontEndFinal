#!/bin/bash

echo "🚀 Starting Metro Bundler for LyoAI Learning Assistant..."
echo "📱 This will connect Hector's iPhone to the development server"
echo "⏳ Please wait for the bundler to start..."

cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

# Start Metro with tunnel mode for device connection
npx expo start --tunnel

echo "✅ Metro bundler started!"
echo "📱 On Hector's iPhone, shake the device and tap 'Reload' to connect to Metro"
