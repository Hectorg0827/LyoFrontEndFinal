import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { EnhancedAvatarProvider, useEnhancedAvatar } from "../components/Avatar/EnhancedAvatarContext";
import EnhancedAvatar from "../components/Avatar/EnhancedAvatar";
import EnhancedOnboarding from "../components/Avatar/EnhancedOnboarding";
import EnhancedFeatureList, { EnhancedFeature } from "../components/Feed/EnhancedFeatureList";
import { adaptiveLearningService, DifficultyLevel, LearningDomain } from "../services/adaptiveLearningService";
import { learnService } from "../services/learnService";
import { ErrorHandler } from "../services/errorHandler";

// Types for the enhanced learning screen
interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  level: DifficultyLevel;
  domain: LearningDomain;
  progress: number;
  enrollmentDate?: string;
  completed?: boolean;
  featured?: boolean;
}

interface Category {
  id: string;
  name: string;
  courses: Course[];
}

// The inner component with access to EnhancedAvatarContext
const EnhancedLearnScreenInner: React.FC = () => {
  const navigation = useNavigation();
  const { speakWithVisemes, setEmotion } = useEnhancedAvatar();
  
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userId] = useState('demo_user_123'); // Demo user ID for testing
  const [adaptiveRecommendations, setAdaptiveRecommendations] = useState<{
    domain: LearningDomain;
    level: DifficultyLevel;
    courses: Course[];
  }[]>([]);
  
  // Define enhanced features for the feature list
  const enhancedFeatures: EnhancedFeature[] = [
    {
      id: "adaptive-learning",
      title: "Adaptive Learning",
      description: "Content difficulty adjusts automatically based on your performance and emotional responses.",
      iconName: "fitness-outline",
      iconColor: "#8E54E9",
      screenName: "AdaptiveLearningDemo",
      isNew: true,
    },
    {
      id: "enhanced-avatar",
      title: "Enhanced Avatar",
      description: "AI avatar with emotion detection, lip sync, and improved voice interaction.",
      iconName: "person-circle-outline",
      iconColor: "#4CAF50",
      screenName: "EnhancedAIClassroom",
      badge: "BETA",
    },
    {
      id: "performance-dashboard",
      title: "Performance Dashboard",
      description: "Real-time metrics and analytics on your learning journey.",
      iconName: "stats-chart-outline",
      iconColor: "#FF9800",
      screenName: "EnhancedAvatarPerformanceDashboard",
    },
    {
      id: "domain-specific",
      title: "Domain Learning",
      description: "Personalized content organized by subject domains and difficulty levels.",
      iconName: "library-outline",
      iconColor: "#2196F3",
    },
  ];
  
  // Check if enhanced onboarding was completed
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const onboardingCompleted = await AsyncStorage.getItem('@enhanced_onboarding_completed');
        if (onboardingCompleted !== 'true') {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
      }
    };
    
    checkOnboarding();
  }, []);
  
  // Load courses and recommendations on mount
  useEffect(() => {
    loadCourses();
  }, []);
  
  // Load all course data
  const loadCourses = async () => {
    setIsLoading(true);
    try {
      // Get courses from service
      const [featuredData, enrolledData, categoriesData] = await Promise.all([
        learnService.getFeaturedCourses(),
        learnService.getEnrolledCourses(),
        learnService.getCourseCategories(),
      ]);
      
      setFeaturedCourses(featuredData);
      setEnrolledCourses(enrolledData);
      setCategories(categoriesData);
      
      // Get adaptive recommendations
      await loadAdaptiveRecommendations();
    } catch (error) {
      console.error('Failed to load courses:', error);
      ErrorHandler.handleError({
        error: error as Error,
        context: 'EnhancedLearnScreen.loadCourses',
        action: 'loading courses',
        userMessage: 'Failed to load courses. Please try again.',
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  
  // Load adaptive recommendations
  const loadAdaptiveRecommendations = async () => {
    try {
      // Get progress report from adaptive learning service
      const progressReport = await adaptiveLearningService.getProgressReport(userId);
      
      // Get recommended domains (focus areas)
      const recommendedDomains = progressReport.recommendedFocus;
      
      // For each domain, get recommended difficulty and matching courses
      const recommendations = await Promise.all(
        recommendedDomains.map(async (domain) => {
          const level = await adaptiveLearningService.getRecommendedDifficulty(userId, domain);
          
          // Get courses for this domain and level
          const courses = await learnService.getCoursesByDomainAndLevel(domain, level);
          
          return {
            domain,
            level,
            courses,
          };
        })
      );
      
      setAdaptiveRecommendations(recommendations);
    } catch (error) {
      console.error('Failed to load adaptive recommendations:', error);
    }
  };
  
  // Refresh courses data
  const handleRefresh = () => {
    setRefreshing(true);
    loadCourses();
  };
  
  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    
    // Welcome the user with the avatar
    setTimeout(async () => {
      await setEmotion('happy');
      await speakWithVisemes(
        "Welcome to the enhanced learning experience! I've prepared some personalized course recommendations for you based on your learning patterns. Let me know if you need any help!"
      );
    }, 500);
  };
  
  // Render featured courses section
  const renderFeaturedCourses = () => {
    if (featuredCourses.length === 0) {
      return null;
    }
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Courses</Text>
        <FlatList
          horizontal
          data={featuredCourses}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.featuredCourseCard}
              onPress={() => handleCoursePress(item)}
            >
              <Image
                source={{ uri: item.thumbnail }}
                style={styles.featuredCourseImage}
              />
              <View style={styles.featuredCourseContent}>
                <Text style={styles.featuredCourseTitle}>{item.title}</Text>
                <View style={styles.courseMetaRow}>
                  <View style={styles.courseMetaItem}>
                    <Ionicons name="time-outline" size={14} color="#8E54E9" />
                    <Text style={styles.courseMetaText}>{item.duration}</Text>
                  </View>
                  <View style={[
                    styles.levelBadge,
                    styles[`level${item.level.charAt(0).toUpperCase() + item.level.slice(1)}`]
                  ]}>
                    <Text style={styles.levelText}>
                      {item.level.charAt(0).toUpperCase() + item.level.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };
  
  // Render enrolled courses section
  const renderEnrolledCourses = () => {
    if (enrolledCourses.length === 0) {
      return null;
    }
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Courses</Text>
        <FlatList
          horizontal
          data={enrolledCourses}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.enrolledCourseCard}
              onPress={() => handleCoursePress(item)}
            >
              <Image
                source={{ uri: item.thumbnail }}
                style={styles.enrolledCourseImage}
              />
              <View style={styles.enrolledCourseContent}>
                <Text style={styles.enrolledCourseTitle}>{item.title}</Text>
                <View style={styles.progressContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { width: `${item.progress}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>{item.progress}% Complete</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };
  
  // Render adaptive recommendations section
  const renderAdaptiveRecommendations = () => {
    if (adaptiveRecommendations.length === 0) {
      return null;
    }
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Personalized For You</Text>
          <TouchableOpacity
            style={styles.adaptiveInfoButton}
            onPress={() => navigation.navigate('AdaptiveLearningDemo' as never)}
          >
            <Ionicons name="information-circle-outline" size={20} color="#8E54E9" />
          </TouchableOpacity>
        </View>
        
        {adaptiveRecommendations.map((recommendation) => (
          <View key={recommendation.domain} style={styles.recommendationSection}>
            <View style={styles.recommendationHeader}>
              <Text style={styles.recommendationTitle}>
                {recommendation.domain.charAt(0).toUpperCase() + recommendation.domain.slice(1)}: {recommendation.level.charAt(0).toUpperCase() + recommendation.level.slice(1)} Level
              </Text>
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              horizontal
              data={recommendation.courses}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.recommendedCourseCard}
                  onPress={() => handleCoursePress(item)}
                >
                  <Image
                    source={{ uri: item.thumbnail }}
                    style={styles.recommendedCourseImage}
                  />
                  <View style={styles.recommendedCourseContent}>
                    <Text style={styles.recommendedCourseTitle}>{item.title}</Text>
                    <View style={styles.courseMetaRow}>
                      <View style={styles.courseMetaItem}>
                        <Ionicons name="time-outline" size={14} color="#8E54E9" />
                        <Text style={styles.courseMetaText}>{item.duration}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={styles.emptyRecommendations}>
                  <Text style={styles.emptyRecommendationsText}>
                    No courses available for this recommendation yet.
                  </Text>
                </View>
              )}
            />
          </View>
        ))}
      </View>
    );
  };
  
  // Render enhanced features section
  const renderEnhancedFeatures = () => {
    return (
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Enhanced Features</Text>
          <TouchableOpacity
            style={styles.adaptiveInfoButton}
            onPress={() => navigation.navigate('EnhancedAvatarPerformanceDashboard' as never)}
          >
            <Ionicons name="information-circle-outline" size={20} color="#8E54E9" />
          </TouchableOpacity>
        </View>
        
        <EnhancedFeatureList 
          features={enhancedFeatures} 
          onFeaturePress={(feature) => {
            if (feature.screenName) {
              navigation.navigate(feature.screenName as never);
            }
          }}
        />
      </View>
    );
  };
  
  // Render categories section
  const renderCategories = () => {
    if (categories.length === 0) {
      return null;
    }
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Browse by Category</Text>
        {categories.map((category) => (
          <View key={category.id} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>{category.name}</Text>
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              horizontal
              data={category.courses}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.categoryCourseCard}
                  onPress={() => handleCoursePress(item)}
                >
                  <Image
                    source={{ uri: item.thumbnail }}
                    style={styles.categoryCourseImage}
                  />
                  <View style={styles.categoryCourseContent}>
                    <Text style={styles.categoryCourseTitle}>{item.title}</Text>
                    <View style={styles.courseMetaRow}>
                      <View style={styles.courseMetaItem}>
                        <Ionicons name="time-outline" size={14} color="#8E54E9" />
                        <Text style={styles.courseMetaText}>{item.duration}</Text>
                      </View>
                      <View style={[
                        styles.levelBadge,
                        styles[`level${item.level.charAt(0).toUpperCase() + item.level.slice(1)}`]
                      ]}>
                        <Text style={styles.levelText}>
                          {item.level.charAt(0).toUpperCase() + item.level.slice(1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        ))}
      </View>
    );
  };
  
  // Handle course selection
  const handleCoursePress = (course: Course) => {
    // In a real app, this would navigate to the course detail screen
    Alert.alert(
      `${course.title}`,
      `You selected a ${course.level} level course in the ${course.domain} domain. This would navigate to the course detail screen.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Enroll',
          onPress: () => {
            // In a real app, this would enroll the user in the course
            Alert.alert('Enrolled', `You have been enrolled in ${course.title}`);
          }
        }
      ]
    );
  };
  
  // Show onboarding if needed
  if (showOnboarding) {
    return <EnhancedOnboarding onComplete={handleOnboardingComplete} />;
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Learn</Text>
          <TouchableOpacity 
            style={styles.avatarButton}
            onPress={() => navigation.navigate('EnhancedAIClassroom' as never)}
          >
            <EnhancedAvatar size={50} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Main Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8E54E9" />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#8E54E9"]}
              tintColor="#8E54E9"
            />
          }
        >
          {renderEnhancedFeatures()}
          {renderFeaturedCourses()}
          {renderEnrolledCourses()}
          {renderAdaptiveRecommendations()}
          {renderCategories()}
          
          {/* Bottom Padding */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
      
      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('AIClassroom' as never)}
        >
          <LinearGradient
            colors={['#4776E6', '#8E54E9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.quickActionGradient}
          >
            <Ionicons name="school" size={20} color="#fff" />
            <Text style={styles.quickActionText}>AI Classroom</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('AdaptiveLearningDemo' as never)}
        >
          <LinearGradient
            colors={['#4776E6', '#8E54E9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.quickActionGradient}
          >
            <Ionicons name="analytics" size={20} color="#fff" />
            <Text style={styles.quickActionText}>Adaptive Learning</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Wrapper component that provides the EnhancedAvatarContext
const EnhancedLearnScreen: React.FC = () => {
  return (
    <EnhancedAvatarProvider>
      <EnhancedLearnScreenInner />
    </EnhancedAvatarProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    backgroundColor: '#1F1F1F',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  avatarButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  adaptiveInfoButton: {
    padding: 5,
  },
  featuredCourseCard: {
    width: 300,
    backgroundColor: '#1F1F1F',
    borderRadius: 15,
    overflow: 'hidden',
    marginRight: 15,
    marginBottom: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  featuredCourseImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  featuredCourseContent: {
    padding: 15,
  },
  featuredCourseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  courseMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseMetaText: {
    fontSize: 12,
    color: '#AAA',
    marginLeft: 5,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  levelBeginner: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: '#4CAF50',
  },
  levelIntermediate: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderColor: '#FF9800',
  },
  levelAdvanced: {
    backgroundColor: 'rgba(233, 30, 99, 0.1)',
    borderColor: '#E91E63',
  },
  levelExpert: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderColor: '#F44336',
  },
  levelText: {
    fontSize: 10,
    fontWeight: '600',
  },
  enrolledCourseCard: {
    width: 250,
    backgroundColor: '#1F1F1F',
    borderRadius: 15,
    overflow: 'hidden',
    marginRight: 15,
    marginBottom: 10,
  },
  enrolledCourseImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  enrolledCourseContent: {
    padding: 15,
  },
  enrolledCourseTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  progressContainer: {
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2.5,
    marginBottom: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#8E54E9',
    borderRadius: 2.5,
  },
  progressText: {
    fontSize: 12,
    color: '#AAA',
  },
  recommendationSection: {
    marginBottom: 20,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  viewAllButton: {
    padding: 5,
  },
  viewAllText: {
    fontSize: 14,
    color: '#8E54E9',
  },
  recommendedCourseCard: {
    width: 220,
    backgroundColor: '#1F1F1F',
    borderRadius: 15,
    overflow: 'hidden',
    marginRight: 15,
    marginBottom: 10,
  },
  recommendedCourseImage: {
    width: '100%',
    height: 110,
    resizeMode: 'cover',
  },
  recommendedCourseContent: {
    padding: 15,
  },
  recommendedCourseTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  emptyRecommendations: {
    width: 220,
    height: 110,
    backgroundColor: '#1F1F1F',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  emptyRecommendationsText: {
    fontSize: 14,
    color: '#AAA',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  categoryCourseCard: {
    width: 220,
    backgroundColor: '#1F1F1F',
    borderRadius: 15,
    overflow: 'hidden',
    marginRight: 15,
    marginBottom: 10,
  },
  categoryCourseImage: {
    width: '100%',
    height: 110,
    resizeMode: 'cover',
  },
  categoryCourseContent: {
    padding: 15,
  },
  categoryCourseTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  bottomPadding: {
    height: 100,
  },
  quickActionsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  quickActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default EnhancedLearnScreen;