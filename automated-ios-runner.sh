#!/bin/bash
# Automated iOS App Runner with Comprehensive Monitoring
# This script will build, run, and monitor the LyoAI Learning Assistant app

set -e  # Exit on any error

echo "🚀 AUTOMATED iOS APP RUNNER - COMPREHENSIVE MONITORING"
echo "======================================================"
echo "Start Time: $(date)"
echo "Project: LyoAI Learning Assistant"
echo ""

# Color codes for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function for colored logging
log() {
    echo -e "[$(date '+%H:%M:%S')] ${GREEN}✅${NC} $1"
}

warn() {
    echo -e "[$(date '+%H:%M:%S')] ${YELLOW}⚠️${NC} $1"
}

error() {
    echo -e "[$(date '+%H:%M:%S')] ${RED}❌${NC} $1"
}

info() {
    echo -e "[$(date '+%H:%M:%S')] ${BLUE}ℹ️${NC} $1"
}

# Function to check if a process is running
check_process() {
    if pgrep -f "$1" > /dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to wait for Metro to start
wait_for_metro() {
    info "Waiting for Metro bundler to start..."
    local timeout=60
    local elapsed=0
    
    while [ $elapsed -lt $timeout ]; do
        if lsof -i :8081 >/dev/null 2>&1; then
            log "Metro bundler is running on port 8081"
            return 0
        fi
        sleep 2
        elapsed=$((elapsed + 2))
        echo -n "."
    done
    
    error "Metro bundler failed to start within $timeout seconds"
    return 1
}

# Function to monitor app health
monitor_app_health() {
    info "Starting app health monitoring..."
    
    while true; do
        # Check Metro bundler
        if lsof -i :8081 >/dev/null 2>&1; then
            echo -ne "\r${GREEN}📱 Metro: Active${NC} | "
        else
            echo -ne "\r${RED}📱 Metro: Inactive${NC} | "
        fi
        
        # Check iOS Simulator
        if pgrep -f "Simulator" >/dev/null; then
            echo -ne "${GREEN}📺 Simulator: Running${NC} | "
        else
            echo -ne "${RED}📺 Simulator: Stopped${NC} | "
        fi
        
        # Check for app process
        if pgrep -f "LyoAILearningAssistant" >/dev/null; then
            echo -ne "${GREEN}🚀 App: Running${NC} | "
        else
            echo -ne "${YELLOW}🚀 App: Loading${NC} | "
        fi
        
        # Check build processes
        if pgrep -f "xcodebuild" >/dev/null; then
            echo -ne "${BLUE}🔨 Build: Active${NC}"
        else
            echo -ne "${GREEN}🔨 Build: Complete${NC}"
        fi
        
        echo -ne " | $(date '+%H:%M:%S')\r"
        sleep 2
    done
}

# Cleanup function
cleanup_environment() {
    log "🧹 PHASE 1: Cleaning build environment..."
    
    # Kill existing Metro processes
    pkill -f "metro" 2>/dev/null || true
    pkill -f "react-native start" 2>/dev/null || true
    
    # Clean iOS build artifacts
    info "Cleaning iOS build artifacts..."
    rm -rf ios/build
    rm -rf ios/Pods
    rm -rf ios/Podfile.lock
    rm -rf ios/*.xcworkspace
    
    # Clean React Native caches
    info "Cleaning React Native caches..."
    npx react-native clean 2>/dev/null || true
    rm -rf node_modules/.cache
    rm -rf /tmp/metro-*
    rm -rf /tmp/react-*
    rm -rf /tmp/haste-*
    
    # Clean node_modules
    info "Cleaning node_modules..."
    rm -rf node_modules
    rm -rf package-lock.json
    npm cache clean --force
    
    log "Environment cleanup completed"
}

# Install dependencies
install_dependencies() {
    log "📦 PHASE 2: Installing dependencies..."
    
    info "Installing npm packages..."
    npm install
    
    if [ $? -eq 0 ]; then
        log "npm install successful"
    else
        error "npm install failed"
        exit 1
    fi
    
    info "Applying critical patches..."
    npx patch-package
    
    if [ $? -eq 0 ]; then
        log "Patches applied successfully"
        info "Essential expo-device Swift patch is now active"
    else
        error "Patch application failed"
        exit 1
    fi
}

# Prebuild iOS project
prebuild_project() {
    log "🔧 PHASE 3: Regenerating iOS project..."
    
    info "Running expo prebuild to fix Codegen issues..."
    npx expo prebuild --platform ios --clean
    
    if [ $? -eq 0 ]; then
        log "iOS project regenerated successfully"
        info "Codegen issues should now be resolved"
    else
        error "iOS project generation failed"
        exit 1
    fi
}

# Install CocoaPods
install_cocoapods() {
    log "🍫 PHASE 4: Installing CocoaPods dependencies..."
    
    cd ios
    
    info "Deintegrating existing pods..."
    pod deintegrate 2>/dev/null || true
    
    info "Updating CocoaPods repo..."
    pod repo update
    
    info "Installing pods with updated repo..."
    pod install --repo-update --verbose
    
    if [ $? -eq 0 ]; then
        log "CocoaPods installation successful"
    else
        error "CocoaPods installation failed"
        cd ..
        exit 1
    fi
    
    cd ..
}

# Start Metro bundler
start_metro() {
    log "📦 PHASE 5: Starting Metro bundler..."
    
    info "Starting Metro in background..."
    npx expo start --clear > metro.log 2>&1 &
    METRO_PID=$!
    
    info "Metro started with PID: $METRO_PID"
    
    # Wait for Metro to be ready
    wait_for_metro
    
    if [ $? -eq 0 ]; then
        log "Metro bundler is ready"
    else
        error "Metro bundler failed to start"
        kill $METRO_PID 2>/dev/null || true
        exit 1
    fi
}

# Build and run iOS app
build_and_run_ios() {
    log "🏗️ PHASE 6: Building and running iOS app..."
    
    info "Starting iOS build process..."
    info "This may take 5-15 minutes..."
    
    # Start app health monitoring in background
    monitor_app_health &
    MONITOR_PID=$!
    
    # Start build
    npx expo run:ios --device > ios_build.log 2>&1 &
    BUILD_PID=$!
    
    info "Build process started with PID: $BUILD_PID"
    
    # Monitor build progress
    BUILD_START_TIME=$(date +%s)
    
    while kill -0 $BUILD_PID 2>/dev/null; do
        CURRENT_TIME=$(date +%s)
        ELAPSED=$((CURRENT_TIME - BUILD_START_TIME))
        
        # Check for build completion
        if tail -n 10 ios_build.log | grep -q "Build succeeded\|success Installed the app"; then
            echo "" # New line after monitoring
            log "🎉 BUILD AND INSTALLATION SUCCEEDED! (${ELAPSED}s elapsed)"
            break
        elif tail -n 10 ios_build.log | grep -q "Build failed\|error:"; then
            echo "" # New line after monitoring
            error "BUILD FAILED! (${ELAPSED}s elapsed)"
            error "Last 20 lines of build output:"
            tail -n 20 ios_build.log
            kill $MONITOR_PID 2>/dev/null || true
            exit 1
        fi
        
        # Safety timeout (25 minutes)
        if [ $ELAPSED -gt 1500 ]; then
            echo "" # New line after monitoring
            warn "Build timeout reached (25 minutes)"
            kill $BUILD_PID 2>/dev/null || true
            kill $MONITOR_PID 2>/dev/null || true
            exit 1
        fi
        
        sleep 3
    done
    
    # Wait for build to complete
    wait $BUILD_PID
    BUILD_EXIT_CODE=$?
    
    # Stop health monitoring
    kill $MONITOR_PID 2>/dev/null || true
    echo "" # New line after monitoring
    
    if [ $BUILD_EXIT_CODE -eq 0 ]; then
        log "iOS build completed successfully"
    else
        error "iOS build failed with exit code: $BUILD_EXIT_CODE"
        exit 1
    fi
}

# Verify app installation and functionality
verify_app() {
    log "✅ PHASE 7: Verifying app installation and functionality..."
    
    # Check if Metro is serving
    if lsof -i :8081 >/dev/null 2>&1; then
        log "Metro bundler is serving on port 8081"
    else
        warn "Metro bundler may not be running"
    fi
    
    # Check iOS Simulator
    if pgrep -f "Simulator" >/dev/null; then
        log "iOS Simulator is running"
    else
        warn "iOS Simulator may not be running"
    fi
    
    # Wait a moment for app to fully load
    info "Waiting for app to fully load..."
    sleep 10
    
    # Check for app process
    if pgrep -f "LyoAILearningAssistant" >/dev/null; then
        log "LyoAI Learning Assistant app is running"
    else
        warn "App process not detected, but this may be normal"
    fi
    
    # Check Metro bundle status
    if curl -s http://localhost:8081/index.bundle > /dev/null; then
        log "Metro is serving app bundle successfully"
    else
        warn "Metro bundle may not be accessible"
    fi
    
    info "Opening Metro bundler in browser for monitoring..."
    open http://localhost:8081 2>/dev/null || true
}

# Start continuous monitoring
start_continuous_monitoring() {
    log "📊 PHASE 8: Starting continuous app monitoring..."
    
    info "Monitoring will continue until you stop it with Ctrl+C"
    info "Monitor logs are being saved to monitoring.log"
    
    # Start continuous monitoring
    while true; do
        {
            echo "$(date): App Status Check"
            echo "Metro: $(lsof -i :8081 >/dev/null 2>&1 && echo 'Running' || echo 'Stopped')"
            echo "Simulator: $(pgrep -f 'Simulator' >/dev/null && echo 'Running' || echo 'Stopped')"
            echo "App Process: $(pgrep -f 'LyoAILearningAssistant' >/dev/null && echo 'Running' || echo 'Not detected')"
            echo "Metro Response: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:8081 2>/dev/null)"
            echo "---"
        } >> monitoring.log
        
        # Display current status
        echo -ne "\r${GREEN}📱 Metro: $(lsof -i :8081 >/dev/null 2>&1 && echo 'Active' || echo 'Inactive')${NC} | "
        echo -ne "${GREEN}📺 Simulator: $(pgrep -f 'Simulator' >/dev/null && echo 'Running' || echo 'Stopped')${NC} | "
        echo -ne "${GREEN}🚀 App: $(pgrep -f 'LyoAILearningAssistant' >/dev/null && echo 'Running' || echo 'Loading')${NC} | "
        echo -ne "$(date '+%H:%M:%S')"
        
        sleep 5
    done
}

# Cleanup function for graceful exit
cleanup_on_exit() {
    echo ""
    info "Cleaning up processes..."
    kill $METRO_PID 2>/dev/null || true
    kill $MONITOR_PID 2>/dev/null || true
    kill $BUILD_PID 2>/dev/null || true
    log "Cleanup completed"
    exit 0
}

# Set trap for graceful exit
trap cleanup_on_exit INT TERM

# Main execution
main() {
    log "🎯 Starting automated iOS app runner..."
    
    # Change to project directory
    cd "/Users/republicalatuya/Desktop/LyoFrontEndFinal"
    
    # Execute all phases
    cleanup_environment
    install_dependencies
    prebuild_project
    install_cocoapods
    start_metro
    build_and_run_ios
    verify_app
    start_continuous_monitoring
}

# Execute main function
main
