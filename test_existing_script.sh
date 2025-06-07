#!/bin/bash

echo "🔍 Testing Existing start_and_run_ios.sh Script"
echo "==============================================="

cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

# Make sure the script is executable
chmod +x start_and_run_ios.sh

echo "Starting the existing script with output capture..."
echo ""

# Run the existing script but capture output
timeout 60s ./start_and_run_ios.sh > start_and_run_ios_output.log 2>&1 &
SCRIPT_PID=$!

echo "Script PID: $SCRIPT_PID"
echo "Monitoring script execution..."

# Monitor the script
for i in {1..60}; do
    if ! ps -p $SCRIPT_PID > /dev/null 2>&1; then
        echo "Script completed at iteration $i"
        break
    fi
    
    # Check if Metro is running
    METRO_RUNNING=$(ps aux | grep -E "expo.*start|metro" | grep -v grep | wc -l)
    if [ $METRO_RUNNING -gt 0 ]; then
        echo "✅ Metro process detected running"
        
        # Test Metro connectivity
        if curl -s http://localhost:8081 >/dev/null 2>&1; then
            echo "✅ Metro is responding on port 8081"
            echo "SUCCESS: Metro is working!"
            break
        fi
    fi
    
    echo "Monitoring... ($i/60)"
    sleep 1
done

echo ""
echo "=== SCRIPT OUTPUT ==="
cat start_and_run_ios_output.log 2>/dev/null || echo "No output captured"

echo ""
echo "=== FINAL STATUS ==="
echo "Metro processes: $(ps aux | grep -E "expo.*start|metro" | grep -v grep | wc -l)"
echo "Port 8081 in use: $(lsof -i :8081 >/dev/null 2>&1 && echo 'Yes' || echo 'No')"
echo "Metro responding: $(curl -s http://localhost:8081 >/dev/null 2>&1 && echo 'Yes' || echo 'No')"

if curl -s http://localhost:8081 >/dev/null 2>&1; then
    echo ""
    echo "✅ SUCCESS: Metro is running and responding!"
    echo "🚀 You can now launch your iOS app"
else
    echo ""
    echo "❌ ISSUE: Metro is not responding properly"
    echo "Check the output above for errors"
fi
