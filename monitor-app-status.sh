#!/bin/bash
# CONTINUOUS APP MONITORING SCRIPT
# Run this AFTER the app is built: ./monitor-app-status.sh

echo "📊 LYO AI LEARNING ASSISTANT - CONTINUOUS MONITORING"
echo "===================================================="
echo "Started: $(date)"
echo "Press Ctrl+C to stop monitoring"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Create monitoring log
touch app_monitoring.log

while true; do
    # Get current timestamp
    TIMESTAMP=$(date '+%H:%M:%S')
    
    # Check Metro bundler
    if lsof -i :8081 >/dev/null 2>&1; then
        METRO_STATUS="${GREEN}✅ Active${NC}"
        METRO_LOG="Active"
    else
        METRO_STATUS="${RED}❌ Inactive${NC}"
        METRO_LOG="Inactive"
    fi
    
    # Check iOS Simulator
    if pgrep -f "Simulator" >/dev/null; then
        SIM_STATUS="${GREEN}✅ Running${NC}"
        SIM_LOG="Running"
    else
        SIM_STATUS="${RED}❌ Stopped${NC}"
        SIM_LOG="Stopped"
    fi
    
    # Check for app process
    if pgrep -f "LyoAILearningAssistant" >/dev/null; then
        APP_STATUS="${GREEN}✅ Running${NC}"
        APP_LOG="Running"
    else
        APP_STATUS="${YELLOW}⏳ Loading/Idle${NC}"
        APP_LOG="Loading/Idle"
    fi
    
    # Check Metro bundle accessibility
    HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8081 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        BUNDLE_STATUS="${GREEN}✅ Accessible${NC}"
        BUNDLE_LOG="Accessible"
    else
        BUNDLE_STATUS="${RED}❌ Not accessible${NC}"
        BUNDLE_LOG="Not accessible"
    fi
    
    # Check for build processes
    if pgrep -f "xcodebuild" >/dev/null; then
        BUILD_STATUS="${BLUE}🔨 Building${NC}"
        BUILD_LOG="Building"
    else
        BUILD_STATUS="${GREEN}✅ Complete${NC}"
        BUILD_LOG="Complete"
    fi
    
    # Display real-time status
    printf "\r📱 Metro: %-20s | 📺 Simulator: %-20s | 🚀 App: %-20s | 📦 Bundle: %-20s | 🔨 Build: %-20s | %s" \
        "$(echo -e "$METRO_STATUS")" \
        "$(echo -e "$SIM_STATUS")" \
        "$(echo -e "$APP_STATUS")" \
        "$(echo -e "$BUNDLE_STATUS")" \
        "$(echo -e "$BUILD_STATUS")" \
        "$TIMESTAMP"
    
    # Log to file
    echo "$(date): Metro:$METRO_LOG | Simulator:$SIM_LOG | App:$APP_LOG | Bundle:$BUNDLE_LOG | Build:$BUILD_LOG" >> app_monitoring.log
    
    # Check for errors in Metro log
    if [ -f "metro.log" ] && tail -n 5 metro.log | grep -i "error\|failed" >/dev/null; then
        echo ""
        echo -e "${RED}⚠️  Error detected in Metro logs:${NC}"
        tail -n 3 metro.log | grep -i "error\|failed"
        echo ""
    fi
    
    sleep 3
done
