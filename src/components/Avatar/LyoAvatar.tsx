/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-native/no-inline-styles */
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useEffect, useMemo } from "react";
import {
  StyleSheet,
  Animated,
  TouchableOpacity,
  PanResponder,
  Dimensions,
} from "react-native";

import { useAvatar } from "./AvatarContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const AVATAR_SIZE = 60;
const SAFE_AREA_PADDING = 8;

const LyoAvatar: React.FC = () => {
  const {
    isVisible,
    isChatOpen,
    openChat,
    position,
    setPosition,
    pulseAnimation,
    scaleAnimation,
    floatAnimation,
    startScaleAnimation,
    userPreferences,
    startVoiceRecognition,
  } = useAvatar();

  const pan = useMemo(() => new Animated.ValueXY(), []);

  useEffect(() => {
    if (position.x === 0 && position.y === 0) {
      const initialX = SCREEN_WIDTH - AVATAR_SIZE - 20;
      const initialY = SCREEN_HEIGHT - AVATAR_SIZE - 120;
      setPosition({ x: initialX, y: initialY });
      pan.setValue({ x: initialX, y: initialY });
    } else {
      pan.setValue(position);
    }
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
        startScaleAnimation(1.2, 200);
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_event, _gesture) => {
        pan.flattenOffset();

        const currentX = pan.x._value;
        const currentY = pan.y._value;

        const clampedX = Math.max(
          SAFE_AREA_PADDING,
          Math.min(currentX, SCREEN_WIDTH - AVATAR_SIZE - SAFE_AREA_PADDING),
        );
        const clampedY = Math.max(
          SAFE_AREA_PADDING,
          Math.min(currentY, SCREEN_HEIGHT - AVATAR_SIZE - 90),
        );

        Animated.spring(pan, {
          toValue: { x: clampedX, y: clampedY },
          useNativeDriver: false,
          friction: 5,
        }).start();

        setPosition({ x: clampedX, y: clampedY });
      },
    }),
  ).current;

  // Return null if the avatar is not visible
  if (!isVisible) {
    return null;
  }

  const animatedStyle = {
    transform: [
      { translateX: pan.x },
      { translateY: pan.y },
      { scale: scaleAnimation },
    ],
  };

  const translateY = floatAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -5, 0], // Float up and then back down
  });

  return (
    <Animated.View
      style={[
        styles.avatarContainer,
        animatedStyle,
        { transform: [...animatedStyle.transform, { translateY }] },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        onPress={() => {
          if (isChatOpen) {
            // closeChat(); // This was commented out, assuming intentional
          } else {
            openChat();
          }
        }}
        onLongPress={startVoiceRecognition} // Example: Long press to start voice recognition
        // onPressOut={stopVoiceRecognition} // Example: Release to stop voice recognition
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={
            userPreferences.avatarColor
              ? [userPreferences.avatarColor, userPreferences.avatarColor]
              : ["#4776E6", "#8E54E9"]
          }
          style={styles.gradientBackground}
        >
          <Animated.View
            style={[styles.pulse, { transform: [{ scale: pulseAnimation }] }]}
          />
          <Ionicons
            name="share-outline" // Changed from sparkles-outline
            size={AVATAR_SIZE * 0.6}
            color="white"
            style={styles.icon}
          />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    position: "absolute",
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gradientBackground: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden", // Ensures pulse doesn't exceed border
  },
  icon: {
    opacity: 0.9,
  },
  pulse: {
    position: "absolute",
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)", // Semi-transparent white for pulse
  },
  debugText: {
    color: "white",
    fontSize: 10,
    position: "absolute",
    bottom: -20,
    alignSelf: "center",
  },
  voiceIndicator: {
    position: "absolute",
    bottom: -25, // Position below the avatar
    alignSelf: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  voiceIndicatorText: {
    color: "white",
    fontSize: 12,
  },
  micIconContainer: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 15,
    padding: 5,
  },
  micIcon: {
    width: AVATAR_SIZE * 0.7, // Adjusted size
    height: AVATAR_SIZE * 0.7, // Adjusted size
    borderRadius: (AVATAR_SIZE * 0.7) / 2,
    backgroundColor: "#FF3366", // Example color for mic icon background
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LyoAvatar;
