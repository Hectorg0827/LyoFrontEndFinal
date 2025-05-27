import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";

import { RootStackParamList } from "../navigation/types";
import { useLearnStore } from "../store/learnStore";
import OfflineIndicator from "../components/OfflineIndicator";
import NetworkUtils from "../utils/networkUtils";

type Props = NativeStackScreenProps<RootStackParamList, "CourseDetailScreen">;

const CourseDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { courseId } = route.params as { courseId: string };
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState<"lessons" | "overview" | "discussion">("lessons");
  const { isConnected } = NetworkUtils.useNetworkStatus();
  const queryClient = useQueryClient();
  
  // Get course data from learn store
  const {
    activeCourse,
    activeLessons,
    isLoadingCourseDetails,
    isEnrolling,
    error,
    fetchCourseDetails,
    enrollInCourse,
    completeLesson,
    clearError,
  } = useLearnStore();
  
  // Fetch course details on component mount
  useEffect(() => {
    const loadCourse = async () => {
      try {
        await fetchCourseDetails(courseId);
      } catch (error) {
        console.error("Failed to load course details:", error);
      }
    };
    
    loadCourse();
  }, [courseId, fetchCourseDetails]);
  
  // Header animation styles
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [200, 80],
    extrapolate: "clamp",
  });
  
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 120],
    outputRange: [1, 0.5, 0],
    extrapolate: "clamp",
  });
  
  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [0, 60, 120],
    outputRange: [0, 0.5, 1],
    extrapolate: "clamp",
  });
  
  const headerInfoTranslateY = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, 30],
    extrapolate: "clamp",
  });
  
  // Handle enrollment
  const handleEnroll = async () => {
    if (!activeCourse) return;
    
    const success = await enrollInCourse(activeCourse.id);
    if (success) {
      Alert.alert(
        "Enrolled Successfully",
        `You've been enrolled in "${activeCourse.title}". Start your learning journey now!`
      );
    }
  };
  
  // Handle lesson completion
  const handleCompleteLesson = async (lessonId: string) => {
    if (!activeCourse) return;
    
    const success = await completeLesson(activeCourse.id, lessonId);
    if (success) {
      // Navigate to the next lesson or congratulate if it's the last one
      const currentIndex = activeLessons.findIndex(lesson => lesson.id === lessonId);
      const nextLesson = activeLessons[currentIndex + 1];
      
      if (nextLesson) {
        // Navigate to next lesson
        Alert.alert(
          "Lesson Completed",
          "Great job! Ready to continue to the next lesson?",
          [
            {
              text: "Later",
              style: "cancel"
            },
            {
              text: "Continue",
              onPress: () => {
                // Navigate to next lesson (implementation will depend on your navigation structure)
                console.log("Navigate to next lesson:", nextLesson.id);
              }
            }
          ]
        );
      } else {
        // Last lesson completed
        Alert.alert(
          "Course Completed!",
          "Congratulations! You've completed all lessons in this course.",
          [
            {
              text: "OK",
              onPress: () => {
                // Navigate to achievements or back to course list
              }
            }
          ]
        );
      }
    }
  };
  
  // Loading state
  if (isLoadingCourseDetails) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading course details...</Text>
      </SafeAreaView>
    );
  }
  
  // Error state
  if (error && !activeCourse) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={64} color="#e74c3c" />
        <Text style={styles.errorTitle}>Failed to load course</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            clearError();
            fetchCourseDetails(courseId);
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  // Course not found state
  if (!activeCourse) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Ionicons name="search-outline" size={64} color="#999" />
        <Text style={styles.errorTitle}>Course Not Found</Text>
        <Text style={styles.errorText}>The course you're looking for could not be found.</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <OfflineIndicator 
        onRefresh={() => {
          queryClient.invalidateQueries({ queryKey: ['courseDetails', courseId] });
          fetchCourseDetails(courseId);
        }}
      />
      
      {/* Animated Header */}
      <Animated.View 
        style={[
          styles.header, 
          { height: headerHeight }
        ]}
      >
        <Animated.Image
          source={{ uri: activeCourse.coverImage }}
          style={[
            styles.headerImage,
            { opacity: headerOpacity }
          ]}
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0)"]}
          style={styles.headerGradient}
        />
        
        {/* Back button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        {/* Header info */}
        <Animated.View 
          style={[
            styles.headerInfo,
            { 
              opacity: headerOpacity,
              transform: [{ translateY: headerInfoTranslateY }] 
            }
          ]}
        >
          <View style={styles.courseMetadata}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{activeCourse.level}</Text>
            </View>
            <View style={styles.duration}>
              <Ionicons name="time-outline" size={12} color="#fff" />
              <Text style={styles.durationText}>{activeCourse.duration}</Text>
            </View>
            <View style={styles.lessonCount}>
              <Ionicons name="list-outline" size={12} color="#fff" />
              <Text style={styles.lessonCountText}>{activeCourse.lessonsCount} lessons</Text>
            </View>
          </View>
        </Animated.View>
        
        {/* Fixed title that appears when scrolling */}
        <Animated.Text 
          style={[
            styles.fixedTitle,
            { opacity: headerTitleOpacity }
          ]}
          numberOfLines={1}
        >
          {activeCourse.title}
        </Animated.Text>
      </Animated.View>
      
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <View style={styles.courseInfoContainer}>
          <Text style={styles.courseTitle}>{activeCourse.title}</Text>
          <View style={styles.instructorContainer}>
            <Image 
              source={{ uri: activeCourse.author.avatar }} 
              style={styles.instructorImage} 
            />
            <Text style={styles.instructorName}>by {activeCourse.author.name}</Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${activeCourse.progress}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {activeCourse.progress}% complete
            </Text>
          </View>
          
          {activeCourse.progress === 0 && (
            <TouchableOpacity 
              style={[
                styles.enrollButton,
                isEnrolling && styles.enrollingButton
              ]}
              onPress={handleEnroll}
              disabled={isEnrolling}
            >
              {isEnrolling ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.enrollButtonText}>Enroll Now</Text>
              )}
            </TouchableOpacity>
          )}
          
          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[
                styles.tab,
                activeTab === "lessons" && styles.activeTab
              ]}
              onPress={() => setActiveTab("lessons")}
            >
              <Text 
                style={[
                  styles.tabText,
                  activeTab === "lessons" && styles.activeTabText
                ]}
              >
                Lessons
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.tab,
                activeTab === "overview" && styles.activeTab
              ]}
              onPress={() => setActiveTab("overview")}
            >
              <Text 
                style={[
                  styles.tabText,
                  activeTab === "overview" && styles.activeTabText
                ]}
              >
                Overview
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.tab,
                activeTab === "discussion" && styles.activeTab
              ]}
              onPress={() => setActiveTab("discussion")}
            >
              <Text 
                style={[
                  styles.tabText,
                  activeTab === "discussion" && styles.activeTabText
                ]}
              >
                Discussion
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Tab content */}
          {activeTab === "lessons" && (
            <View style={styles.lessonsContainer}>
              {activeLessons.map((lesson, index) => (
                <TouchableOpacity 
                  key={lesson.id}
                  style={[
                    styles.lessonItem,
                    lesson.completed && styles.completedLessonItem
                  ]}
                  onPress={() => {
                    if (activeCourse.progress > 0 || index === 0) {
                      // TODO: Navigate to lesson screen
                      console.log("Navigate to lesson:", lesson.id);
                    } else {
                      Alert.alert("Locked", "You need to enroll in this course first.");
                    }
                  }}
                >
                  <View style={styles.lessonNumber}>
                    <Text style={styles.lessonNumberText}>{index + 1}</Text>
                  </View>
                  
                  <View style={styles.lessonInfo}>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    <View style={styles.lessonMeta}>
                      <Ionicons name="time-outline" size={12} color="#999" />
                      <Text style={styles.lessonMetaText}>{lesson.duration}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.lessonStatus}>
                    {lesson.completed ? (
                      <Ionicons name="checkmark-circle" size={24} color="#2ecc71" />
                    ) : (
                      <TouchableOpacity
                        onPress={() => {
                          if (activeCourse.progress > 0 || index === 0) {
                            // TODO: Navigate to lesson
                          } else {
                            Alert.alert("Locked", "You need to enroll in this course first.");
                          }
                        }}
                      >
                        <Ionicons name="play-circle" size={24} color="#3498db" />
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {activeTab === "overview" && (
            <View style={styles.overviewContainer}>
              <Text style={styles.overviewTitle}>About this course</Text>
              <Text style={styles.overviewText}>{activeCourse.description}</Text>
              
              <View style={styles.tagsContainer}>
                <Text style={styles.tagsTitle}>Tags</Text>
                <View style={styles.tags}>
                  {activeCourse.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
              
              <View style={styles.instructorDetailContainer}>
                <Text style={styles.instructorDetailTitle}>About the instructor</Text>
                <View style={styles.instructorDetail}>
                  <Image 
                    source={{ uri: activeCourse.author.avatar }} 
                    style={styles.instructorDetailImage} 
                  />
                  <View style={styles.instructorInfo}>
                    <Text style={styles.instructorDetailName}>{activeCourse.author.name}</Text>
                    <Text style={styles.instructorDetailBio}>
                      Expert instructor with years of experience in teaching {activeCourse.tags[0]}.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
          
          {activeTab === "discussion" && (
            <View style={styles.discussionContainer}>
              <Text style={styles.discussionPlaceholder}>
                Discussion feature coming soon!
              </Text>
              <TouchableOpacity style={styles.createPostButton}>
                <Text style={styles.createPostButtonText}>Start a discussion</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
  },
  errorTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    color: "#999",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    zIndex: 1,
  },
  headerImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
  },
  backButton: {
    position: "absolute",
    top: 48,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  headerInfo: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
  },
  courseMetadata: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tag: {
    backgroundColor: "rgba(52, 152, 219, 0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  tagText: {
    color: "#fff",
    fontSize: 12,
    textTransform: "capitalize",
  },
  duration: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  durationText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 4,
  },
  lessonCount: {
    flexDirection: "row",
    alignItems: "center",
  },
  lessonCountText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 4,
  },
  fixedTitle: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 70,
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  contentContainer: {
    paddingTop: 220,
    paddingBottom: 40,
  },
  courseInfoContainer: {
    padding: 16,
  },
  courseTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  instructorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  instructorImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  instructorName: {
    color: "#ccc",
    fontSize: 14,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#333",
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3498db",
    borderRadius: 4,
  },
  progressText: {
    color: "#999",
    fontSize: 12,
    textAlign: "right",
  },
  enrollButton: {
    backgroundColor: "#3498db",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 24,
  },
  enrollingButton: {
    backgroundColor: "#2c3e50",
  },
  enrollButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#3498db",
  },
  tabText: {
    color: "#999",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#fff",
  },
  lessonsContainer: {
    marginBottom: 16,
  },
  lessonItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  completedLessonItem: {
    borderLeftWidth: 3,
    borderLeftColor: "#2ecc71",
  },
  lessonNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  lessonNumberText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 4,
  },
  lessonMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  lessonMetaText: {
    color: "#999",
    fontSize: 12,
    marginLeft: 4,
  },
  lessonStatus: {
    marginLeft: 8,
  },
  overviewContainer: {
    marginBottom: 16,
  },
  overviewTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  overviewText: {
    color: "#ccc",
    lineHeight: 22,
    marginBottom: 20,
  },
  tagsContainer: {
    marginBottom: 20,
  },
  tagsTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  instructorDetailContainer: {
    marginBottom: 20,
  },
  instructorDetailTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  instructorDetail: {
    flexDirection: "row",
    backgroundColor: "#111",
    borderRadius: 8,
    padding: 12,
  },
  instructorDetailImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  instructorInfo: {
    flex: 1,
  },
  instructorDetailName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  instructorDetailBio: {
    color: "#ccc",
    fontSize: 14,
    lineHeight: 20,
  },
  discussionContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  discussionPlaceholder: {
    color: "#999",
    marginBottom: 16,
  },
  createPostButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createPostButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default CourseDetailScreen;