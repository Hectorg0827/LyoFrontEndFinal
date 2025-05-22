import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  communityService,
  Event as ServiceEvent,
} from "../services/communityService";
import { enrollmentService } from "../services/enrollmentService";
import {
  learnService,
  Course as ServiceCourse,
  LearningTool as ServiceLearningTool,
} from "../services/learnService";

interface Course extends ServiceCourse {}

interface Event extends ServiceEvent {}

interface LearningTool extends ServiceLearningTool {}

interface SkillPath {
  id: string;
  title: string;
  description: string;
  duration: string;
  modules: number;
  imageUrl: string;
}

const skillPaths: SkillPath[] = [
  {
    id: "1",
    title: "Machine Learning Engineer",
    description: "Master the fundamentals of ML and build real-world projects",
    duration: "2 months",
    modules: 12,
    imageUrl: "https://picsum.photos/503/300",
  },
  {
    id: "2",
    title: "Full Stack Web Development",
    description: "Learn modern web development from frontend to backend",
    duration: "3 months",
    modules: 18,
    imageUrl: "https://picsum.photos/504/300",
  },
];

const LearnScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [learningTools, setLearningTools] = useState<LearningTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const enrolled = await learnService.getEnrolledCourses();
        setEnrolledCourses(enrolled as Course[]);

        const recommended = await learnService.getCourses();
        setRecommendedCourses(recommended as Course[]);

        const fetchedEvents = await communityService.getEvents(0, 0, 50);
        setEvents(fetchedEvents as Event[]);

        const tools = await learnService.getLearningTools();
        setLearningTools(tools as LearningTool[]);
      } catch (err: any) {
        setError(err.message || "Failed to fetch data");
        console.error("Failed to fetch learn screen data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const _handleEnrollCourse = async (courseId: string) => {
    try {
      await enrollmentService.enrollInCourse(courseId);
      alert("Enrollment successful!");
    } catch (err) {
      console.error("Enrollment failed:", err);
      alert("Enrollment failed. Please try again.");
    }
  };

  const handleAttendEvent = async (eventId: string) => {
    try {
      await communityService.attendEvent(eventId);
      alert("Successfully registered for the event!");
    } catch (err) {
      console.error("Failed to RSVP for event:", err);
      alert("Failed to RSVP. Please try again.");
    }
  };

  const formatEventDateTime = (startDate: string, _endDate: string) => {
    const start = new Date(startDate);
    return `${start.toLocaleDateString()} • ${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading content...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline-outline" size={48} color="#ff6b6b" />
          <Text style={styles.errorText}>Oops! Something went wrong.</Text>
          <Text style={styles.errorDetailText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              /* Implement retry logic, e.g., call fetchData() */
            }}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learn</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate("Settings")}
        >
          <Ionicons name="options-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Continue Learning Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Continue Learning</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.coursesContainer}
          >
            {enrolledCourses
              .filter((course) => course.progress && course.progress < 1)
              .map((course) => (
                <TouchableOpacity
                  key={course.id}
                  style={styles.courseCard}
                  onPress={() =>
                    navigation.navigate("CourseDetailScreen", {
                      courseId: course.id,
                    })
                  }
                >
                  <Image
                    source={{
                      uri:
                        course.coverImage ||
                        "https://picsum.photos/seed/default/500/300",
                    }}
                    style={styles.courseImage}
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.8)"]}
                    style={styles.courseGradient}
                  />
                  <View style={styles.courseContent}>
                    <View style={styles.levelBadge}>
                      <Text style={styles.levelText}>{course.level}</Text>
                    </View>
                    <Text style={styles.courseTitle}>{course.title}</Text>
                    <Text style={styles.courseAuthor}>
                      {course.author.name}
                    </Text>
                    <View style={styles.progressContainer}>
                      <View
                        style={[
                          styles.progressBar,
                          { width: `${(course.progress || 0) * 100}%` },
                        ]}
                      />
                      <Text style={styles.progressText}>
                        {Math.round((course.progress || 0) * 100)}%
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            {enrolledCourses.filter(
              (course) => course.progress && course.progress < 1,
            ).length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="school-outline" size={48} color="#666" />
                <Text style={styles.emptyStateText}>
                  Start a course to see your progress here
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Live & Upcoming Events Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Live & Upcoming</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("EventsScreen")}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.eventsContainer}
          >
            {events.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() =>
                  navigation.navigate("EventDetailScreen", {
                    eventId: event.id,
                  })
                }
              >
                <LinearGradient
                  colors={["#4A00E0", "#8E2DE2"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.eventGradient}
                >
                  <View style={styles.eventStatus}>
                    <View style={styles.liveDot} />
                    <Text style={styles.eventStatusText}>
                      {new Date(event.startDate) > new Date()
                        ? "UPCOMING"
                        : "LIVE"}
                    </Text>
                  </View>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={styles.eventTimeContainer}>
                    <Ionicons name="calendar-outline" size={14} color="#fff" />
                    <Text style={styles.eventTime}>
                      {formatEventDateTime(event.startDate, event.endDate)}
                    </Text>
                  </View>
                  <View style={styles.attendeesContainer}>
                    <Ionicons name="people-outline" size={14} color="#fff" />
                    <Text style={styles.attendeesText}>
                      {event.attendees} attending
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.remindButton}
                    onPress={() => handleAttendEvent(event.id)}
                    disabled={event.isAttending}
                  >
                    <Text style={styles.remindButtonText}>
                      {event.isAttending ? "Attending" : "Remind Me / RSVP"}
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              </TouchableOpacity>
            ))}
            {events.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color="#666" />
                <Text style={styles.emptyStateText}>
                  No upcoming events right now. Check back later!
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Recommended Courses Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended For You</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.coursesContainer}
          >
            {recommendedCourses.map((course) => (
              <TouchableOpacity
                key={course.id}
                style={styles.courseCard}
                onPress={() =>
                  navigation.navigate("CourseDetailScreen", {
                    courseId: course.id,
                  })
                }
              >
                <Image
                  source={{
                    uri:
                      course.coverImage ||
                      "https://picsum.photos/seed/default/501/300",
                  }}
                  style={styles.courseImage}
                />
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.8)"]}
                  style={styles.courseGradient}
                />
                <View style={styles.courseContent}>
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelText}>{course.level}</Text>
                  </View>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <Text style={styles.courseAuthor}>{course.author.name}</Text>
                  <View style={styles.courseInfo}>
                    <Ionicons name="time-outline" size={12} color="#aaa" />
                    <Text style={styles.courseInfoText}>{course.duration}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            {recommendedCourses.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color="#666" />
                <Text style={styles.emptyStateText}>
                  No recommendations right now. Explore more courses!
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Skill Paths Section (Still using mock data) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Skill Paths</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("SkillPathsScreen")}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {skillPaths.map((path) => (
            <TouchableOpacity
              key={path.id}
              style={styles.pathCard}
              onPress={() =>
                navigation.navigate("SkillPathDetailScreen", {
                  skillPathId: path.id,
                })
              }
            >
              <Image source={{ uri: path.imageUrl }} style={styles.pathImage} />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.9)"]}
                style={styles.pathGradient}
              />
              <View style={styles.pathContent}>
                <Text style={styles.pathTitle}>{path.title}</Text>
                <Text style={styles.pathDescription}>{path.description}</Text>
                <View style={styles.pathDetails}>
                  <View style={styles.pathDetailItem}>
                    <Ionicons name="time-outline" size={14} color="#aaa" />
                    <Text style={styles.pathDetailText}>{path.duration}</Text>
                  </View>
                  <View style={styles.pathDetailItem}>
                    <Ionicons name="layers-outline" size={14} color="#aaa" />
                    <Text style={styles.pathDetailText}>
                      {path.modules} modules
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.enrollButton}
                  onPress={() => alert(`Enroll in Skill Path: ${path.title}`)}
                >
                  <Text style={styles.enrollButtonText}>Explore Path</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
          \n{" "}
        </View>

        {/* Interactive Tools Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interactive Learning</Text>
          <View style={styles.toolsGrid}>
            {learningTools.map((tool, index) => {
              const toolIcons = ["help-circle", "albums", "cube", "code-slash"];
              const toolColors = [
                ["#FF416C", "#FF4B2B"],
                ["#4776E6", "#8E54E9"],
                ["#00c6ff", "#0072ff"],
                ["#16A085", "#2ECC71"],
              ];
              const iconName = tool.iconUrl
                ? null
                : (toolIcons[index % toolIcons.length] as any);
              const gradientColors = toolColors[index % toolColors.length];

              return (
                <TouchableOpacity
                  key={tool.id}
                  style={[styles.toolCard]}
                  onPress={() =>
                    tool.url
                      ? navigation.navigate("WebViewScreen", {
                          uri: tool.url,
                          title: tool.name,
                        })
                      : alert(`Open ${tool.name}`)
                  }
                >
                  <LinearGradient
                    colors={gradientColors}
                    style={styles.toolGradient}
                  >
                    {tool.iconUrl ? (
                      <Image
                        source={{ uri: tool.iconUrl }}
                        style={styles.toolIconImage}
                      />
                    ) : (
                      <Ionicons name={iconName} size={32} color="#fff" />
                    )}
                    <Text style={styles.toolTitle}>{tool.name}</Text>
                    <Text style={styles.toolDescription}>
                      {tool.description}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
            {learningTools.length === 0 && (
              <View style={[styles.emptyState, { width: "100%" }]}>
                <Ionicons name="construct-outline" size={48} color="#666" />
                <Text style={styles.emptyStateText}>
                  No learning tools available at the moment.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  seeAllText: {
    color: "#3498db",
    fontSize: 14,
  },
  coursesContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  courseCard: {
    width: 280,
    height: 180,
    marginRight: 16,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  courseImage: {
    width: "100%",
    height: "100%",
  },
  courseGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "70%",
  },
  courseContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  levelBadge: {
    backgroundColor: "rgba(52, 152, 219, 0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  levelText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  courseTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  courseAuthor: {
    color: "#ddd",
    fontSize: 12,
    marginBottom: 8,
  },
  courseInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  courseInfoText: {
    color: "#aaa",
    fontSize: 12,
    marginLeft: 4,
  },
  progressContainer: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    marginTop: 8,
    position: "relative",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#3498db",
    borderRadius: 2,
  },
  progressText: {
    position: "absolute",
    right: 0,
    bottom: 6,
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: 280,
    height: 180,
    backgroundColor: "#111",
    borderRadius: 12,
  },
  emptyStateText: {
    color: "#666",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  eventsContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  eventCard: {
    width: 220,
    height: 260,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 16,
  },
  eventGradient: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  eventStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ff375f",
    marginRight: 6,
  },
  eventStatusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  eventTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  eventTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  eventTime: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 6,
  },
  attendeesContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  attendeesText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 6,
  },
  remindButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  remindButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  pathCard: {
    height: 200,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  pathImage: {
    width: "100%",
    height: "100%",
  },
  pathGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "100%",
  },
  pathContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  pathTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  pathDescription: {
    color: "#ddd",
    fontSize: 14,
    marginBottom: 12,
  },
  pathDetails: {
    flexDirection: "row",
    marginBottom: 16,
  },
  pathDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  pathDetailText: {
    color: "#aaa",
    fontSize: 12,
    marginLeft: 4,
  },
  enrollButton: {
    backgroundColor: "#3498db",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  enrollButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  toolsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    justifyContent: "space-between",
  },
  toolCard: {
    width: "48%",
    height: 160,
    marginHorizontal: 4,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  toolGradient: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  toolTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 8,
  },
  toolDescription: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    lineHeight: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loadingText: {
    marginTop: 10,
    color: "#fff",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 20,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  errorDetailText: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#3498db",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  courseAuthor: {
    color: "#ddd",
    fontSize: 12,
    marginBottom: 8,
  },
  toolIconImage: {
    width: 32,
    height: 32,
    marginBottom: 8,
  },
});

export default LearnScreen;
