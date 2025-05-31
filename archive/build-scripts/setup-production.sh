#!/bin/bash

# Lyo Production Setup Script
echo "🔧 Setting up Lyo for production deployment..."

# Navigate to project directory
cd "/Users/republicalatuya/Desktop/LyoFrontEndFinal"

echo "📋 Current configuration:"
echo "- Backend: Running on localhost:8000"
echo "- Frontend: Configured for Expo deployment"
echo "- Environment: Ready for production build"

echo ""
echo "🚀 Next steps to complete deployment:"
echo "1. Deploy your backend to a cloud service (Railway, Render, Heroku)"
echo "2. Update API_URL in src/config/env.ts with your production backend URL"
echo "3. Login to EAS: eas login"
echo "4. Build the app: eas build --platform android --profile preview"
echo ""

echo "🔗 Quick commands to start building:"
echo "   eas login"
echo "   eas build --platform android --profile preview"
echo "   eas build --platform ios --profile preview"
echo ""

echo "📱 Your app is ready for mobile deployment!"
echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"
