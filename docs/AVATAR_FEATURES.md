# Avatar Customization & Accessibility Features

## Overview
The Lyo avatar is a central feature of the application, providing an interactive and responsive assistant. It has been designed with robust customization options and accessibility features to ensure a personalized and inclusive user experience.

## Avatar States
The avatar can display the following states, each with distinctive animations:

- **idle**: Default state with gentle floating animation
- **listening**: When the avatar is actively listening to user input
- **processing**: When the avatar is processing user input
- **speaking**: When the avatar is speaking/responding to user
- **error**: When an error occurs during interaction
- **thinking**: When the avatar is generating a response

## User Preferences
Users can customize the following aspects of the avatar:

### Visual Preferences
- **avatarColor**: Customize the color of the avatar (#HEX format)
- **avatarSize**: Choose from 'small', 'medium', or 'large' 
- **avatarPersonality**: Select personality type ('friendly', 'professional', 'cheerful', or 'calm')
- **animationsEnabled**: Toggle animations on/off

### Voice Preferences
- **voiceEnabled**: Toggle voice recognition and speech on/off
- **voiceRate**: Adjust speaking rate (0.5-2.0)
- **voicePitch**: Adjust voice pitch (0.5-2.0)

### Learning Preferences
- **learningInterests**: Array of topics the user is interested in
- **courseHistory**: Array of previously taken courses

### Accessibility Features
- **accessibilityMode**: Enhanced accessibility features (larger text, simplified animations)
- **subtitlesEnabled**: Display speech as text captions
- **autoHideAvatar**: Automatically hide the avatar after period of inactivity

## Implementation Details

### AvatarContext
The `AvatarContext` component serves as the central state manager for the avatar, handling:
- Animation state management
- Voice recognition
- Text-to-speech functionality
- User preference management
- Accessibility adaptations

### Avatar Component
The `Avatar` component renders the visual representation of the assistant with:
- Dynamic sizing based on user preferences
- Proper accessibility attributes (ARIA)
- Subtitle display when enabled
- Adaptive animations

### Error Handling
Avatar interactions include robust error handling for:
- Voice recognition failures
- Text-to-speech errors
- Preference validation issues
- Storage problems

## Best Practices for Developers
When working with the Avatar components, please follow these guidelines:

1. **Always check accessibility**: Ensure UI changes maintain accessibility support
2. **Respect user preferences**: All avatar behavior should respect user's saved preferences
3. **Error recovery**: Implement graceful fallbacks for any interaction error
4. **Animation performance**: Keep animations performant, especially for low-end devices
5. **Voice handling**: Always provide visual feedback along with voice interactions

## How to Extend
To add new avatar features:

1. Add new preference types to the `UserPreferences` interface in `AvatarContext.tsx`
2. Update default values in both context creation and provider implementation
3. Add appropriate validation in `validateUserPreferences` function
4. Implement UI controls in `AvatarSettingsScreen.tsx`
5. Update this documentation to reflect new capabilities
