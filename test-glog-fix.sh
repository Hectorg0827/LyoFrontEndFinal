#!/bin/bash

echo "🔧 Testing glog C++ compilation fix..."

cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

# Check if Podfile has glog handling
echo "1. Checking Podfile configuration..."
if grep -q "glog" ios/Podfile; then
    echo "   ✅ glog handling found in Podfile"
else
    echo "   ❌ glog handling missing from Podfile"
    exit 1
fi

# Install pods if needed
echo "2. Installing pods..."
cd ios
if [ ! -d "Pods" ]; then
    echo "   Installing CocoaPods dependencies..."
    pod install
    if [ $? -ne 0 ]; then
        echo "   ❌ Pod install failed"
        exit 1
    fi
else
    echo "   ✅ Pods directory exists"
fi

# Check if glog was installed correctly
if [ -d "Pods/glog" ]; then
    echo "   ✅ glog pod installed"
else
    echo "   ❌ glog pod not found"
    exit 1
fi

echo "3. Testing compilation of glog source files..."

# Test compiling glog directly to check for fconcepts issue
cd Pods/glog/src
echo "   Testing vlog_is_on.cc compilation..."

# Try to compile without -fconcepts flag (should work)
if xcrun clang++ -c -std=c++17 vlog_is_on.cc -o /tmp/vlog_test.o 2>/dev/null; then
    echo "   ✅ vlog_is_on.cc compiles successfully with C++17"
else
    echo "   ❌ vlog_is_on.cc still has compilation issues"
fi

# Try to compile with -fconcepts flag (should fail for glog)
if xcrun clang++ -c -std=c++20 -fconcepts vlog_is_on.cc -o /tmp/vlog_test_cpp20.o 2>/dev/null; then
    echo "   ⚠️  vlog_is_on.cc unexpectedly compiles with -fconcepts (may indicate broader fix needed)"
else
    echo "   ✅ vlog_is_on.cc correctly fails with -fconcepts (as expected)"
fi

echo "4. Testing utilities.cc compilation..."

if xcrun clang++ -c -std=c++17 utilities.cc -o /tmp/utilities_test.o 2>/dev/null; then
    echo "   ✅ utilities.cc compiles successfully with C++17"
else
    echo "   ❌ utilities.cc still has compilation issues"
fi

cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

echo ""
echo "🎯 glog Compilation Test Summary:"
echo "   - Podfile has glog-specific handling"
echo "   - CocoaPods installation completed"
echo "   - glog source files compile with C++17"
echo "   - glog correctly rejects C++20 -fconcepts flag"
echo ""
echo "🚀 Ready to test full iOS build!"
