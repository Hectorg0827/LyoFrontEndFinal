import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { EnhancedAvatarProvider, useEnhancedAvatar } from '../components/Avatar/EnhancedAvatarContext';
import EnhancedAvatar from '../components/Avatar/EnhancedAvatar';
import { adaptiveLearningService, DifficultyLevel, LearningDomain } from '../services/adaptiveLearningService';

// Mock quiz questions based on difficulty level
const getMockQuestions = (subject: LearningDomain, difficulty: DifficultyLevel) => {
  const difficultyMultiplier = {
    'beginner': 1,
    'intermediate': 2,
    'advanced': 3,
    'expert': 4,
  };
  
  const subjectContent = {
    'math': {
      topic: 'Algebra',
      questions: [
        {
          beginner: 'What is 5 + 7?',
          intermediate: 'Solve for x: 3x + 7 = 22',
          advanced: 'Solve for x: 2x² + 5x - 3 = 0',
          expert: 'Find all values of x where f(x) = x³ - 6x² + 11x - 6 has local extrema',
        },
        {
          beginner: 'What is 8 × 4?',
          intermediate: 'Simplify: (3x + 2)(x - 4)',
          advanced: 'Solve the system: 2x + y = 5, 3x - 2y = 4',
          expert: 'Find the sum of the infinite geometric series: 4 + 2 + 1 + 1/2 + ...',
        },
      ],
    },
    'science': {
      topic: 'Physics',
      questions: [
        {
          beginner: 'What is the formula for speed?',
          intermediate: 'Calculate the force needed to accelerate a 2kg mass at 5 m/s²',
          advanced: 'Calculate the escape velocity from Earth's surface',
          expert: 'Derive the Lorentz transformation equations for special relativity',
        },
        {
          beginner: 'What are the three states of matter?',
          intermediate: 'Explain Boyle's law with an example',
          advanced: 'Describe quantum tunneling and its applications',
          expert: 'Explain the Casimir effect and its implications for vacuum energy',
        },
      ],
    },
    'history': {
      topic: 'World History',
      questions: [
        {
          beginner: 'When did World War II end?',
          intermediate: 'Explain the causes of the French Revolution',
          advanced: 'Analyze the economic factors that led to the fall of the Roman Empire',
          expert: 'Compare and contrast the philosophical underpinnings of the American and French Revolutions',
        },
        {
          beginner: 'Who was the first president of the United States?',
          intermediate: 'Describe the impact of the Silk Road on cultural exchange',
          advanced: 'Evaluate the long-term effects of European colonialism in Africa',
          expert: 'Analyze how the concept of nationalism evolved from the 18th to the 20th century',
        },
      ],
    },
    'language': {
      topic: 'English',
      questions: [
        {
          beginner: 'What is a noun?',
          intermediate: 'Identify and explain the use of metaphor in this passage',
          advanced: 'Analyze the narrative voice in Virginia Woolf's "To the Lighthouse"',
          expert: 'Compare the linguistic techniques used by James Joyce and Samuel Beckett to represent consciousness',
        },
        {
          beginner: 'What is the past tense of "run"?',
          intermediate: 'Correct the grammatical errors in this paragraph',
          advanced: 'Explain how syntax affects meaning in modern poetry',
          expert: 'Analyze the evolution of English syntax from Old English to Modern English',
        },
      ],
    },
    'general': {
      topic: 'General Knowledge',
      questions: [
        {
          beginner: 'What is the capital of France?',
          intermediate: 'Name three UNESCO World Heritage sites and their locations',
          advanced: 'Explain the function of the International Monetary Fund',
          expert: 'Analyze the role of supranational organizations in addressing global climate change',
        },
        {
          beginner: 'Who painted the Mona Lisa?',
          intermediate: 'Describe the differences between renewable and non-renewable energy sources',
          advanced: 'Explain how blockchain technology works and its potential applications',
          expert: 'Evaluate the ethical implications of CRISPR gene editing technology',
        },
      ],
    },
  };
  
  // Default to general if subject not found
  const content = subjectContent[subject] || subjectContent.general;
  
  return {
    topic: content.topic,
    questions: content.questions.map(q => ({
      text: q[difficulty] || q.beginner, // Fall back to beginner if difficulty not available
      difficulty
    })),
  };
};

// Inner component that has access to the EnhancedAvatarContext
const AdaptiveLearningDemoInner: React.FC = () => {
  const navigation = useNavigation();
  const { speakWithVisemes, setEmotion } = useEnhancedAvatar();
  
  const [isLoading, setIsLoading] = useState(false);
  const [userId] = useState('demo_user_123'); // Use a fixed demo user ID
  const [selectedDomain, setSelectedDomain] = useState<LearningDomain>('math');
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>('beginner');
  const [questions, setQuestions] = useState<{text: string, difficulty: DifficultyLevel}[]>([]);
  const [adaptationEnabled, setAdaptationEnabled] = useState(true);
  const [emotionDetectionEnabled, setEmotionDetectionEnabled] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [completionTime, setCompletionTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  
  // Load user profile and current difficulty
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        // Get recommended difficulty for the selected domain
        const difficulty = await adaptiveLearningService.getRecommendedDifficulty(
          userId,
          selectedDomain
        );
        setCurrentDifficulty(difficulty);
        
        // Get profile to check settings
        const profile = await adaptiveLearningService.getUserProfile(userId);
        setAdaptationEnabled(profile.globalSettings.adaptationEnabled);
        setEmotionDetectionEnabled(profile.globalSettings.emotionDetectionEnabled);
        
        // Load questions for this difficulty
        const questionSet = getMockQuestions(selectedDomain, difficulty);
        setQuestions(questionSet.questions);
      } catch (error) {
        console.error('Failed to load profile:', error);
        Alert.alert('Error', 'Failed to load adaptive learning profile');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, [selectedDomain, userId]);
  
  // Update global settings when toggles change
  useEffect(() => {
    const updateSettings = async () => {
      try {
        await adaptiveLearningService.updateGlobalSettings(userId, {
          adaptationEnabled,
          emotionDetectionEnabled,
        });
      } catch (error) {
        console.error('Failed to update settings:', error);
      }
    };
    
    updateSettings();
  }, [adaptationEnabled, emotionDetectionEnabled, userId]);
  
  // Start a quiz session
  const startQuiz = async () => {
    setQuizStarted(true);
    setQuizCompleted(false);
    setScore(0);
    setStartTime(Date.now());
    
    // Have avatar introduce the quiz
    const difficultyText = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
    const domainText = selectedDomain.charAt(0).toUpperCase() + selectedDomain.slice(1);
    
    // Set appropriate emotion
    await setEmotion('excited');
    
    // Speak introduction
    await speakWithVisemes(
      `Let's start a ${difficultyText} level ${domainText} quiz! I'll adapt the questions based on your performance. Good luck!`
    );
  };
  
  // Complete the quiz with a random score
  const completeQuiz = async () => {
    const endTime = Date.now();
    const timeSpent = Math.round((endTime - startTime) / 1000); // Convert to seconds
    setCompletionTime(timeSpent);
    
    // Generate a random score for the demo
    // In a real app, this would be calculated from actual answers
    let randomScore: number;
    
    switch (currentDifficulty) {
      case 'beginner':
        randomScore = Math.floor(Math.random() * 30) + 70; // 70-100
        break;
      case 'intermediate':
        randomScore = Math.floor(Math.random() * 40) + 60; // 60-100
        break;
      case 'advanced':
        randomScore = Math.floor(Math.random() * 50) + 50; // 50-100
        break;
      case 'expert':
        randomScore = Math.floor(Math.random() * 60) + 40; // 40-100
        break;
      default:
        randomScore = Math.floor(Math.random() * 40) + 60; // 60-100
    }
    
    setScore(randomScore);
    setQuizCompleted(true);
    
    // Record the performance
    try {
      const newDifficulty = await adaptiveLearningService.recordPerformance(
        userId,
        {
          domain: selectedDomain,
          level: currentDifficulty,
          score: randomScore,
          completionTime: timeSpent,
        }
      );
      
      // Set appropriate emotion based on score
      if (randomScore >= 90) {
        await setEmotion('excited');
      } else if (randomScore >= 70) {
        await setEmotion('happy');
      } else if (randomScore >= 50) {
        await setEmotion('neutral');
      } else {
        await setEmotion('confused');
      }
      
      // Speak feedback
      let feedbackMessage = `You completed the quiz with a score of ${randomScore}%. `;
      
      if (newDifficulty !== currentDifficulty) {
        feedbackMessage += `Based on your performance, I'm adjusting the difficulty to ${newDifficulty} for future quizzes. `;
        
        // Update current difficulty
        setCurrentDifficulty(newDifficulty);
        
        // Load new questions for the updated difficulty
        const questionSet = getMockQuestions(selectedDomain, newDifficulty);
        setQuestions(questionSet.questions);
      } else {
        feedbackMessage += `I'll keep the difficulty at ${currentDifficulty} for now. `;
      }
      
      feedbackMessage += 'Great job!';
      
      await speakWithVisemes(feedbackMessage);
    } catch (error) {
      console.error('Failed to record performance:', error);
      Alert.alert('Error', 'Failed to record quiz performance');
    }
  };
  
  // Reset the quiz
  const resetQuiz = () => {
    setQuizStarted(false);
    setQuizCompleted(false);
    setScore(0);
    setCompletionTime(0);
  };
  
  // Reset user profile to defaults
  const resetProfile = async () => {
    try {
      await adaptiveLearningService.resetUserProfile(userId);
      Alert.alert('Success', 'Profile reset to defaults. Reloading...');
      
      // Reload with default difficulty
      setCurrentDifficulty('beginner');
      const questionSet = getMockQuestions(selectedDomain, 'beginner');
      setQuestions(questionSet.questions);
      setAdaptationEnabled(true);
      setEmotionDetectionEnabled(true);
      
      // Reset quiz state
      resetQuiz();
    } catch (error) {
      console.error('Failed to reset profile:', error);
      Alert.alert('Error', 'Failed to reset profile');
    }
  };
  
  // Render questions list
  const renderQuestions = () => {
    return questions.map((question, index) => (
      <View key={index} style={styles.questionCard}>
        <Text style={styles.questionNumber}>Question {index + 1}</Text>
        <Text style={styles.questionText}>{question.text}</Text>
        <View style={styles.answerButtons}>
          <TouchableOpacity 
            style={[styles.answerButton, quizCompleted && styles.disabledButton]}
            disabled={!quizStarted || quizCompleted}
            onPress={() => {/* Would handle answer in a real app */}}
          >
            <Text style={styles.answerButtonText}>Answer A</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.answerButton, quizCompleted && styles.disabledButton]}
            disabled={!quizStarted || quizCompleted}
            onPress={() => {/* Would handle answer in a real app */}}
          >
            <Text style={styles.answerButtonText}>Answer B</Text>
          </TouchableOpacity>
        </View>
      </View>
    ));
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Adaptive Learning Demo</Text>
        <TouchableOpacity
          style={styles.dashboardButton}
          onPress={() => navigation.navigate('EnhancedAvatarPerformanceDashboard' as never)}
        >
          <Ionicons name="stats-chart" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.container}>
        {/* Avatar Section */}
        <View style={styles.avatarContainer}>
          <EnhancedAvatar size={180} />
          
          {quizCompleted && (
            <View style={styles.scoreCard}>
              <Text style={styles.scoreTitle}>Quiz Results</Text>
              <Text style={styles.scoreValue}>{score}%</Text>
              <Text style={styles.scoreDetail}>
                Completion Time: {completionTime} seconds
              </Text>
              <Text style={styles.scoreDetail}>
                Difficulty: {currentDifficulty}
              </Text>
            </View>
          )}
        </View>
        
        {/* Domain Selector */}
        <View style={styles.domainSection}>
          <Text style={styles.sectionTitle}>Select Learning Domain</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.domainButtonsContainer}
          >
            {(['math', 'science', 'history', 'language', 'general'] as LearningDomain[]).map((domain) => (
              <TouchableOpacity
                key={domain}
                style={[
                  styles.domainButton,
                  selectedDomain === domain && styles.selectedDomainButton
                ]}
                onPress={() => {
                  if (!quizStarted) {
                    setSelectedDomain(domain);
                  } else {
                    Alert.alert('Quiz in Progress', 'Please finish or reset the current quiz before changing domains.');
                  }
                }}
                disabled={quizStarted && !quizCompleted}
              >
                <Text style={[
                  styles.domainButtonText,
                  selectedDomain === domain && styles.selectedDomainButtonText
                ]}>
                  {domain.charAt(0).toUpperCase() + domain.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Adaptive Settings</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Adaptation Enabled</Text>
            <Switch
              value={adaptationEnabled}
              onValueChange={setAdaptationEnabled}
              trackColor={{ false: '#3e3e3e', true: '#8E54E9' }}
              thumbColor="#f4f3f4"
              disabled={quizStarted && !quizCompleted}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Emotion Detection</Text>
            <Switch
              value={emotionDetectionEnabled}
              onValueChange={setEmotionDetectionEnabled}
              trackColor={{ false: '#3e3e3e', true: '#8E54E9' }}
              thumbColor="#f4f3f4"
              disabled={quizStarted && !quizCompleted}
            />
          </View>
          
          <View style={styles.difficultyIndicator}>
            <Text style={styles.difficultyLabel}>Current Difficulty:</Text>
            <View style={[
              styles.difficultyBadge,
              styles[`difficulty${currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)}`]
            ]}>
              <Text style={styles.difficultyText}>
                {currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              Alert.alert(
                'Reset Profile',
                'This will reset your adaptive learning profile to defaults. Continue?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Reset', onPress: resetProfile }
                ]
              );
            }}
            disabled={quizStarted && !quizCompleted}
          >
            <Text style={styles.resetButtonText}>Reset Profile</Text>
          </TouchableOpacity>
        </View>
        
        {/* Quiz Section */}
        <View style={styles.quizSection}>
          <Text style={styles.sectionTitle}>Quiz</Text>
          
          {isLoading ? (
            <ActivityIndicator size="large" color="#8E54E9" style={styles.loader} />
          ) : (
            <>
              {renderQuestions()}
              
              <View style={styles.quizControls}>
                {!quizStarted ? (
                  <TouchableOpacity
                    style={styles.startButton}
                    onPress={startQuiz}
                  >
                    <LinearGradient
                      colors={['#4776E6', '#8E54E9']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.gradientButton}
                    >
                      <Text style={styles.buttonText}>Start Quiz</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : quizCompleted ? (
                  <TouchableOpacity
                    style={styles.resetQuizButton}
                    onPress={resetQuiz}
                  >
                    <Text style={styles.resetQuizButtonText}>New Quiz</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.completeButton}
                    onPress={completeQuiz}
                  >
                    <LinearGradient
                      colors={['#4776E6', '#8E54E9']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.gradientButton}
                    >
                      <Text style={styles.buttonText}>Complete Quiz</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Wrapper component that provides the EnhancedAvatarContext
const AdaptiveLearningDemoScreen: React.FC = () => {
  return (
    <EnhancedAvatarProvider>
      <AdaptiveLearningDemoInner />
    </EnhancedAvatarProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#1F1F1F',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
  },
  dashboardButton: {
    padding: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  scoreCard: {
    backgroundColor: 'rgba(142, 84, 233, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
    width: '90%',
    alignItems: 'center',
  },
  scoreTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  scoreValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  scoreDetail: {
    color: '#AAAAAA',
    fontSize: 14,
    marginTop: 5,
  },
  domainSection: {
    backgroundColor: '#1F1F1F',
    margin: 15,
    borderRadius: 12,
    padding: 15,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  domainButtonsContainer: {
    paddingBottom: 5,
  },
  domainButton: {
    backgroundColor: '#333',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  selectedDomainButton: {
    backgroundColor: '#8E54E9',
  },
  domainButtonText: {
    color: '#AAAAAA',
    fontSize: 16,
  },
  selectedDomainButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  settingsSection: {
    backgroundColor: '#1F1F1F',
    margin: 15,
    borderRadius: 12,
    padding: 15,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  difficultyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  difficultyLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 10,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  difficultyBeginner: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  difficultyIntermediate: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    borderColor: '#FF9800',
    borderWidth: 1,
  },
  difficultyAdvanced: {
    backgroundColor: 'rgba(233, 30, 99, 0.2)',
    borderColor: '#E91E63',
    borderWidth: 1,
  },
  difficultyExpert: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderColor: '#F44336',
    borderWidth: 1,
  },
  difficultyText: {
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderColor: '#F44336',
    borderWidth: 1,
  },
  resetButtonText: {
    color: '#F44336',
    fontWeight: '600',
  },
  quizSection: {
    backgroundColor: '#1F1F1F',
    margin: 15,
    borderRadius: 12,
    padding: 15,
    marginBottom: 30,
  },
  loader: {
    marginVertical: 20,
  },
  questionCard: {
    backgroundColor: '#2D2D2D',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  questionNumber: {
    color: '#8E54E9',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  questionText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 15,
  },
  answerButtons: {
    flexDirection: 'column',
    gap: 10,
  },
  answerButton: {
    backgroundColor: 'rgba(142, 84, 233, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  disabledButton: {
    opacity: 0.5,
  },
  answerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  quizControls: {
    marginTop: 20,
    alignItems: 'center',
  },
  startButton: {
    width: '100%',
  },
  completeButton: {
    width: '100%',
  },
  gradientButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resetQuizButton: {
    backgroundColor: 'rgba(33, 150, 243, 0.2)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    borderColor: '#2196F3',
    borderWidth: 1,
    width: '100%',
  },
  resetQuizButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdaptiveLearningDemoScreen;