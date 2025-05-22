import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  FlatList,
  AppState,
  AppStateStatus,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAvatar } from "../components/Avatar/AvatarContext";
import { avatarService } from "../services/avatarService";
import { enrollmentService } from "../services/enrollmentService";
import { ErrorHandler, ErrorType } from "../services/errorHandler";
import { networkService } from "../services/networkService";
import { storageService } from "../services/storageService";

// Types for course data
interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  resources: string[];
  completed: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  modules: Module[];
  level: "beginner" | "intermediate" | "advanced";
  duration: string;
  progress: number;
  offlineAvailable?: boolean;
}

const AIClassroomScreen: React.FC = () => {
  const [topic, setTopic] = useState("");
  const [course, setCourse] = useState<Course | null>(null);
  const [step, setStep] = useState<"input" | "creating" | "result">("input");
  const [difficulty, setDifficulty] = useState<
    "beginner" | "intermediate" | "advanced"
  >("beginner");
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loadingEnrolled, setLoadingEnrolled] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [offlineAvailableCourses, setOfflineAvailableCourses] = useState<
    string[]
  >([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const appState = useRef(AppState.currentState);
  const navigation = useNavigation();
  const { setAvatarState } = useAvatar();

  // Load enrolled courses when screen mounts
  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  // Add network connectivity listener
  useEffect(() => {
    const unsubscribe = networkService.addNetworkListener((connected) => {
      setIsConnected(connected);
    });

    // Initialize network state
    networkService.isConnected().then(setIsConnected);

    return () => {
      unsubscribe();
    };
  }, []);

  // Add app state listener to handle background/foreground transitions
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, []);

  // Auto-sync enrolled courses when coming back online
  useEffect(() => {
    if (isConnected && offlineAvailableCourses.length > 0 && !isSyncing) {
      syncOfflineCourses();
    }
  }, [isConnected, offlineAvailableCourses, isSyncing]);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      // App has come to the foreground, refresh enrolled courses
      fetchEnrolledCourses();
    }
    appState.current = nextAppState;
  };

  // Fetch enrolled courses from backend
  const fetchEnrolledCourses = async () => {
    setLoadingEnrolled(true);
    try {
      const courses = await enrollmentService.getEnrolledCourses();
      setEnrolledCourses(courses);

      // Check for offline available courses
      const offlineCourses = courses
        .filter((course) => course.offlineAvailable)
        .map((course) => course.id);
      setOfflineAvailableCourses(offlineCourses);
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);

      // Handle different error types
      if (ErrorHandler.isErrorType(error, ErrorType.AUTHENTICATION)) {
        // User needs to authenticate - we can show this silently or with a small notification
        setEnrolledCourses([]);
      } else if (ErrorHandler.isErrorType(error, ErrorType.NETWORK)) {
        // Network connectivity issue
        ErrorHandler.handleError({
          type: ErrorType.NETWORK,
          message: "Failed to load enrolled courses due to network issues",
          error: error as Error,
        });
      } else {
        // General server or other error
        ErrorHandler.handleError({
          type: ErrorType.SERVER,
          message: "Failed to load enrolled courses",
          error: error as Error,
        });
      }
    } finally {
      setLoadingEnrolled(false);
    }
  };

  // Generate a course using the avatar service
  const generateCourse = async () => {
    if (!topic.trim()) {
      return; // Don't proceed if topic is empty
    }

    setStep("creating");
    setAvatarState("processing");

    try {
      // Use avatar service to generate the course
      const newCourse = await avatarService.generateCourse(topic, difficulty);
      setCourse(newCourse);
      setStep("result");

      // Ask the avatar to introduce the course
      const introMessage = `I've created a ${difficulty} level course on ${topic} for you. It's a ${newCourse.duration} course covering everything from basic concepts to advanced applications. Would you like me to walk you through the modules?`;
      await avatarService.speakResponse(introMessage);
    } catch (error) {
      console.error("Error generating course:", error);

      // Handle errors gracefully
      ErrorHandler.handleError({
        type: ErrorType.AI_SERVICE,
        message: "Failed to generate course",
        error: error as Error,
        context: { topic, difficulty },
      });

      // Show error message to user through the avatar
      avatarService.speakResponse(
        "I encountered an issue creating your course. Please try again with a different topic or check your connection.",
      );
    } finally {
      setAvatarState("idle");
    }
  };

  // Add enrollment functionality to connect with backend
  const enrollInCourse = async () => {
    if (!course) return;

    try {
      setAvatarState("processing");

      // Use the enrollment service to enroll the user in the course
      await enrollmentService.enrollInCourse(course);

      // Refresh the enrolled courses list
      await fetchEnrolledCourses();

      // Use the avatar to give feedback to the user
      const enrollMessage = `You're now enrolled in "${course.title}"! You can access all ${course.modules.length} modules and track your progress. Would you like to start with the first module now?`;
      await avatarService.speakResponse(enrollMessage);

      // Optionally navigate to the enrolled courses section
      setStep("input");
    } catch (error) {
      console.error("Error enrolling in course:", error);

      // Check if it's an authentication error
      if (ErrorHandler.isErrorType(error, ErrorType.AUTHENTICATION)) {
        const authMessage =
          "You need to be logged in to enroll in courses. Would you like to sign in now?";
        await avatarService.speakResponse(authMessage);
        // Could navigate to login screen here
      } else if (ErrorHandler.isErrorType(error, ErrorType.NETWORK)) {
        // Network connectivity issue
        const networkMessage =
          "I couldn't connect to our servers to enroll you in the course. Please check your internet connection and try again.";
        await avatarService.speakResponse(networkMessage);

        ErrorHandler.handleError({
          type: ErrorType.NETWORK,
          message: "Failed to enroll in course due to network issues",
          error: error as Error,
        });
      } else {
        // Handle other enrollment errors
        ErrorHandler.handleError({
          type: ErrorType.SERVER,
          message: "Failed to enroll in course",
          error: error as Error,
        });

        avatarService.speakResponse(
          "I encountered an issue enrolling you in this course. Please try again later.",
        );
      }
    } finally {
      setAvatarState("idle");
    }
  };

  // Handle module completion
  const markModuleAsCompleted = async (courseId: string, moduleId: string) => {
    try {
      setAvatarState("processing");

      // Use the enrollment service to mark the module as completed
      await enrollmentService.completeModule(courseId, moduleId);

      // Update the current course if it's the one we're viewing
      if (course && course.id === courseId) {
        // Find and update the module's completion status
        const updatedModules = course.modules.map((module) =>
          module.id === moduleId ? { ...module, completed: true } : module,
        );

        // Calculate new progress based on completed modules
        const completedCount = updatedModules.filter((m) => m.completed).length;
        const totalModules = updatedModules.length;
        const newProgress = Math.round((completedCount / totalModules) * 100);

        // Update the course state
        setCourse({
          ...course,
          modules: updatedModules,
          progress: newProgress,
        });

        // Update the progress in the backend
        await enrollmentService.updateCourseProgress(courseId, newProgress);
      }

      // Refresh enrolled courses to show updated progress
      await fetchEnrolledCourses();

      // Use the avatar to give feedback
      avatarService.speakResponse(
        "Great job! I've marked this module as completed.",
      );
    } catch (error) {
      console.error("Error marking module as completed:", error);

      if (ErrorHandler.isErrorType(error, ErrorType.AUTHENTICATION)) {
        const authMessage =
          "You need to be logged in to track your progress. Would you like to sign in now?";
        await avatarService.speakResponse(authMessage);
      } else if (ErrorHandler.isErrorType(error, ErrorType.NETWORK)) {
        avatarService.speakResponse(
          "I couldn't connect to our servers to update your progress. I'll try again when you're back online.",
        );

        ErrorHandler.handleError({
          type: ErrorType.NETWORK,
          message: "Failed to complete module due to network issues",
          error: error as Error,
        });
      } else {
        ErrorHandler.handleError({
          type: ErrorType.SERVER,
          message: "Failed to mark module as completed",
          error: error as Error,
        });

        avatarService.speakResponse(
          "I encountered an issue updating your progress. Please try again later.",
        );
      }
    } finally {
      setAvatarState("idle");
    }
  };

  // Sync offline courses with the server
  const syncOfflineCourses = async () => {
    setIsSyncing(true);
    try {
      // For each offline available course, enroll the user and update progress
      for (const courseId of offlineAvailableCourses) {
        // Fetch the course details from local storage
        const offlineCourse = await storageService.getCourse(courseId);
        if (!offlineCourse) continue;

        // Enroll in the course
        await enrollmentService.enrollInCourse(offlineCourse);

        // Update progress for each completed module
        for (const module of offlineCourse.modules) {
          if (module.completed) {
            await enrollmentService.completeModule(courseId, module.id);
          }
        }

        // Optionally, you could also update the overall course progress here
        const completedCount = offlineCourse.modules.filter(
          (m) => m.completed,
        ).length;
        const totalModules = offlineCourse.modules.length;
        const newProgress = Math.round((completedCount / totalModules) * 100);
        await enrollmentService.updateCourseProgress(courseId, newProgress);
      }

      // After syncing, refresh the enrolled courses
      await fetchEnrolledCourses();

      avatarService.speakResponse(
        "Your offline progress has been synced successfully!",
      );
    } catch (error) {
      console.error("Error syncing offline courses:", error);

      ErrorHandler.handleError({
        type: ErrorType.SERVER,
        message: "Failed to sync offline courses",
        error: error as Error,
      });

      avatarService.speakResponse(
        "I encountered an issue syncing your offline courses. Please try again later.",
      );
    } finally {
      setIsSyncing(false);
    }
  };

  // Render the list of enrolled courses
  const renderEnrolledCourses = () => {
    if (enrolledCourses.length === 0 && !loadingEnrolled) {
      return (
        <View style={styles.noCoursesContainer}>
          <Text style={styles.noCoursesText}>
            You haven't enrolled in any courses yet.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.enrolledContainer}>
        <Text style={styles.sectionTitle}>Your Enrolled Courses</Text>
        {loadingEnrolled ? (
          <ActivityIndicator size="small" color="#8E54E9" />
        ) : (
          <FlatList
            data={enrolledCourses}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.enrolledCourseCard}
                onPress={() => {
                  // In a production app, this would navigate to the course detail screen
                  setCourse(item);
                  setStep("result");
                }}
              >
                <View style={styles.courseCardHeader}>
                  <Text
                    style={[
                      styles.difficulty,
                      item.level === "beginner" && styles.difficultyBeginner,
                      item.level === "intermediate" &&
                        styles.difficultyIntermediate,
                      item.level === "advanced" && styles.difficultyAdvanced,
                    ]}
                  >
                    <Text
                      style={[
                        styles.difficultyText,
                        item.level === "beginner" &&
                          styles.difficultyTextBeginner,
                        item.level === "intermediate" &&
                          styles.difficultyTextIntermediate,
                        item.level === "advanced" &&
                          styles.difficultyTextAdvanced,
                      ]}
                    >
                      {item.level}
                    </Text>
                  </Text>
                </View>
                <Text style={styles.enrolledCourseTitle}>{item.title}</Text>
                <Text style={styles.courseDuration}>{item.duration}</Text>
                <View style={styles.progressContainer}>
                  <View
                    style={[styles.progressBar, { width: `${item.progress}%` }]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {item.progress}% Complete
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    );
  };

  // Render network status indicator
  const renderNetworkStatus = () => {
    if (isConnected) return null;

    return (
      <View style={styles.offlineContainer}>
        <Ionicons name="cloud-offline-outline" size={16} color="#fff" />
        <Text style={styles.offlineText}>You are offline</Text>
      </View>
    );
  };

  const renderInputStep = () => (
    <View style={styles.inputContainer}>
      {renderEnrolledCourses()}

      <Text style={styles.inputLabel}>What would you like to learn about?</Text>
      <TextInput
        style={styles.topicInput}
        placeholder="e.g., Quantum Physics, Machine Learning, Art History..."
        placeholderTextColor="#666"
        value={topic}
        onChangeText={setTopic}
      />

      <Text style={styles.difficultyLabel}>Select difficulty level:</Text>
      <View style={styles.difficultyOptions}>
        {(["beginner", "intermediate", "advanced"] as const).map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.difficultyOption,
              difficulty === level && styles.selectedDifficulty,
            ]}
            onPress={() => setDifficulty(level)}
          >
            <Text
              style={[
                styles.difficultyText,
                difficulty === level && styles.selectedDifficultyText,
              ]}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.generateButton, !topic.trim() && styles.disabledButton]}
        onPress={generateCourse}
        disabled={!topic.trim()}
      >
        <LinearGradient
          colors={["#4776E6", "#8E54E9"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.generateButtonGradient}
        >
          <Text style={styles.generateButtonText}>Create My Course</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderCreatingStep = () => (
    <View style={styles.creatingContainer}>
      <ActivityIndicator size="large" color="#8E54E9" />
      <Text style={styles.creatingText}>
        Lyo is creating your personalized course...
      </Text>
      <Text style={styles.creatingSubtext}>This may take a moment</Text>
    </View>
  );

  const renderResultStep = () => {
    if (!course) return null;

    return (
      <View style={styles.resultContainer}>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <Text style={styles.courseDescription}>{course.description}</Text>

        <View style={styles.courseMetadata}>
          <View style={styles.metadataItem}>
            <Ionicons name="time-outline" size={20} color="#8E54E9" />
            <Text style={styles.metadataText}>{course.duration}</Text>
          </View>
          <View style={styles.metadataItem}>
            <Ionicons name="school-outline" size={20} color="#8E54E9" />
            <Text style={styles.metadataText}>
              {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
            </Text>
          </View>
          <View style={styles.metadataItem}>
            <Ionicons name="book-outline" size={20} color="#8E54E9" />
            <Text style={styles.metadataText}>
              {course.modules.length} modules
            </Text>
          </View>
        </View>

        <Text style={styles.modulesTitle}>Course Modules</Text>
        <FlatList
          data={course.modules}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View
              style={[
                styles.moduleCard,
                item.completed && styles.moduleCardCompleted,
              ]}
            >
              <View style={styles.moduleHeader}>
                <Text style={styles.moduleTitle}>
                  {item.title}
                  {item.completed && (
                    <Text style={styles.completedBadge}> (Completed)</Text>
                  )}
                </Text>
                <Text style={styles.moduleDuration}>{item.duration}</Text>
              </View>
              <Text style={styles.moduleDescription}>{item.description}</Text>
              <View style={styles.resourcesContainer}>
                <Text style={styles.resourcesTitle}>Resources:</Text>
                {item.resources.map((resource, index) => (
                  <View key={index} style={styles.resourceItem}>
                    <Ionicons
                      name="document-text-outline"
                      size={16}
                      color="#8E54E9"
                    />
                    <Text style={styles.resourceText}>{resource}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.completeModuleButton,
                  item.completed && styles.completeModuleButtonDisabled,
                ]}
                onPress={() => markModuleAsCompleted(course.id, item.id)}
                disabled={item.completed}
              >
                <Text
                  style={[
                    styles.completeModuleText,
                    item.completed && styles.completeModuleTextDisabled,
                  ]}
                >
                  {item.completed ? "Completed" : "Mark as Completed"}
                </Text>
                {item.completed && (
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color="#4CAF50"
                    style={styles.completeIcon}
                  />
                )}
              </TouchableOpacity>
            </View>
          )}
        />

        <TouchableOpacity style={styles.enrollButton} onPress={enrollInCourse}>
          <LinearGradient
            colors={["#4776E6", "#8E54E9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.enrollButtonGradient}
          >
            <Text style={styles.enrollButtonText}>Enroll in Course</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.startOverButton}
          onPress={() => setStep("input")}
        >
          <Text style={styles.startOverText}>Create Another Course</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Classroom</Text>
        <View style={styles.placeholderView} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === "input" && renderInputStep()}
        {step === "creating" && renderCreatingStep()}
        {step === "result" && renderResultStep()}
      </ScrollView>

      {/* Refresh enrolled courses when returning to this screen */}
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={fetchEnrolledCourses}
      >
        <Ionicons name="refresh" size={20} color="#8E54E9" />
      </TouchableOpacity>

      {renderNetworkStatus()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  placeholderView: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  inputContainer: {
    flex: 1,
    justifyContent: "center",
  },
  inputLabel: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  topicInput: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    padding: 15,
    color: "#fff",
    fontSize: 16,
    marginBottom: 30,
  },
  difficultyLabel: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  difficultyOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  difficultyOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: 5,
    alignItems: "center",
  },
  selectedDifficulty: {
    backgroundColor: "rgba(142, 84, 233, 0.3)",
    borderWidth: 1,
    borderColor: "#8E54E9",
  },
  difficultyText: {
    color: "#ccc",
    fontWeight: "500",
  },
  selectedDifficultyText: {
    color: "#fff",
  },
  generateButton: {
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  generateButtonGradient: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  generateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  creatingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  creatingText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    textAlign: "center",
  },
  creatingSubtext: {
    color: "#888",
    marginTop: 10,
    textAlign: "center",
  },
  resultContainer: {
    flex: 1,
  },
  courseTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 10,
  },
  courseDescription: {
    color: "#ccc",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  courseMetadata: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 10,
    padding: 15,
    marginBottom: 25,
  },
  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metadataText: {
    color: "#ccc",
    marginLeft: 8,
  },
  modulesTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
  },
  moduleCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  moduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  moduleTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  moduleDuration: {
    color: "#8E54E9",
    fontSize: 14,
  },
  moduleDescription: {
    color: "#ccc",
    marginBottom: 15,
  },
  resourcesContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 8,
    padding: 10,
  },
  resourcesTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  resourceItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 3,
  },
  resourceText: {
    color: "#ccc",
    marginLeft: 8,
  },
  enrollButton: {
    marginTop: 20,
  },
  enrollButtonGradient: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  enrollButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  startOverButton: {
    marginTop: 15,
    padding: 15,
    alignItems: "center",
  },
  startOverText: {
    color: "#8E54E9",
    fontSize: 16,
  },
  noCoursesContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 10,
    marginTop: 30,
  },
  noCoursesText: {
    color: "#ccc",
    fontSize: 16,
  },
  enrolledContainer: {
    marginTop: 30,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  enrolledCourseCard: {
    backgroundColor: "rgba(142, 84, 233, 0.15)",
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    width: 240,
  },
  courseCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  enrolledCourseTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  courseDuration: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 10,
  },
  progressContainer: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#8E54E9",
    borderRadius: 3,
  },
  progressText: {
    color: "#ccc",
    fontSize: 12,
  },
  refreshButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 50,
    padding: 10,
  },
  difficulty: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  difficultyBeginner: {
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    borderColor: "#4CAF50",
    borderWidth: 1,
  },
  difficultyIntermediate: {
    backgroundColor: "rgba(255, 152, 0, 0.2)",
    borderColor: "#FF9800",
    borderWidth: 1,
  },
  difficultyAdvanced: {
    backgroundColor: "rgba(244, 67, 54, 0.2)",
    borderColor: "#F44336",
    borderWidth: 1,
  },
  difficultyText: {
    color: "#ccc",
    fontWeight: "500",
    fontSize: 12,
    textTransform: "uppercase",
  },
  difficultyTextBeginner: {
    color: "#4CAF50",
  },
  difficultyTextIntermediate: {
    color: "#FF9800",
  },
  difficultyTextAdvanced: {
    color: "#F44336",
  },
  offlineContainer: {
    position: "absolute",
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: "rgba(244, 67, 54, 0.8)",
    borderRadius: 8,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  offlineText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "500",
  },
  moduleCardCompleted: {
    borderLeftColor: "#4CAF50",
    borderLeftWidth: 3,
  },
  completedBadge: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "normal",
  },
  completeModuleButton: {
    backgroundColor: "rgba(142, 84, 233, 0.2)",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },
  completeModuleButtonDisabled: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderColor: "#4CAF50",
    borderWidth: 1,
  },
  completeModuleText: {
    color: "#8E54E9",
    fontWeight: "500",
  },
  completeModuleTextDisabled: {
    color: "#4CAF50",
  },
  completeIcon: {
    marginLeft: 6,
  },
});

export default AIClassroomScreen;
