#!/bin/bash

# Metro Development Server - Clean Start
# Essential script to start Metro bundler properly

set -e

echo "📱 Starting Metro Bundler for Lyo AI Assistant"
echo "============================================="

PROJECT_ROOT=$(pwd)

# Check if Metro is already running
check_metro() {
    if lsof -ti:8081 >/dev/null 2>&1; then
        echo "⚠️  Metro is already running on port 8081"
        echo "🔄 Stopping existing Metro process..."
        kill -9 $(lsof -ti:8081) 2>/dev/null || true
        sleep 2
    fi
}

# Start Metro with proper configuration
start_metro() {
    echo "🚀 Starting Metro bundler..."
    
    # Clear Metro cache
    echo "🧹 Clearing Metro cache..."
    npx react-native start --reset-cache &
    METRO_PID=$!
    
    echo "📱 Metro started with PID: $METRO_PID"
    echo "🌐 Metro accessible at: http://localhost:8081"
    echo ""
    echo "💡 Tips:"
    echo "   - Press Ctrl+C to stop Metro"
    echo "   - Use 'r' to reload the app"
    echo "   - Use 'd' to open developer menu"
    echo ""
    
    # Keep Metro running until interrupted
    wait $METRO_PID
}

# Main execution
main() {
    check_metro
    start_metro
}

# Handle Ctrl+C gracefully
trap 'echo ""; echo "🛑 Stopping Metro..."; kill $METRO_PID 2>/dev/null || true; exit 0' INT

main
