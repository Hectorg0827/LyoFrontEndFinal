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

  // Memoized size calculation
  const avatarSize = useMemo(() => {
    if (propSize) return propSize;
    
    switch (userPreferences.avatarSize) {
      case 'small': return 50;
      case 'large': return 100;
      case 'medium':
      default: return 70;
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

  // Early return for invisible avatar
  if (!isVisible) {
    return null;
  }

  return (
    <View 
      style={[styles.container, className && { className }]} 
      {...accessibilityConfig}
    >
      <LyoAvatar
        size={avatarSize}
        color={userPreferences.avatarColor}
        pulseAnimation={pulseAnimation}
        scaleAnimation={scaleAnimation}
        floatAnimation={floatAnimation}
        state={avatarState}
        animationsEnabled={userPreferences.animationsEnabled}
        personality={userPreferences.avatarPersonality}
      />

      {subtitleConfig && (
        <View style={styles.subtitleContainer}>
          <Text
            style={[
              styles.subtitle,
              userPreferences.accessibilityMode && styles.accessibilitySubtitle,
              getPersonalityStyles(userPreferences.avatarPersonality),
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

// Helper function for personality-based styling
const getPersonalityStyles = (personality: string) => {
  switch (personality) {
    case 'professional':
      return styles.professionalSubtitle;
    case 'cheerful':
      return styles.cheerfulSubtitle;
    case 'calm':
      return styles.calmSubtitle;
    case 'friendly':
    default:
      return styles.friendlySubtitle;
  }
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120, // Ensure consistent layout
  },
  subtitleContainer: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    maxWidth: 280,
    minHeight: 36,
    justifyContent: 'center',
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: 'System',
  },
  accessibilitySubtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  // Personality-based subtitle styles
  friendlySubtitle: {
    fontFamily: 'System',
    fontWeight: '500',
  },
  professionalSubtitle: {
    fontFamily: 'System',
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  cheerfulSubtitle: {
    fontFamily: 'System',
    fontWeight: '600',
    color: '#FFE66D',
  },
  calmSubtitle: {
    fontFamily: 'System',
    fontWeight: '300',
    opacity: 0.9,
  },
});

Avatar.displayName = 'Avatar';

export default Avatar;
