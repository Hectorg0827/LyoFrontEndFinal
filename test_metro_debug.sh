#!/bin/bash

LOG_FILE="/Users/republicalatuya/Desktop/LyoFrontEndFinal/metro_test.log"

echo "🔧 Metro Bundle Server Test & Fix" | tee $LOG_FILE
echo "=================================" | tee -a $LOG_FILE
echo "$(date)" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE

cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

# Step 1: Kill existing processes
echo "Step 1: Killing existing processes..." | tee -a $LOG_FILE
pkill -f "metro" 2>&1 | tee -a $LOG_FILE || true
pkill -f "expo" 2>&1 | tee -a $LOG_FILE || true
lsof -ti:8081 | xargs kill -9 2>&1 | tee -a $LOG_FILE || true
sleep 3

# Step 2: Check environment
echo "Step 2: Environment check..." | tee -a $LOG_FILE
echo "Node version: $(node --version)" | tee -a $LOG_FILE
echo "NPM version: $(npm --version)" | tee -a $LOG_FILE
echo "Expo CLI version: $(npx expo --version)" | tee -a $LOG_FILE
echo "Current directory: $(pwd)" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE

# Step 3: Start Metro
echo "Step 3: Starting Metro..." | tee -a $LOG_FILE
npx expo start --localhost --clear > metro_output.log 2>&1 &
METRO_PID=$!
echo "Metro PID: $METRO_PID" | tee -a $LOG_FILE

# Step 4: Wait and test
echo "Step 4: Waiting for Metro to start..." | tee -a $LOG_FILE
sleep 10

# Check if Metro process is still running
if ps -p $METRO_PID > /dev/null 2>&1; then
    echo "✅ Metro process is running (PID: $METRO_PID)" | tee -a $LOG_FILE
else
    echo "❌ Metro process died" | tee -a $LOG_FILE
    echo "Metro output:" | tee -a $LOG_FILE
    cat metro_output.log | tee -a $LOG_FILE
    exit 1
fi

# Test Metro status endpoint
echo "Step 5: Testing Metro endpoints..." | tee -a $LOG_FILE
STATUS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8081/status)
echo "Status endpoint: HTTP $STATUS_RESPONSE" | tee -a $LOG_FILE

# Test bundle endpoint
BUNDLE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:8081/index.bundle?platform=ios&dev=true")
echo "Bundle endpoint: HTTP $BUNDLE_RESPONSE" | tee -a $LOG_FILE

# Test the specific path iOS is looking for
EXPO_BUNDLE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:8081/node_modules/expo/AppEntry.bundle?platform=ios&dev=true")
echo "Expo AppEntry bundle: HTTP $EXPO_BUNDLE_RESPONSE" | tee -a $LOG_FILE

# Show Metro output
echo "" | tee -a $LOG_FILE
echo "=== METRO OUTPUT ===" | tee -a $LOG_FILE
head -50 metro_output.log | tee -a $LOG_FILE

echo "" | tee -a $LOG_FILE
echo "✅ Test complete. Check $LOG_FILE for full results" | tee -a $LOG_FILE
echo "Metro PID: $METRO_PID (kill with: kill $METRO_PID)" | tee -a $LOG_FILE
