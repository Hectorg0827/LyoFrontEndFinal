#!/bin/bash

echo "Testing glog compilation with C++17..."

cd /Users/republicalatuya/Desktop/LyoFrontEndFinal/ios

# Test compiling a simple C++ file that includes glog
cat > test_glog.cpp << 'EOF'
#include <glog/logging.h>
int main() {
    google::InitGoogleLogging("test");
    LOG(INFO) << "Test successful";
    return 0;
}
EOF

# Try to compile with the flags that would be used
echo "Compiling test file..."
clang++ -std=c++17 -I./Pods/glog/src -L./Pods/glog -o test_glog test_glog.cpp 2>&1

if [ $? -eq 0 ]; then
    echo "✅ glog compilation successful with C++17"
    rm -f test_glog test_glog.cpp
    exit 0
else
    echo "❌ glog compilation failed"
    rm -f test_glog test_glog.cpp
    exit 1
fi
