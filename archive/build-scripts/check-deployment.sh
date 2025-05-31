#!/bin/bash

echo "🔍 Lyo Deployment Readiness Check"
echo "=================================="
echo ""

# Check backend
echo "🖥️  Backend Status:"
if curl -s http://localhost:8000/api/v1/health >/dev/null 2>&1; then
    echo "   ✅ Backend running on port 8000"
    echo "   📡 API responding: $(curl -s http://localhost:8000/api/v1/health | head -c 50)..."
else
    echo "   ❌ Backend not running on port 8000"
    echo "   💡 Start with: cd /Users/republicalatuya/Desktop/LyoBackendNew/LyoBackEndNew && uvicorn main_minimal:app --host 0.0.0.0 --port 8000"
fi
echo ""

# Check frontend directory
echo "📱 Frontend Status:"
if [[ -f "package.json" ]] && [[ -f "app.json" ]] && [[ -f "eas.json" ]]; then
    echo "   ✅ Frontend directory configured"
    echo "   ✅ EAS configuration present"
    echo "   ✅ Package.json found"
else
    echo "   ❌ Missing configuration files"
    echo "   💡 Make sure you're in: /Users/republicalatuya/Desktop/LyoFrontEndFinal"
fi
echo ""

# Check EAS CLI
echo "🛠️  EAS CLI Status:"
if command -v eas >/dev/null 2>&1; then
    echo "   ✅ EAS CLI installed: $(eas --version)"
    
    # Check login status (with timeout simulation)
    if eas whoami >/dev/null 2>&1; then
        echo "   ✅ Logged in as: $(eas whoami)"
        echo "   🚀 Ready to build!"
    else
        echo "   ❌ Not logged in to EAS"
        echo "   💡 Run: eas login"
    fi
else
    echo "   ❌ EAS CLI not installed"
    echo "   💡 Install with: npm install -g eas-cli"
fi
echo ""

# Environment check
echo "🌍 Environment Configuration:"
if [[ -f ".env" ]]; then
    echo "   ✅ .env file present"
    echo "   📋 API URL: $(grep API_URL .env | head -1)"
    echo "   📋 Environment: $(grep ENVIRONMENT .env | head -1)"
else
    echo "   ❌ .env file missing"
fi
echo ""

echo "📋 SUMMARY:"
echo "==========="
if curl -s http://localhost:8000/api/v1/health >/dev/null 2>&1 && [[ -f "eas.json" ]] && command -v eas >/dev/null 2>&1; then
    echo "🟢 READY TO BUILD!"
    echo ""
    echo "Next steps:"
    echo "1. eas login (if not logged in)"
    echo "2. eas build --platform android --profile preview"
    echo "3. eas build --platform ios --profile preview"
else
    echo "🟡 SETUP REQUIRED"
    echo "Please complete the missing items above"
fi
echo ""
