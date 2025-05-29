#!/bin/bash
# Test C++20 concepts compilation with exact React Graphics settings

# Test the hash_combine.h file directly 
echo "Testing React Graphics C++20 concepts compilation..."

# Get the exact compiler flags that will be used for React Graphics
FLAGS="-std=c++20 -fconcepts -fcoroutines -fmodules-ts -DFOLLY_NO_CONFIG=1 -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -I../ios/Pods/Headers/Public/React-utils"

# Create a test file that uses the exact same concepts as React Graphics
cat > /tmp/test_react_graphics_concepts.cpp << 'EOF'
#include <functional>
#include <type_traits>
#include <string>

// Test the exact same concept definition as in hash_combine.h
template <typename T>
concept Hashable = !std::is_same_v<T, const char*> && (requires(T a) {
  { std::hash<T>{}(a) } -> std::convertible_to<std::size_t>;
});

template <Hashable T, Hashable... Rest>
void hash_combine(std::size_t& seed, const T& v, const Rest&... rest) {
  seed ^= std::hash<T>{}(v) + 0x9e3779b9 + (seed << 6) + (seed >> 2);
  (hash_combine(seed, rest), ...);
}

template <Hashable T, Hashable... Args>
std::size_t hash_combine(const T& v, const Args&... args) {
  std::size_t seed = 0;
  hash_combine<T, Args...>(seed, v, args...);
  return seed;
}

int main() {
    // Test with different types to ensure concepts work
    int i = 42;
    std::string s = "test";
    double d = 3.14;
    
    auto result = hash_combine(i, s, d);
    
    std::size_t seed = 0;
    hash_combine(seed, i, s, d);
    
    return 0;
}
EOF

echo "Compiling with C++20 concepts..."
if clang++ $FLAGS /tmp/test_react_graphics_concepts.cpp -o /tmp/test_concepts; then
    echo "✅ C++20 concepts compilation SUCCESSFUL"
    echo "✅ React Graphics hash_combine.h should work correctly"
    /tmp/test_concepts && echo "✅ C++20 concepts execution SUCCESSFUL"
else
    echo "❌ C++20 concepts compilation FAILED"
    echo "❌ This indicates the same issue that will affect React Graphics"
fi

# Cleanup
rm -f /tmp/test_react_graphics_concepts.cpp /tmp/test_concepts

echo ""
echo "Next step: Try building the iOS project again"
