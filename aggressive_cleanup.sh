#!/bin/bash

# Aggressive cleanup for Lyo project
echo "Starting aggressive cleanup..."

# Remove all markdown files except README.md
find . -maxdepth 1 -name "*.md" ! -name "README.md" -exec rm -f {} \;

# Remove all backup files
find . -maxdepth 1 -name "*.backup*" -exec rm -f {} \;
find . -maxdepth 1 -name "*.original*" -exec rm -f {} \;
find . -maxdepth 1 -name "*.clean*" -exec rm -f {} \;
find . -maxdepth 1 -name "*.simple*" -exec rm -f {} \;

# Remove all log files
find . -maxdepth 1 -name "*.log" -exec rm -f {} \;

# Remove all shell scripts except those in scripts directory
find . -maxdepth 1 -name "*.sh" -exec rm -f {} \;

# Remove temporary directories
rm -rf archive/
rm -rf tmp_*/
rm -rf "Support/"
rm -rf Configuration/
rm -rf Files/
rm -rf Signing/

# Remove unnecessary files
rm -f env.node
rm -f typescript
rm -f eslint.config.js
rm -f babel.config.js.new
rm -f backend-package.json
rm -f server.js
rm -f simple-server.js
rm -f simple_backend.py
rm -f LyoFrontEndFinal.code-workspace

# Remove test files in root
find . -maxdepth 1 -name "test-*.js" -exec rm -f {} \;

echo "Cleanup completed!"
ls -la | wc -l
