#!/bin/bash

# Essential Metro Development Server for Lyo AI Learning Assistant
# Clean Metro bundler startup

set -e

echo "📱 Metro Bundler - Lyo AI Learning Assistant"
echo "==========================================="

PROJECT_ROOT=$(pwd | sed 's|/scripts||')
cd "$PROJECT_ROOT"

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
    
    # Clear Metro cache for clean start
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

# Handle Ctrl+C gracefully
trap 'echo ""; echo "🛑 Stopping Metro..."; kill $METRO_PID 2>/dev/null || true; exit 0' INT

# Main execution
main() {
    check_metro
    start_metro
}

main
