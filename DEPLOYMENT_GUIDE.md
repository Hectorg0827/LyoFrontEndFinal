# Lyo Mobile App Deployment Guide

## Current Status ✅
- ✅ Backend FastAPI server running on port 8000
- ✅ Frontend Expo React Native app configured
- ✅ Backend-Frontend connection established and tested
- ✅ Environment variables configured for production
- ✅ EAS Build configuration ready

## Production Environment Setup

### 1. Backend Production Deployment
Your backend needs to be deployed to a cloud service for mobile access:

**Option A: Railway/Render/Heroku**
```bash
# Deploy your FastAPI backend to a cloud service
# Update the production API URL in the frontend
```

**Option B: Self-hosted with ngrok (for testing)**
```bash
# In your backend directory
ngrok http 8000
# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

### 2. Update Frontend for Production

Update `/Users/republicalatuya/Desktop/LyoFrontEndFinal/src/config/env.ts`:

```typescript
// Production environment
const PROD_ENV: Environment = {
  API_URL: "https://your-production-backend.com/api/v1", // Replace with your backend URL
  API_TIMEOUT: 30000,
  ENVIRONMENT: "production",
  STORAGE_PREFIX: "lyo_",
  USE_BACKEND_API: true,
  ENABLE_TELEMETRY: true,
  AUTH_STORAGE_KEY: "lyo_auth_token",
  DEBUG_MODE: false,
};
```

## Mobile App Build Process

### Prerequisites
1. **Expo Account**: Sign up at https://expo.dev
2. **EAS CLI**: Already installed ✅
3. **Login to EAS**:
   ```bash
   cd /Users/republicalatuya/Desktop/LyoFrontEndFinal
   eas login
   ```

### Build Commands

**1. Development Build (for testing)**
```bash
cd /Users/republicalatuya/Desktop/LyoFrontEndFinal
eas build --platform android --profile development
```

**2. Preview Build (for internal testing)**
```bash
cd /Users/republicalatuya/Desktop/LyoFrontEndFinal
eas build --platform android --profile preview
eas build --platform ios --profile preview
```

**3. Production Build (for app stores)**
```bash
cd /Users/republicalatuya/Desktop/LyoFrontEndFinal
export EXPO_ENV=production
eas build --platform android --profile production
eas build --platform ios --profile production
```

### Build Options

**Android APK (for direct installation)**
- Add to `eas.json`:
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

**iOS Simulator Build**
- Add to `eas.json`:
```json
{
  "build": {
    "preview": {
      "ios": {
        "simulator": true
      }
    }
  }
}
```

## Deployment Steps

### Step 1: Prepare Backend
1. Deploy your FastAPI backend to a cloud service
2. Get the production URL (e.g., `https://your-app.railway.app`)
3. Update CORS settings to allow your domain

### Step 2: Update Frontend Configuration
1. Update `src/config/env.ts` with production backend URL
2. Set `EXPO_ENV=production` for production builds
3. Test the connection

### Step 3: Build Mobile Apps
1. Login to EAS: `eas login`
2. Build Android: `eas build --platform android --profile preview`
3. Build iOS: `eas build --platform ios --profile preview`
4. Download builds from EAS dashboard

### Step 4: Testing
1. Install APK on Android device
2. Install IPA using TestFlight (iOS)
3. Test all features with production backend

### Step 5: App Store Submission
1. Build with production profile
2. Submit to Google Play Store (Android)
3. Submit to Apple App Store (iOS)

## Quick Start Commands

**Login and build Android APK:**
```bash
cd /Users/republicalatuya/Desktop/LyoFrontEndFinal
eas login
eas build --platform android --profile preview
```

**Build both platforms:**
```bash
cd /Users/republicalatuya/Desktop/LyoFrontEndFinal
eas build --platform all --profile preview
```

## Troubleshooting

### Common Issues:
1. **"Not logged in"**: Run `eas login`
2. **"Project not configured"**: Run `eas build:configure`
3. **Backend connection failed**: Update API_URL in env.ts
4. **Build failed**: Check build logs in EAS dashboard

### Build Status:
- Check builds: `eas build:list`
- View specific build: `eas build:view <build-id>`
- Download builds: Available in EAS dashboard

## Next Steps
1. Deploy backend to production
2. Update frontend API URLs
3. Run `eas login` and start building
4. Test builds on physical devices
5. Submit to app stores

The foundation is ready - you just need to deploy the backend and run the build commands!
