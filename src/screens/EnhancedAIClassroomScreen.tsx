import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import { EnhancedAvatarProvider, useEnhancedAvatar } from '../components/Avatar/EnhancedAvatarContext';
import EnhancedAvatar from '../components/Avatar/EnhancedAvatar';
import { AvatarEmotion } from '../types/avatar';
import { enhancedAvatarService } from '../services/enhancedAvatarService';

// Inner component with access to the EnhancedAvatarContext
const AIClassroomInner: React.FC = () => {
  const {
    startVoiceRecognition,
    stopVoiceRecognition,
    isListening,
    recognizedText,
    currentSubtitle,
    currentEmotion,
    setEmotion,
    speakWithVisemes,
    getLearningRecommendations,
    getPerformanceReport,
    userPreferences,
    updateUserPreference,
  } = useEnhancedAvatar();

  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Array<{
    subject: string;
    level: string;
    reason: string;
  }>>([]);
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(false);
  const [visemeLog, setVisemeLog] = useState<string[]>([]);
  const [performanceReport, setPerformanceReport] = useState('');
  const navigation = useNavigation();

  // Get learning recommendations on mount
  useEffect(() => {
    const loadRecommendations = async () => {
      setIsLoading(true);
      try {
        const result = await getLearningRecommendations();
        setRecommendations(result);
      } catch (error) {
        console.error('Error loading recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, [getLearningRecommendations]);

  // Handle voice button press
  const handleVoiceButtonPress = useCallback(() => {
    if (isListening) {
      stopVoiceRecognition();
    } else {
      setVisemeLog([]);
      startVoiceRecognition();
    }
  }, [isListening, startVoiceRecognition, stopVoiceRecognition]);

  // Demo different emotions
  const demoEmotion = useCallback(async (emotion: AvatarEmotion) => {
    await setEmotion(emotion, 1.0);
    
    // Speak a sample phrase with the emotion
    const phrases: Record<AvatarEmotion, string> = {
      'happy': "I'm really happy to help you learn today!",
      'sad': "I'm sorry to hear that you're struggling with this concept.",
      'angry': "That's frustrating! Let's find a better approach.",
      'surprised': "Wow! That's an impressive solution you found!",
      'confused': "Hmm, I'm not quite sure I understand. Could you explain that again?",
      'thinking': "Let me think about the best way to explain this concept.",
      'excited': "This is so exciting! You're making great progress!",
      'neutral': "Let's continue with our lesson on this topic."
    };
    
    speakWithVisemes(phrases[emotion], {
      onViseme: (viseme, time) => {
        setVisemeLog(prev => [...prev.slice(-9), `${viseme} at ${time}ms`]);
      }
    });
  }, [setEmotion, speakWithVisemes]);

  // Toggle performance report
  const togglePerformanceReport = useCallback(() => {
    if (!performanceReport) {
      setPerformanceReport(getPerformanceReport());
    } else {
      setPerformanceReport('');
    }
  }, [performanceReport, getPerformanceReport]);

  // Toggle avatar size
  const toggleAvatarSize = useCallback(() => {
    const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(userPreferences.avatarSize);
    const nextSize = sizes[(currentIndex + 1) % sizes.length];
    updateUserPreference('avatarSize', nextSize);
  }, [userPreferences.avatarSize, updateUserPreference]);

  // Toggle subtitles
  const toggleSubtitles = useCallback(() => {
    updateUserPreference('subtitlesEnabled', !userPreferences.subtitlesEnabled);
  }, [userPreferences.subtitlesEnabled, updateUserPreference]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#f5f8ff"
      />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Learning Assistant</Text>
        <Text style={styles.headerSubtitle}>Enhanced Avatar Demo</Text>
      </View>
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Avatar Container */}
        <View style={styles.avatarContainer}>
          <EnhancedAvatar 
            size={240} 
            onPress={toggleAvatarSize}
            showPerformanceMetrics={showPerformanceMetrics}
          />
          
          {/* Recognized text */}
          {recognizedText ? (
            <View style={styles.recognizedTextContainer}>
              <Text style={styles.recognizedTextLabel}>You said:</Text>
              <Text style={styles.recognizedText}>{recognizedText}</Text>
            </View>
          ) : null}
        </View>
        
        {/* Voice Controls */}
        <View style={styles.controlsSection}>
          <Text style={styles.sectionTitle}>Voice Interaction</Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                isListening ? styles.activeControlButton : null
              ]}
              onPress={handleVoiceButtonPress}
            >
              <Text style={styles.buttonText}>
                {isListening ? 'Stop Listening' : 'Start Listening'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleSubtitles}
            >
              <Text style={styles.buttonText}>
                {userPreferences.subtitlesEnabled ? 'Hide Subtitles' : 'Show Subtitles'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Emotion Demo */}
        <View style={styles.controlsSection}>
          <Text style={styles.sectionTitle}>Emotions Demo</Text>
          <Text style={styles.infoText}>Current Emotion: {currentEmotion}</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.emotionButtonsContainer}
          >
            <TouchableOpacity style={styles.emotionButton} onPress={() => demoEmotion('happy')}>
              <Text style={styles.emotionButtonText}>😊 Happy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.emotionButton} onPress={() => demoEmotion('sad')}>
              <Text style={styles.emotionButtonText}>😢 Sad</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.emotionButton} onPress={() => demoEmotion('angry')}>
              <Text style={styles.emotionButtonText}>😠 Angry</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.emotionButton} onPress={() => demoEmotion('surprised')}>
              <Text style={styles.emotionButtonText}>😲 Surprised</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.emotionButton} onPress={() => demoEmotion('confused')}>
              <Text style={styles.emotionButtonText}>😕 Confused</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.emotionButton} onPress={() => demoEmotion('thinking')}>
              <Text style={styles.emotionButtonText}>🤔 Thinking</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.emotionButton} onPress={() => demoEmotion('excited')}>
              <Text style={styles.emotionButtonText}>🎉 Excited</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.emotionButton} onPress={() => demoEmotion('neutral')}>
              <Text style={styles.emotionButtonText}>😐 Neutral</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        
        {/* Viseme Log */}
        {visemeLog.length > 0 && (
          <View style={styles.controlsSection}>
            <Text style={styles.sectionTitle}>Lip Sync Visemes</Text>
            <ScrollView style={styles.visemeLog}>
              {visemeLog.map((log, index) => (
                <Text key={index} style={styles.visemeLogText}>{log}</Text>
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* Learning Recommendations */}
        <View style={styles.controlsSection}>
          <Text style={styles.sectionTitle}>Learning Recommendations</Text>
          
          {isLoading ? (
            <ActivityIndicator size="small" color="#8E54E9" />
          ) : recommendations.length > 0 ? (
            recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationCard}>
                <Text style={styles.recommendationSubject}>{rec.subject} ({rec.level})</Text>
                <Text style={styles.recommendationReason}>{rec.reason}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.infoText}>No recommendations available yet.</Text>
          )}
        </View>
        
        {/* Performance Monitoring */}
        <View style={styles.controlsSection}>
          <Text style={styles.sectionTitle}>Performance Monitoring</Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setShowPerformanceMetrics(!showPerformanceMetrics)}
            >
              <Text style={styles.buttonText}>
                {showPerformanceMetrics ? 'Hide Metrics' : 'Show Metrics'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.controlButton}
              onPress={togglePerformanceReport}
            >
              <Text style={styles.buttonText}>
                {performanceReport ? 'Hide Report' : 'Show Report'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {performanceReport ? (
            <ScrollView style={styles.performanceReport}>
              <Text style={styles.performanceReportText}>{performanceReport}</Text>
            </ScrollView>
          ) : null}
        </View>

        {/* Additional Features */}
        <View style={styles.controlsSection}>
          <Text style={styles.sectionTitle}>Advanced Features</Text>
          
          <TouchableOpacity
            style={styles.advancedFeatureButton}
            onPress={() => navigation.navigate('AdaptiveLearningDemo' as never)}
          >
            <LinearGradient
              colors={['#4776E6', '#8E54E9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.advancedButtonGradient}
            >
              <Text style={styles.advancedButtonText}>
                Try Adaptive Learning Demo
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.advancedFeatureButton, { marginTop: 10 }]}
            onPress={() => navigation.navigate('EnhancedAvatarPerformanceDashboard' as never)}
          >
            <LinearGradient
              colors={['#4776E6', '#8E54E9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.advancedButtonGradient}
            >
              <Text style={styles.advancedButtonText}>
                View Performance Dashboard
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Wrapper component that provides the EnhancedAvatarContext
const EnhancedAIClassroomScreen: React.FC = () => {
  return (
    <EnhancedAvatarProvider>
      <AIClassroomInner />
    </EnhancedAvatarProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f8ff',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: '#f5f8ff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5ee',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 20,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    paddingBottom: 20,
  },
  recognizedTextContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: 'rgba(142, 84, 233, 0.1)',
    borderRadius: 10,
    width: '100%',
  },
  recognizedTextLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  recognizedText: {
    fontSize: 16,
    color: '#333',
  },
  controlsSection: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  controlButton: {
    backgroundColor: '#8E54E9',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  activeControlButton: {
    backgroundColor: '#D81E5B',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  emotionButtonsContainer: {
    paddingVertical: 10,
  },
  emotionButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  emotionButtonText: {
    fontSize: 14,
    color: '#333',
  },
  recommendationCard: {
    backgroundColor: '#f9f9ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#8E54E9',
  },
  recommendationSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  recommendationReason: {
    fontSize: 14,
    color: '#666',
  },
  visemeLog: {
    maxHeight: 120,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
  },
  visemeLogText: {
    fontSize: 12,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  performanceReport: {
    maxHeight: 200,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  performanceReportText: {
    fontSize: 12,
    color: '#ddd',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  advancedFeatureButton: {
    width: '100%',
  },
  advancedButtonGradient: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  advancedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EnhancedAIClassroomScreen;