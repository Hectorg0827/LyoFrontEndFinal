#!/bin/bash

echo "🚀 Simple iOS Metro Startup"
echo "=========================="

# Kill any existing processes
echo "🛑 Stopping existing processes..."
pkill -f "expo" || true
pkill -f "metro" || true
pkill -f "8081" || true
sleep 2

# Clear port if still in use
if lsof -i :8081 >/dev/null 2>&1; then
    echo "🔧 Force clearing port 8081..."
    lsof -ti :8081 | xargs kill -9 || true
    sleep 2
fi

echo "🧹 Clearing caches..."
npx expo install --fix >/dev/null 2>&1 || true

echo "🚀 Starting Metro (this may take a moment)..."

# Try the most basic expo start command
npx expo start --localhost

echo "✅ Metro startup complete"
