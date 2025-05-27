// Custom hook for avatar animation management with optimized memory usage
import { useRef, useCallback, useEffect } from 'react';
import { Animated, Easing } from 'react-native';
import { AvatarState } from '../types/avatar';

interface AnimationRefs {
  pulse: Animated.Value;
  scale: Animated.Value;
  float: Animated.Value;
}

interface AnimationControls {
  startAnimation: (state: AvatarState) => void;
  stopAnimation: () => void;
  resetAnimations: () => void;
}

export const useAvatarAnimations = (
  animationsEnabled: boolean
): AnimationRefs & AnimationControls => {
  // Centralized animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  
  // Single animation controller reference
  const currentAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Optimized animation creators with memoization
  const createIdleAnimation = useCallback(() => {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 5,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: -5,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
  }, [floatAnim]);

  const createPulseAnimation = useCallback(() => {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
  }, [pulseAnim]);

  const createProcessingAnimation = useCallback(() => {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.9,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
  }, [pulseAnim]);

  const createSpeakingAnimation = useCallback(() => {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.9,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
  }, [pulseAnim]);

  const createErrorAnimation = useCallback(() => {
    return Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]);
  }, [scaleAnim]);

  const createThinkingAnimation = useCallback(() => {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
  }, [pulseAnim]);

  // Optimized animation controller
  const startAnimation = useCallback((state: AvatarState) => {
    if (!animationsEnabled) return;

    // Stop current animation
    if (currentAnimationRef.current) {
      currentAnimationRef.current.stop();
      currentAnimationRef.current = null;
    }

    // Reset values efficiently
    pulseAnim.setValue(1);
    scaleAnim.setValue(1);
    floatAnim.setValue(0);

    // Create and start new animation
    let animation: Animated.CompositeAnimation | null = null;

    switch (state) {
      case 'idle':
        animation = createIdleAnimation();
        break;
      case 'listening':
        animation = createPulseAnimation();
        break;
      case 'processing':
        animation = createProcessingAnimation();
        break;
      case 'speaking':
        animation = createSpeakingAnimation();
        break;
      case 'thinking':
        animation = createThinkingAnimation();
        break;
      case 'error':
        animation = createErrorAnimation();
        break;
    }

    if (animation) {
      currentAnimationRef.current = animation;
      animation.start();
    }
  }, [
    animationsEnabled,
    createIdleAnimation,
    createPulseAnimation,
    createProcessingAnimation,
    createSpeakingAnimation,
    createThinkingAnimation,
    createErrorAnimation,
    pulseAnim,
    scaleAnim,
    floatAnim,
  ]);

  const stopAnimation = useCallback(() => {
    if (currentAnimationRef.current) {
      currentAnimationRef.current.stop();
      currentAnimationRef.current = null;
    }
  }, []);

  const resetAnimations = useCallback(() => {
    stopAnimation();
    pulseAnim.setValue(1);
    scaleAnim.setValue(1);
    floatAnim.setValue(0);
  }, [stopAnimation, pulseAnim, scaleAnim, floatAnim]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAnimation();
    };
  }, [stopAnimation]);

  return {
    pulse: pulseAnim,
    scale: scaleAnim,
    float: floatAnim,
    startAnimation,
    stopAnimation,
    resetAnimations,
  };
};
