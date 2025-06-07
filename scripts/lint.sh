#!/bin/bash

# Essential Lint Script for Lyo AI Learning Assistant
# Code quality and style checking

set -e

echo "🔍 Linting - Lyo AI Learning Assistant"
echo "====================================="

PROJECT_ROOT=$(pwd | sed 's|/scripts||')
cd "$PROJECT_ROOT"

# Check if ESLint is configured
check_eslint() {
    if [ ! -f ".eslintrc.js" ] || [ ! -s ".eslintrc.js" ]; then
        echo "⚠️  ESLint configuration missing or empty"
        echo "🔧 Creating basic ESLint configuration..."
        
        cat > .eslintrc.js << 'EOF'
module.exports = {
  extends: ['expo', '@react-native-community'],
  rules: {
    'react-native/no-unused-styles': 'warn',
    'react-native/split-platform-components': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    'react/react-in-jsx-scope': 'off',
  },
  env: {
    node: true,
  },
};
EOF
        echo "✅ ESLint configuration created"
    fi
}

# Install ESLint dependencies if needed
install_eslint_deps() {
    if ! npm list eslint >/dev/null 2>&1; then
        echo "📦 Installing ESLint dependencies..."
        npm install --save-dev eslint @react-native-community/eslint-config
    fi
}

# Run TypeScript check
run_typescript_check() {
    echo "📝 Running TypeScript check..."
    if command -v npx &> /dev/null; then
        npx tsc --noEmit
        if [ $? -eq 0 ]; then
            echo "✅ TypeScript check passed"
        else
            echo "❌ TypeScript check failed"
            exit 1
        fi
    else
        echo "⚠️  TypeScript compiler not available"
    fi
}

# Run ESLint
run_eslint() {
    echo "🔍 Running ESLint..."
    npx eslint . --ext .ts,.tsx,.js,.jsx --max-warnings 0
    
    if [ $? -eq 0 ]; then
        echo "✅ ESLint check passed"
    else
        echo "❌ ESLint check failed"
        exit 1
    fi
}

# Main execution
main() {
    check_eslint
    install_eslint_deps
    run_typescript_check
    run_eslint
    
    echo ""
    echo "🎉 All lint checks passed!"
}

main
