import React from "react";
import { View, Text, StyleSheet, AccessibilityProps } from "react-native";

import { useAvatar } from "./AvatarContext";
import LyoAvatar from "./LyoAvatar";

interface AvatarProps extends AccessibilityProps {
  // Add custom props here if needed
}

/**
 * Avatar component that displays the LyoAvatar and handles accessibility features
 * like subtitles and proper ARIA properties.
 */
const Avatar: React.FC<AvatarProps> = (props) => {
  const {
    isVisible,
    avatarState,
    userPreferences,
    pulseAnimation,
    scaleAnimation,
    floatAnimation,
    currentSubtitle,
  } = useAvatar();

  if (!isVisible) {
    return null;
  }

  // Determine size based on user preferences
  const getAvatarSize = () => {
    switch (userPreferences.avatarSize) {
      case "small":
        return 50;
      case "large":
        return 100;
      case "medium":
      default:
        return 70;
    }
  };

  // Calculate accessibility props based on current state and preferences
  const getAccessibilityProps = (): AccessibilityProps => {
    const stateLabels = {
      idle: "Avatar is idle",
      listening: "Avatar is listening",
      processing: "Avatar is processing",
      speaking: "Avatar is speaking",
      error: "Avatar encountered an error",
      thinking: "Avatar is thinking",
    };

    return {
      accessible: true,
      accessibilityLabel: `Lyo Avatar. Current state: ${stateLabels[avatarState]}`,
      accessibilityRole: "image",
      accessibilityState: {
        busy: avatarState !== "idle",
        disabled: false,
      },
      accessibilityHint: "Tap to interact with your Lyo assistant",
    };
  };

  return (
    <View style={styles.container} {...getAccessibilityProps()} {...props}>
      <LyoAvatar
        size={getAvatarSize()}
        color={userPreferences.avatarColor}
        pulseAnimation={pulseAnimation}
        scaleAnimation={scaleAnimation}
        floatAnimation={floatAnimation}
        state={avatarState}
      />

      {userPreferences.subtitlesEnabled && currentSubtitle ? (
        <View style={styles.subtitleContainer}>
          <Text
            style={[
              styles.subtitle,
              userPreferences.accessibilityMode && styles.accessibilitySubtitle,
            ]}
            accessible
            accessibilityRole="text"
            accessibilityLabel={`Lyo says: ${currentSubtitle}`}
          >
            {currentSubtitle}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  subtitleContainer: {
    marginTop: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    maxWidth: "80%",
  },
  subtitle: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
  },
  accessibilitySubtitle: {
    fontSize: 18, // Larger text for accessibility
    fontWeight: "bold",
  },
});

export default Avatar;
