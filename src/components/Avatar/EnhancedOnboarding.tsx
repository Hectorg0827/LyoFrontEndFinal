import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Image,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { EnhancedAvatarProvider, useEnhancedAvatar } from './EnhancedAvatarContext';
import EnhancedAvatar from './EnhancedAvatar';
import { AvatarEmotion } from '../../types/avatar';

const { width } = Dimensions.get('window');

// Onboarding steps
const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Lyo AI',
    subtitle: 'Your personalized learning assistant',
    description: 'Meet your AI learning companion, designed to adapt to your unique learning style and preferences.',
    emotion: 'excited' as AvatarEmotion,
    message: "Hi there! I'm Lyo, your personalized AI learning assistant. I'm excited to help you learn and grow. Let me show you what I can do!",
  },
  {
    id: 'emotional',
    title: 'Emotional Intelligence',
    subtitle: 'I respond to your emotions',
    description: 'I can detect and respond to your emotional state, providing encouragement when you're struggling and celebrating your successes.',
    emotion: 'happy' as AvatarEmotion,
    message: "I'm equipped with emotional intelligence, which means I can understand how you're feeling and respond appropriately. This helps us build a more natural and supportive learning relationship.",
  },
  {
    id: 'adaptive',
    title: 'Adaptive Learning',
    subtitle: 'Personalized to your needs',
    description: 'I analyze your performance and adjust content difficulty to keep you in the optimal learning zone - challenged but not overwhelmed.',
    emotion: 'thinking' as AvatarEmotion,
    message: "I'll continuously adapt to your learning style and pace. If you find something too easy, I'll increase the difficulty. If something's challenging, I'll provide more support and guidance.",
  },
  {
    id: 'voice',
    title: 'Natural Conversations',
    subtitle: 'Just talk to me',
    description: 'Have natural conversations with me through advanced voice recognition and realistic speech synthesis with lip sync.',
    emotion: 'neutral' as AvatarEmotion,
    message: "You can simply talk to me like you would with a human tutor. Ask questions, request explanations, or just chat about what you're learning. I'm here to help!",
  },
  {
    id: 'getstarted',
    title: 'Let\'s Get Started!',
    subtitle: 'Your learning journey begins',
    description: 'I'm ready to help you achieve your learning goals. Let's begin this journey together!',
    emotion: 'happy' as AvatarEmotion,
    message: "I'm so excited to start this learning journey with you! Together, we'll explore new subjects, overcome challenges, and celebrate your achievements. Let's get started!",
  },
];

// The inner component with access to EnhancedAvatarContext
const EnhancedOnboardingInner: React.FC<{
  onComplete: () => void;
}> = ({ onComplete }) => {
  const navigation = useNavigation();
  const { speakWithVisemes, setEmotion } = useEnhancedAvatar();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const [visibleDots, setVisibleDots] = useState(5);

  // Parallax animation values
  const imagePosX = scrollX.interpolate({
    inputRange: ONBOARDING_STEPS.map((_, i) => i * width),
    outputRange: ONBOARDING_STEPS.map((_, i) => -i * width * 0.2),
    extrapolate: 'clamp',
  });

  // Recalculate visible dots on width change
  useEffect(() => {
    const calculateVisibleDots = () => {
      const maxDotsBasedOnWidth = Math.floor(width / 40);
      setVisibleDots(Math.min(ONBOARDING_STEPS.length, maxDotsBasedOnWidth));
    };
    
    calculateVisibleDots();
    
    // Add resize listener for web
    if (Platform.OS === 'web') {
      window.addEventListener('resize', calculateVisibleDots);
      return () => window.removeEventListener('resize', calculateVisibleDots);
    }
  }, []);

  // Speak the current step's message
  useEffect(() => {
    const speakCurrentStep = async () => {
      const step = ONBOARDING_STEPS[currentStep];
      setSpeaking(true);
      
      // Set the avatar's emotion
      await setEmotion(step.emotion);
      
      // Speak with lip sync
      await speakWithVisemes(step.message, {
        onDone: () => setSpeaking(false)
      });
    };
    
    speakCurrentStep();
  }, [currentStep, setEmotion, speakWithVisemes]);

  // Handle scroll events to update current step
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { 
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const newStep = Math.round(offsetX / width);
        if (newStep !== currentStep) {
          setCurrentStep(newStep);
        }
      }
    }
  );

  // Navigate to next step
  const goToNextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (currentStep + 1) * width,
        animated: true,
      });
    } else {
      completeOnboarding();
    }
  };

  // Navigate to previous step
  const goToPrevStep = () => {
    if (currentStep > 0) {
      scrollViewRef.current?.scrollTo({
        x: (currentStep - 1) * width,
        animated: true,
      });
    }
  };

  // Complete onboarding
  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('@enhanced_onboarding_completed', 'true');
      onComplete();
    } catch (error) {
      console.error('Failed to save onboarding status:', error);
      // Still complete onboarding even if saving fails
      onComplete();
    }
  };

  // Skip onboarding
  const skipOnboarding = () => {
    completeOnboarding();
  };

  // Render indicator dots
  const renderDots = () => {
    // Calculate which dots to show
    let startDot = 0;
    if (ONBOARDING_STEPS.length > visibleDots) {
      // Keep current dot in the middle when possible
      startDot = Math.max(0, Math.min(
        currentStep - Math.floor(visibleDots / 2),
        ONBOARDING_STEPS.length - visibleDots
      ));
    }
    
    const dots = [];
    for (let i = startDot; i < Math.min(startDot + visibleDots, ONBOARDING_STEPS.length); i++) {
      dots.push(
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {
              opacity: scrollX.interpolate({
                inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp',
              }),
              transform: [
                {
                  scale: scrollX.interpolate({
                    inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                    outputRange: [0.8, 1.2, 0.8],
                    extrapolate: 'clamp',
                  }),
                },
              ],
              backgroundColor: scrollX.interpolate({
                inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                outputRange: ['#666', '#8E54E9', '#666'],
                extrapolate: 'clamp',
              }),
            },
          ]}
        />
      );
    }
    
    // Add indicators for more dots if needed
    if (startDot > 0) {
      dots.unshift(
        <View key="left-more" style={styles.moreDots}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
        </View>
      );
    }
    
    if (startDot + visibleDots < ONBOARDING_STEPS.length) {
      dots.push(
        <View key="right-more" style={styles.moreDots}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
        </View>
      );
    }
    
    return dots;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Skip button */}
      <TouchableOpacity style={styles.skipButton} onPress={skipOnboarding}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
      
      {/* Parallax background effect */}
      <Animated.View style={[styles.parallaxBackground, { transform: [{ translateX: imagePosX }] }]}>
        <LinearGradient
          colors={['#4776E6', '#8E54E9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        />
      </Animated.View>
      
      {/* Onboarding content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        scrollEnabled={!speaking}
        contentContainerStyle={styles.scrollContent}
      >
        {ONBOARDING_STEPS.map((step, index) => (
          <View key={step.id} style={styles.slide}>
            <View style={styles.avatarContainer}>
              <EnhancedAvatar size={180} />
            </View>
            
            <View style={styles.textContainer}>
              <Text style={styles.title}>{step.title}</Text>
              <Text style={styles.subtitle}>{step.subtitle}</Text>
              <Text style={styles.description}>{step.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      
      {/* Navigation controls */}
      <View style={styles.controls}>
        {/* Progress dots */}
        <View style={styles.dotsContainer}>
          {renderDots()}
        </View>
        
        {/* Navigation buttons */}
        <View style={styles.buttonContainer}>
          {currentStep > 0 ? (
            <TouchableOpacity style={styles.navButton} onPress={goToPrevStep} disabled={speaking}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ) : <View style={styles.emptyButton} />}
          
          <TouchableOpacity 
            style={[styles.nextButton, speaking && styles.disabledButton]} 
            onPress={goToNextStep}
            disabled={speaking}
          >
            <LinearGradient
              colors={['#4776E6', '#8E54E9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>
                {currentStep === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Next'}
              </Text>
              {currentStep < ONBOARDING_STEPS.length - 1 && (
                <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.nextIcon} />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Wrapper component that provides the EnhancedAvatarContext
const EnhancedOnboarding: React.FC<{
  onComplete: () => void;
}> = ({ onComplete }) => {
  return (
    <EnhancedAvatarProvider>
      <EnhancedOnboardingInner onComplete={onComplete} />
    </EnhancedAvatarProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  parallaxBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width * ONBOARDING_STEPS.length,
    height: '100%',
  },
  gradientBackground: {
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  skipText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  avatarContainer: {
    marginBottom: 40,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#ccc',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 24,
  },
  controls: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  moreDots: {
    marginHorizontal: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  navButton: {
    padding: 12,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  emptyButton: {
    width: 48,
    height: 48,
  },
  nextButton: {
    flex: 1,
    maxWidth: 200,
    marginLeft: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  nextButtonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  nextIcon: {
    marginLeft: 10,
  },
});

export default EnhancedOnboarding;