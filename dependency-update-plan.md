# Dependency Update Plan

## Current State
- Expo SDK: 49.0.0 → Target: 53.0.9 (latest stable)
- React Native: 0.72.10 → Target: 0.79.x (compatible with Expo SDK 53)
- React: 18.2.0 → Target: 18.3.1 (latest stable)

## Major Updates Planned

### Core Framework
1. **expo**: 49.0.0 → 53.0.9
2. **react-native**: 0.72.10 → 0.79.2
3. **react**: 18.2.0 → 18.3.1

### Expo SDK Packages (Auto-update with npx expo install)
- All expo-* packages will be updated to their SDK 53 compatible versions

### React Navigation
- All @react-navigation packages to latest compatible versions

### Development Dependencies
- TypeScript to latest stable
- ESLint and related packages to latest
- Testing packages to latest compatible versions

## Implementation Steps
1. Update package.json with new core versions
2. Run npm install
3. Use npx expo install --fix to update all Expo SDK packages
4. Update remaining dependencies to latest compatible versions
5. Test build process
6. Fix any breaking changes

## iOS Deployment Target
- Expo SDK 53 supports iOS 15.1+ minimum
- This should resolve our iOS 14.0 deployment target issues
