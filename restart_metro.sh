#!/bin/bash

# Quick Development Server Restart
echo "🔄 Quick Metro Server Restart"
echo "============================="

cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

# Kill Metro processes
lsof -ti:8081 | xargs kill -9 2>/dev/null || true

# Start Metro in LAN mode (accessible from simulator)
echo "🚀 Starting Metro in LAN mode..."
npx expo start --lan --clear
