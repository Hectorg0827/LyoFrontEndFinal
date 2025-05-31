#!/bin/bash

# Lyo Backend Server Management Script

echo "🚀 Lyo Backend Server Manager"
echo "=============================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Install dependencies if not already installed
echo "📦 Installing dependencies..."
npm install express cors uuid --silent

# Check if server.js exists
if [ ! -f "server.js" ]; then
    echo "❌ server.js not found in current directory"
    exit 1
fi

echo "✅ server.js found"

# Kill any existing process on port 8000
echo "🔄 Checking for existing processes on port 8000..."
if lsof -Pi :8000 -sTCP:LISTEN -t > /dev/null 2>&1; then
    echo "⚠️  Port 8000 is in use. Killing existing processes..."
    lsof -Pi :8000 -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Start the server
echo "🌟 Starting Lyo Backend Server on port 8000..."
echo "   Health check will be available at: http://localhost:8000/api/v1/health"
echo "   Press Ctrl+C to stop the server"
echo ""

# Start the server with proper error handling
node server.js
