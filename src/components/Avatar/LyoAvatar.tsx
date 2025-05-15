import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  PanResponder,
  Dimensions,
  Platform,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAvatar } from './AvatarContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const AVATAR_SIZE = 60;
const SAFE_AREA_PADDING = 8;

const LyoAvatar: React.FC = () => {
  const {
    isVisible,
    toggleAvatar,
    isChatOpen,
    openChat,
    avatarState,
    setAvatarState,
    position,
    setPosition,
    pulseAnimation,
    scaleAnimation,
    floatAnimation,
    startScaleAnimation,
    userPreferences,
    startVoiceRecognition,
    stopVoiceRecognition,
    isListening,
  } = useAvatar();

  const pan = useRef(new Animated.ValueXY()).current;

  // Set initial position in bottom right if not already set
  useEffect(() => {
    if (position.x === 0 && position.y === 0) {
      const initialX = SCREEN_WIDTH - AVATAR_SIZE - 20;
      const initialY = SCREEN_HEIGHT - AVATAR_SIZE - 120; // Above the tab bar
      setPosition({ x: initialX, y: initialY });
      pan.setValue({ x: initialX, y: initialY });
    } else {
      pan.setValue(position);
    }
  }, []);

  // Configure the pan responder for drag gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
        startScaleAnimation();
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gesture) => {
        pan.flattenOffset();

        // Keep avatar within screen bounds
        let newX = pan.x._value;
        let newY = pan.y._value;

        // Enforce horizontal bounds
        if (newX < SAFE_AREA_PADDING) {
          newX = SAFE_AREA_PADDING;
        } else if (newX > SCREEN_WIDTH - AVATAR_SIZE - SAFE_AREA_PADDING) {
          newX = SCREEN_WIDTH - AVATAR_SIZE - SAFE_AREA_PADDING;
        }

        // Enforce vertical bounds, accounting for tab bar
        if (newY < SAFE_AREA_PADDING) {
          newY = SAFE_AREA_PADDING;
        } else if (newY > SCREEN_HEIGHT - AVATAR_SIZE - 90) {
          newY = SCREEN_HEIGHT - AVATAR_SIZE - 90;
        }

        // Animate to valid position if needed
        Animated.spring(pan, {
          toValue: { x: newX, y: newY },
          useNativeDriver: false,
          friction: 5,
        }).start();

        // Update position in context
        setPosition({ x: newX, y: newY });
      },
    })
  ).current;

  // Return null if the avatar is not visible
  if (!isVisible) {
    return null;
  }

  // Combining animations
  const translateY = floatAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10], // Float up and down 10 pixels
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { translateY },
            { scale: Animated.multiply(pulseAnimation, scaleAnimation) },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          if (!isChatOpen) {
            openChat();
            // Start voice recognition if enabled
            if (userPreferences.voiceEnabled) {
              startVoiceRecognition();
            } else {
              setAvatarState('listening');
            }
          }
        }}
        onLongPress={() => {
          // Only activate voice on long press if not already in chat
          if (!isChatOpen && userPreferences.voiceEnabled) {
            startVoiceRecognition();
          }
        }}
      >
        <LinearGradient
          colors={
            avatarState === 'idle' 
              ? [userPreferences.avatarColor, '#8E54E9'] 
              : avatarState === 'listening'
              ? ['#00C9FF', '#92FE9D']
              : avatarState === 'processing'
              ? ['#FF8008', '#FFC837']
              : ['#00C9FF', '#92FE9D']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.iconContainer}>
            {avatarState === 'idle' && (
              <Ionicons name="help-circle-outline" size={32} color="#fff" />
            )}
            {avatarState === 'listening' && (
              <Animated.View
                style={{
                  transform: [{ scale: Animated.multiply(pulseAnimation, 1) }],
                }}
              >
                <Ionicons name="mic" size={32} color="#fff" />
              </Animated.View>
            )}
            {avatarState === 'processing' && (
              <Animated.View
                style={{
                  transform: [{ rotate: floatAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }) }],
                }}
              >
                <Ionicons name="hourglass-outline" size={32} color="#fff" />
              </Animated.View>
            )}
            {avatarState === 'speaking' && (
              <Animated.View
                style={{
                  transform: [{ scale: pulseAnimation }],
                }}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={32} color="#fff" />
              </Animated.View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gradient: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4776E6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 8,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: AVATAR_SIZE * 0.7,
    height: AVATAR_SIZE * 0.7,
  },
});

export default LyoAvatar;
