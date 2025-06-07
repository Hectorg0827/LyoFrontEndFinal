#!/bin/bash

echo "🧹 Starting comprehensive project cleanup..."

# Define essential files and directories to keep
KEEP_FILES=(
    ".env"
    ".env.development" 
    ".env.example"
    ".env.production"
    ".eslintignore"
    ".eslintrc.js"
    ".gitattributes"
    ".gitignore"
    "app.json"
    "babel.config.js"
    "eas.json"
    "env.d.ts"
    "index.js"
    "jest.config.js"
    "metro.config.js"
    "package.json"
    "package-lock.json"
    "README.md"
    "tsconfig.json"
    "yarn.lock"
    "Gemfile"
    "Gemfile.lock"
)

KEEP_DIRS=(
    ".expo"
    ".git"
    ".idea"
    ".vscode"
    "__tests__"
    "android"
    "assets"
    "ios"
    "node_modules"
    "patches"
    "src"
    "scripts"
)

# Create backup of essential files
echo "📦 Creating backup of essential files..."
mkdir -p /tmp/lyo_backup
for file in "${KEEP_FILES[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "/tmp/lyo_backup/"
    fi
done

for dir in "${KEEP_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        cp -r "$dir" "/tmp/lyo_backup/"
    fi
done

# Remove everything except hidden files and directories starting with .
echo "🗑️ Removing all non-essential files..."
find . -maxdepth 1 -not -name ".*" -not -name "final_project_cleanup.sh" -exec rm -rf {} + 2>/dev/null

# Restore essential files
echo "📂 Restoring essential files..."
cp -r /tmp/lyo_backup/* .

# Clean up backup
rm -rf /tmp/lyo_backup

# Clean scripts directory
echo "🔧 Organizing scripts directory..."
if [ -d "scripts" ]; then
    cd scripts
    # Keep only essential build scripts
    find . -type f -not -name "build-ios.sh" -not -name "build-android.sh" -not -name "start-metro.sh" -not -name "lint.sh" -delete
    cd ..
fi

# Clean up any remaining unwanted files
echo "🧼 Final cleanup..."
rm -f *.log *.backup* *.new *.rb *.py
rm -f env.node typescript npx-calls.log prebuild-output.log
rm -f backend-package.json eslint.config.js
rm -f server.js simple-*.* test-*.*

echo "✅ Project cleanup completed!"
echo "📁 Final project structure:"
ls -la
