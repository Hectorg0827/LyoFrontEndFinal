#!/bin/bash

echo "🔍 PROJECT STATUS CHECK"
echo "======================="

# Check essential files
echo "📂 Essential Files:"
echo "  package.json: $(test -f package.json && echo "✅ Present" || echo "❌ Missing")"
echo "  src/App.tsx: $(test -f src/App.tsx && echo "✅ Present" || echo "❌ Missing")"
echo "  index.js: $(test -f index.js && echo "✅ Present" || echo "❌ Missing")"
echo "  app.json: $(test -f app.json && echo "✅ Present" || echo "❌ Missing")"

# Check directories
echo ""
echo "📁 Essential Directories:"
echo "  src/: $(test -d src && echo "✅ Present" || echo "❌ Missing")"
echo "  ios/: $(test -d ios && echo "✅ Present" || echo "❌ Missing")"
echo "  android/: $(test -d android && echo "✅ Present" || echo "❌ Missing")"
echo "  node_modules/: $(test -d node_modules && echo "✅ Present" || echo "❌ Missing")"
echo "  scripts/: $(test -d scripts && echo "✅ Present" || echo "❌ Missing")"

# Check scripts
echo ""
echo "🔧 Build Scripts:"
echo "  build-ios.sh: $(test -f scripts/build-ios.sh && echo "✅ Present" || echo "❌ Missing")"
echo "  build-android.sh: $(test -f scripts/build-android.sh && echo "✅ Present" || echo "❌ Missing")"
echo "  start-metro.sh: $(test -f scripts/start-metro.sh && echo "✅ Present" || echo "❌ Missing")"
echo "  lint.sh: $(test -f scripts/lint.sh && echo "✅ Present" || echo "❌ Missing")"

# Check package.json content
echo ""
echo "📦 Package.json Scripts:"
if [ -f package.json ]; then
    echo "  Available scripts:"
    grep -A 10 '"scripts"' package.json | grep '"' | sed 's/^[ \t]*/    /'
else
    echo "  ❌ package.json not found"
fi

# Check for patches
echo ""
echo "🩹 Patches:"
if [ -d patches ]; then
    echo "  Patches directory: ✅ Present"
    echo "  Patch files:"
    ls -1 patches/ | sed 's/^/    /'
else
    echo "  patches/: ❌ Missing"
fi

echo ""
echo "========================"
echo "🎯 STATUS CHECK COMPLETE"
