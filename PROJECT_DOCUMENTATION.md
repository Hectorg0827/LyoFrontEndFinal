# Lyo App - React Native Frontend

## Overview
This document outlines the architecture, features, and setup instructions for the Lyo mobile application. The application is built using React Native with TypeScript to ensure type safety and better development experience.

## Technology Stack
- **Frontend Framework:** React Native with Expo
- **Language:** TypeScript
- **State Management:** Zustand
- **Navigation:** React Navigation v6
- **UI Components:** Custom components with Animated, LinearGradient, and Expo components
- **API Integration:** Custom API client with React Query
- **Authentication:** Custom JWT authentication
- **Data Storage:** AsyncStorage
- **Animations:** React Native Reanimated
- **Lists:** FlashList for optimized rendering

## Project Structure
```
LyoFrontEndFinal/
├── App.tsx               # Application entry point
├── package.json          # Dependencies and scripts
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Feed/         # Feed-related components
│   │   └── Header/       # Header components
│   ├── navigation/       # Navigation configuration
│   ├── screens/          # Screen components
│   ├── services/         # API and middleware
│   └── store/            # State management with Zustand
```

## Features

### 1. Authentication

- Email/password login and registration
- Social authentication with Google, Apple, and Facebook
- Token-based authentication with secure storage
- Password reset functionality

### 2. Navigation

- Tab-based navigation with custom floating action button
- Stack navigation for modal screens and flows
- Deep linking support for direct navigation
- Custom animated transitions

### 3. Screens

#### Home Screen
- Story orbs for users' updates
- Feed list with engagement features (like, comment, save)
- Pull-to-refresh and infinite scrolling

#### Search Screen
- Topic discovery
- Search functionality with filters
- Trending topics and recommendations

#### Bookshelf Screen
- Saved content organized by tabs (posts, courses, events)
- Progress tracking for courses
- Recent activity

#### Community Screen
- Interactive map showing nearby events and communities
- Event details and RSVP functionality
- Community posts and interactions

#### Learn Screen
- Course catalog with filters
- Interactive learning tools
- Progress tracking
- Lesson completion

#### Profile Screen
- User achievements and stats
- Activity history
- Settings and preferences

#### Notifications Screen
- Activity updates
- New content notifications
- Interaction alerts

### 4. API Integration

- RESTful API client with token authentication
- React Query for data fetching and caching
- Middleware for API request/response processing
- Error handling and retry logic

### 5. State Management

- Zustand for global state
- Persistent storage for user data
- Dark mode support
- Authentication state

### 6. UI Components

- Modern, Instagram/TikTok-inspired design
- Custom animations and transitions
- Gradient effects and blur overlays
- Responsive layouts for different device sizes

## API Integration

The app communicates with the LyoBackendNew API for data. API service modules include:

- `api.ts` - Base API client
- `apiMiddleware.ts` - Token handling and request/response processing
- `feedService.ts` - Feed and stories data
- `learnService.ts` - Courses and learning tools
- `communityService.ts` - Events and communities
- `userService.ts` - User profiles, notifications, bookshelf

### API Endpoints

The mobile app connects to LyoBackendNew through RESTful APIs:

```typescript
API_URL = 'https://lyobackendnew.com/api'

Endpoints:
- Authentication:
  - POST /auth/login
  - POST /auth/register
  - POST /auth/logout

- User Management:
  - GET /user/profile
  - PUT /user/profile
  - GET /user/notifications
  - GET /user/bookshelf

- Feed:
  - GET /feed
  - GET /stories
  - POST /posts/{id}/like
  - POST /posts/{id}/save

- Learning:
  - GET /courses
  - GET /courses/{id}
  - POST /courses/{id}/enroll
  - GET /learning-tools

- Community:
  - GET /events
  - GET /communities
  - POST /events/{id}/attend
  - POST /communities/{id}/join
```

### Middleware Features

1. **Authentication Middleware**
   - Token storage and retrieval
   - Automatic token injection in requests
   - Handling of 401 errors with logout

2. **API Middleware**
   - Request/Response processing
   - Error handling and user-friendly messages
   - Response caching with React Query

## Setup Instructions

1. **Prerequisites**
   ```bash
   - Node.js >= 14
   - Expo CLI
   - iOS Simulator or real device (for iOS)
   - Android Emulator or real device (for Android)
   ```

2. **Installation**
   ```bash
   # Clone the repository
   git clone [repository-url]
   cd LyoFrontEndFinal

   # Install dependencies
   npm install
   ```

3. **Running the App**
   ```bash
   # Start Expo development server
   npm start

   # Run on iOS
   npm run ios

   # Run on Android
   npm run android
   ```

## Development Guidelines

1. **Code Style**
   - Follow TypeScript best practices
   - Use functional components with hooks
   - Implement proper error handling
   - Follow component organization patterns

2. **State Management**
   - Use Zustand for global state
   - Use React Query for server state
   - Use component local state when appropriate

3. **Performance Optimization**
   - Use React.memo and callback optimization
   - Implement FlashList for efficient list rendering
   - Use image optimization techniques
   - Implement proper caching strategies

## Key Components

### Navigation
The app uses a combination of Bottom Tabs and Stack navigators:
- `AppNavigator.tsx` - Main navigation container
- `MainNavigator` - Bottom tab navigation
- Custom animated tab bar with floating action button

### Authentication Flow
- JWT token-based authentication
- Secure token storage with AsyncStorage
- Automatic redirection based on auth state

### Data Fetching
- React Query for API calls and caching
- Custom hooks for data management
- Pagination support for feed and lists

## Pending Tasks

- Further backend integration testing
- Performance optimization
- Enhanced error handling
- Analytics implementation
- Push notification setup
- Unit and integration tests
- App Store and Play Store deployment preparation

## Design System

The app follows a modern, social-app inspired design with:
- Dark theme primary design with light theme support
- Gradient effects for visual appeal
- Custom animations for transitions and interactions
- BlurView components for depth and visual hierarchy

## Future Enhancements

1. **Offline Support**
   - Implement offline-first architecture
   - Background sync for pending operations

2. **Performance**
   - Native module integration for critical operations
   - Advanced caching strategies

3. **Features**
   - Video playback optimization
   - Advanced search functionality
   - Enhanced social features
