import React, { useMemo, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Text,
  AccessibilityInfo,
  Platform,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEnhancedAvatar } from './EnhancedAvatarContext';
import { AvatarPerformanceMonitor } from '../../utils/performanceMonitor';

// Mock character animations - in a real app these would be proper Lottie files
const avatarAnimations = {
  idle: require('../../assets/animations/avatar_idle.json'),
  speaking: require('../../assets/animations/avatar_speaking.json'),
  listening: require('../../assets/animations/avatar_listening.json'),
  thinking: require('../../assets/animations/avatar_thinking.json'),
  happy: require('../../assets/animations/avatar_happy.json'),
  surprised: require('../../assets/animations/avatar_surprised.json'),
  confused: require('../../assets/animations/avatar_confused.json'),
  sad: require('../../assets/animations/avatar_sad.json'),
};

// Viseme animations - for lip sync
const visemeAnimations = {
  viseme_sil: require('../../assets/animations/viseme_sil.json'),
  viseme_AA: require('../../assets/animations/viseme_aa.json'),
  viseme_E: require('../../assets/animations/viseme_e.json'),
  viseme_I: require('../../assets/animations/viseme_i.json'),
  viseme_O: require('../../assets/animations/viseme_o.json'),
  viseme_U: require('../../assets/animations/viseme_u.json'),
  viseme_F: require('../../assets/animations/viseme_f.json'),
  viseme_V: require('../../assets/animations/viseme_v.json'),
  // Add more viseme animations as needed
};

interface EnhancedAvatarProps {
  size?: number;
  onPress?: () => void;
  showPerformanceMetrics?: boolean;
}

const EnhancedAvatar: React.FC<EnhancedAvatarProps> = ({ 
  size = 200, 
  onPress,
  showPerformanceMetrics = false
}) => {
  const { 
    avatarState, 
    isVisible,
    currentEmotion,
    pulseAnimation,
    scaleAnimation,
    floatAnimation,
    userPreferences,
    currentSubtitle,
    voiceStatus,
    getPerformanceReport
  } = useEnhancedAvatar();

  const animationRef = useRef<LottieView>(null);
  const visemeRef = useRef<LottieView>(null);
  const renderStartTime = useRef(performance.now());
  const frameCount = useRef(0);
  const lastFrameTime = useRef(performance.now());
  
  // Performance measuring
  useEffect(() => {
    renderStartTime.current = performance.now();
    
    // Record performance metrics
    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      AvatarPerformanceMonitor.recordRenderTime(renderTime);
    };
  }, []);
  
  // Increment frame counter for FPS calculation
  const onAnimationFrame = () => {
    const now = performance.now();
    const timeSinceLastFrame = now - lastFrameTime.current;
    frameCount.current++;
    
    // Calculate FPS every second
    if (timeSinceLastFrame > 1000) {
      const fps = Math.round((frameCount.current * 1000) / timeSinceLastFrame);
      AvatarPerformanceMonitor.recordAnimationFPS(fps);
      frameCount.current = 0;
      lastFrameTime.current = now;
    }
  };

  // Get appropriate animation based on avatar state and emotion
  const currentAnimation = useMemo(() => {
    // Prioritize emotion-based animations when speaking or idle
    if (avatarState === 'speaking' || avatarState === 'idle') {
      switch (currentEmotion) {
        case 'happy':
        case 'excited':
          return avatarAnimations.happy;
        case 'surprised':
          return avatarAnimations.surprised;
        case 'confused':
          return avatarAnimations.confused;
        case 'sad':
          return avatarAnimations.sad;
        default:
          // Fall back to state-based animations
          return avatarState === 'speaking' 
            ? avatarAnimations.speaking 
            : avatarAnimations.idle;
      }
    }
    
    // For other states, use state-based animations
    switch (avatarState) {
      case 'listening':
        return avatarAnimations.listening;
      case 'thinking':
      case 'processing':
        return avatarAnimations.thinking;
      default:
        return avatarAnimations.idle;
    }
  }, [avatarState, currentEmotion]);

  // Animate visemes for lip sync when speaking
  useEffect(() => {
    if (avatarState === 'speaking' && animationRef.current) {
      animationRef.current.play();
    } else if (animationRef.current) {
      animationRef.current.play();
    }
  }, [avatarState, currentAnimation]);

  // Handle accessibility
  useEffect(() => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      if (avatarState === 'listening') {
        AccessibilityInfo.announceForAccessibility('Avatar is listening');
      } else if (avatarState === 'speaking') {
        if (currentSubtitle) {
          AccessibilityInfo.announceForAccessibility(`Avatar says: ${currentSubtitle}`);
        } else {
          AccessibilityInfo.announceForAccessibility('Avatar is speaking');
        }
      } else if (avatarState === 'processing' || avatarState === 'thinking') {
        AccessibilityInfo.announceForAccessibility('Avatar is thinking');
      }
    }
  }, [avatarState, currentSubtitle]);

  // Get size based on user preferences
  const avatarSize = useMemo(() => {
    switch (userPreferences.avatarSize) {
      case 'small':
        return size * 0.7;
      case 'large':
        return size * 1.3;
      case 'medium':
      default:
        return size;
    }
  }, [size, userPreferences.avatarSize]);

  // Calculate styles based on animations and size
  const containerStyle = useMemo(() => {
    return [
      styles.container,
      {
        width: avatarSize,
        height: avatarSize,
        transform: [
          { scale: Animated.multiply(pulseAnimation, scaleAnimation) },
          { translateY: floatAnimation }
        ]
      }
    ];
  }, [avatarSize, pulseAnimation, scaleAnimation, floatAnimation]);

  if (!isVisible) {
    return null;
  }

  // Performance metrics
  const renderPerformanceMetrics = () => {
    if (!showPerformanceMetrics) return null;
    
    return (
      <View style={styles.performanceMetrics}>
        <Text style={styles.performanceText}>
          State: {avatarState} | Emotion: {currentEmotion}
        </Text>
        <Text style={styles.performanceText}>
          Voice: {voiceStatus}
        </Text>
        <Text style={styles.performanceText}>
          Size: {userPreferences.avatarSize} | Animations: {userPreferences.animationsEnabled ? 'On' : 'Off'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        disabled={!onPress}
        accessibilityLabel={`Avatar. Current state: ${avatarState}.`}
        accessibilityHint="Double tap to interact with the avatar"
        accessibilityRole="button"
      >
        <Animated.View style={containerStyle}>
          <LinearGradient
            colors={['rgba(255,255,255,0.8)', 'rgba(240,240,255,0.85)']}
            style={styles.gradient}
          >
            <LottieView
              ref={animationRef}
              source={currentAnimation}
              style={styles.animation}
              autoPlay
              loop
              speed={1}
              onAnimationFailure={(error) => console.error('Animation error:', error)}
              onAnimationFrame={onAnimationFrame}
            />
            
            {/* Viseme animation layer for lip sync */}
            {avatarState === 'speaking' && (
              <View style={styles.visemeLayer}>
                <LottieView
                  ref={visemeRef}
                  source={visemeAnimations.viseme_sil}
                  style={styles.visemeAnimation}
                  autoPlay
                  loop={false}
                />
              </View>
            )}
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
      
      {/* Subtitles */}
      {currentSubtitle && userPreferences.subtitlesEnabled && (
        <View style={styles.subtitleContainer}>
          <LinearGradient
            colors={['rgba(50,50,70,0.7)', 'rgba(30,30,50,0.8)']}
            style={styles.subtitleGradient}
          >
            <Text style={styles.subtitleText}>{currentSubtitle}</Text>
          </LinearGradient>
        </View>
      )}
      
      {/* Performance metrics display */}
      {renderPerformanceMetrics()}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    borderRadius: 100,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  gradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  visemeLayer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visemeAnimation: {
    width: '50%',
    height: '50%',
    position: 'absolute',
    bottom: '15%',
  },
  subtitleContainer: {
    position: 'absolute',
    bottom: -50,
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  subtitleGradient: {
    borderRadius: 15,
    padding: 10,
    width: '100%',
  },
  subtitleText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  performanceMetrics: {
    position: 'absolute',
    top: -80,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 5,
    borderRadius: 5,
  },
  performanceText: {
    color: 'white',
    fontSize: 10,
  },
});

export default React.memo(EnhancedAvatar);