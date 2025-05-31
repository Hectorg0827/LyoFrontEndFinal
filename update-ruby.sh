#!/bin/bash

echo "🔧 Ruby Update & CocoaPods Setup"
echo "================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')] $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo ""
print_status "Current Ruby setup:"
echo "Ruby version: $(ruby --version 2>/dev/null || echo 'Not found')"
echo "Gem version: $(gem --version 2>/dev/null || echo 'Not found')"
echo "CocoaPods: $(pod --version 2>/dev/null || echo 'Not installed')"

echo ""
print_status "Step 1: Update RVM to latest version..."
rvm get stable

echo ""
print_status "Step 2: Installing latest Ruby version..."
print_warning "This may take several minutes..."

# Install Ruby 3.3.6 (latest stable as of 2024)
rvm install 3.3.6

echo ""
print_status "Step 3: Setting Ruby 3.3.6 as default..."
rvm use 3.3.6 --default

echo ""
print_status "Step 4: Updating RubyGems..."
gem update --system

echo ""
print_status "Step 5: Installing/updating CocoaPods..."
gem install cocoapods

echo ""
print_status "Step 6: Setting up CocoaPods..."
pod setup

echo ""
print_status "Step 7: Verifying installation..."
echo "Ruby version: $(ruby --version)"
echo "Gem version: $(gem --version)"
echo "CocoaPods version: $(pod --version)"

echo ""
print_success "Ruby and CocoaPods update complete!"

echo ""
echo "📱 Next steps for iOS build:"
echo "1. Navigate to your project: cd /Users/republicalatuya/Desktop/LyoFrontEndFinal"
echo "2. Run: ./run-ios-device-final.sh"
echo "3. Or manually: cd ios && pod install && cd .. && npx expo run:ios --device"

echo ""
print_status "Reload shell to ensure changes take effect:"
echo "source ~/.zshrc"
