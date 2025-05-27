# Lyo AI Learning Assistant

A React Native mobile application for an AI-powered learning assistant with personalized content, community features, and progress tracking.

## Table of Contents

- [Features](#features)
- [Setup and Installation](#setup-and-installation)
- [Running the App](#running-the-app)
- [Environment Configuration](#environment-configuration)
- [Project Structure](#project-structure)
- [State Management](#state-management)
- [Offline Support](#offline-support)
- [iOS Build Issues](#ios-build-issues)
- [Code Standards](#code-standards)
- [Contributing](#contributing)

## Features

- **Personalized Learning**: AI-powered recommendations based on user interests and learning style
- **Community Interaction**: Join learning groups, attend events, and connect with other learners
- **Progress Tracking**: Monitor your learning progress and achievements
- **AI Classroom**: Interactive learning with AI assistance
- **Offline Mode**: Use the app even without an internet connection

## Setup and Installation

### Prerequisites

- Node.js 16+
- Yarn or npm
- Expo CLI (`npm install -g expo-cli`)
- For iOS: Xcode 14+ and CocoaPods
- For Android: Android Studio and JDK 11+

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/lyo-app.git
cd lyo-app
```

2. Install dependencies:
```bash
yarn install
# or
npm install
```

3. Install native dependencies:
```bash
npx pod-install
```

## Running the App

### Development Mode with Expo

```bash
# Start the development server
yarn start
# or
npm start

# Run on iOS
yarn ios
# or
npm run ios

# Run on Android
yarn android
# or
npm run android
```

### Building for Production

#### Using EAS (Expo Application Services)

```bash
# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production
```

#### Local Builds

```bash
# Build for iOS
yarn build:ios
# or
npm run build:ios

# Build for Android
yarn build:android
# or
npm run build:android
```

## Environment Configuration

The app uses different environment configurations based on the build profile:

- **Development**: Uses mock data by default, suitable for local development
- **Staging**: Connects to staging backend API, for testing pre-release features
- **Production**: Uses production backend API, for released versions

### Environment Variables

Configuration is managed in `src/config/env.ts`. You can override settings in the `.env` file:

```
# .env example
EXPO_ENV=development
API_URL=http://localhost:8000/api/v1
USE_BACKEND_API=false
```

## Project Structure

```
/src
  /assets         # Images, fonts, and other static assets
  /components     # Reusable UI components
  /config         # App configuration and environment setup
  /navigation     # Navigation setup and routing
  /screens        # App screens/pages
  /services       # API services and data handling
  /store          # State management with Zustand
  /utils          # Utility functions and helpers
```

## State Management

The app uses Zustand for global state management with several specialized stores:

- **authStore**: Handles authentication state, login, registration, and session management
- **userStore**: Manages user profile data, notifications, and user preferences
- **learnStore**: Handles course data, enrollment status, and learning progress
- **appStore**: Controls app-wide settings and onboarding state

Example usage of Zustand stores:

```typescript
import { useAuthStore } from '../store/authStore';

const MyComponent = () => {
  // Use the store in your component
  const { isAuthenticated, login, logout } = useAuthStore();
  
  return (
    <Button 
      title={isAuthenticated ? "Logout" : "Login"}
      onPress={isAuthenticated ? logout : () => login(email, password)}
    />
  );
};
```

## Offline Support

The app provides robust offline support through several mechanisms:

1. **Automatic Caching**: API responses are cached for offline use with configurable expiry times
2. **Network Detection**: The app detects network status changes and adapts accordingly
3. **Mock Data Fallback**: When offline, the app switches to mock data automatically
4. **Offline Indicator**: A visual indicator appears when the app is operating offline
5. **Service Architecture**: All services have built-in offline-first capability

Example of the offline service pattern:

```typescript
// Try online API first
if (isConnected) {
  try {
    const data = await api.getData();
    await cacheService.set('cache_key', data);
    return data;
  } catch (error) {
    // Fall back to cache on failure
  }
}

// Use cached data when offline
const cachedData = await cacheService.get('cache_key');
if (cachedData) {
  return cachedData;
}

// Last resort: mock data
return mockData;
```

## iOS Build Issues

If you encounter issues building the iOS app, try the provided fix script:

```bash
# Make the script executable
chmod +x ios-build-fix.sh

# Run the script
./ios-build-fix.sh
```

Common issues this script fixes:
- React Native bundle script issues
- CocoaPods configuration problems
- Xcode project settings
- Missing permissions in Info.plist

## Code Standards

- **TypeScript**: Use proper typing for all components and functions
- **ESLint/Prettier**: Follow the project's linting rules
- **Components**: Create reusable components in the components directory
- **State Management**: Use Zustand for global state, React Query for data fetching
- **Testing**: Write tests for critical functionality

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.