#!/bin/bash

echo "🧹 Cleaning up build artifacts and unnecessary files..."

# Remove all unnecessary build scripts and patches (keeping only essential ones)
find . -maxdepth 1 -name "*.sh" | grep -E "(build|fix|test|complete|final|deploy|clean|launch|run|check|verify|apply|link|master|comprehensive|simple|multi|strategy|status|monitor|start|bundle|folly|metro|glog|cpp|ios|android|device|xcode|swift|target|header|missing|duplicate|output|appdelegate|sdk|rct|modulemap|react|ruby)" | head -50 | while read file; do
    echo "🗑️  Removing: $file"
    rm -f "$file"
done

# Remove backup files
echo "🗑️  Removing backup files..."
find . -maxdepth 1 -name "*.backup*" -o -name "*.clean" -o -name "*.fixed" -o -name "*.manual" -o -name "*.minimal" -o -name "*.new" -o -name "*.properties.json" -o -name "*.rn-only" -o -name "*.strategic" -o -name "*.test*" -o -name "*_deployment_fixed" -o -name "*_fixed_clean" | while read file; do
    echo "🗑️  Removing: $file"
    rm -f "$file"
done

# Remove build logs
echo "🗑️  Removing build logs..."
rm -f *.log build-monitor.log

# Remove duplicate build directories
echo "🗑️  Removing duplicate build directories..."
rm -rf "ios/Pods 2" "ios/build 2"

# Remove markdown documentation files (keeping only essential ones)
echo "🗑️  Removing excessive documentation..."
find . -maxdepth 1 -name "*.md" | grep -E "(BUILD|DEPLOYMENT|COMPREHENSIVE|COMPLETE|FINAL|GUIDE|STATUS|REPORT|RESOLUTION|FIXES|TEST)" | while read file; do
    echo "🗑️  Removing: $file"
    rm -f "$file"
done

# Remove test C++ files
rm -f ios/cpp20_test.cpp

echo "✅ Cleanup complete!"
echo "📁 Remaining essential files:"
ls -la | grep -E "\.(sh|md)$" | head -20
