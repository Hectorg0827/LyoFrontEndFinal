// Performance-optimized Avatar component with React.memo and accessibility enhancements
import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, AccessibilityProps } from 'react-native';
import { useAvatar } from './AvatarContext';
import LyoAvatar from './LyoAvatar';
import { AvatarState } from '../../types/avatar';

interface AvatarProps extends AccessibilityProps {
  // Optional override props
  size?: number;
  showSubtitles?: boolean;
  className?: string;
}

/**
 * Optimized Avatar component with memoization and enhanced accessibility
 */
const Avatar: React.FC<AvatarProps> = memo(({
  size: propSize,
  showSubtitles = true,
  className,
  ...accessibilityProps
}) => {
  const {
    isVisible,
    avatarState,
    userPreferences,
    pulseAnimation,
    scaleAnimation,
    floatAnimation,
    currentSubtitle,
  } = useAvatar();

  // Early return for performance
  if (!isVisible) {
    return null;
  }

  // Memoized size calculation
  const avatarSize = useMemo(() => {
    if (propSize) return propSize;
    
    switch (userPreferences.avatarSize) {
      case 'small': {
        return 50;
      }
      case 'large': {
        return 100;
      }
      case 'medium':
      default: {
        return 70;
      }
    }
  }, [propSize, userPreferences.avatarSize]);

  // Memoized accessibility props
  const accessibilityConfig = useMemo((): AccessibilityProps => {
    const stateLabels: Record<AvatarState, string> = {
      idle: 'Avatar is idle and ready',
      listening: 'Avatar is listening to your voice',
      processing: 'Avatar is processing your request',
      speaking: 'Avatar is speaking a response',
      error: 'Avatar encountered an error',
      thinking: 'Avatar is thinking about your request',
    };

    const personalityTraits = {
      friendly: 'friendly',
      professional: 'professional',
      cheerful: 'cheerful',
      calm: 'calm',
    };

    const personalityDescription = personalityTraits[userPreferences.avatarPersonality] || 'helpful';

    return {
      accessible: true,
      accessibilityLabel: `Lyo Avatar - ${personalityDescription} assistant. ${stateLabels[avatarState]}`,
      accessibilityRole: 'image',
      accessibilityState: {
        busy: avatarState !== 'idle',
        disabled: false,
        expanded: currentSubtitle ? true : undefined,
      },
      accessibilityHint: avatarState === 'idle' 
        ? 'Tap to start interacting with your Lyo assistant'
        : undefined,
      accessibilityActions: [
        {
          name: 'activate',
          label: 'Interact with avatar',
        },
        ...(currentSubtitle ? [{
          name: 'longpress',
          label: 'View full subtitle text',
        }] : []),
      ],
      ...accessibilityProps,
    };
  }, [avatarState, userPreferences.avatarPersonality, currentSubtitle, accessibilityProps]);

  // Memoized subtitle configuration
  const subtitleConfig = useMemo(() => {
    if (!showSubtitles || !userPreferences.subtitlesEnabled || !currentSubtitle) {
      return null;
    }

    return {
      text: currentSubtitle,
      accessible: true,
      accessibilityRole: 'text' as const,
      accessibilityLabel: `Lyo says: ${currentSubtitle}`,
      accessibilityLiveRegion: 'polite' as const,
    };
  }, [showSubtitles, userPreferences.subtitlesEnabled, currentSubtitle]);

  return (
    <View style={styles.container} {...accessibilityConfig}>
      <LyoAvatar />

      {subtitleConfig && (
        <View style={styles.subtitleContainer}>
          <Text
            style={[
              styles.subtitle,
              userPreferences.accessibilityMode && styles.accessibilitySubtitle,
            ]}
            {...subtitleConfig}
          >
            {subtitleConfig.text}
          </Text>
        </View>
      )}
    </View>
  );
});

// Display name for debugging
Avatar.displayName = 'OptimizedAvatar';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitleContainer: {
    marginTop: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    maxWidth: '80%',
  },
  subtitle: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  accessibilitySubtitle: {
    fontSize: 18, // Larger text for accessibility
    fontWeight: 'bold',
  },
});

export default Avatar;
