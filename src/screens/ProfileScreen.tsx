import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { feedService, FeedPost } from "../services/feedService";
import { learnService, Course } from "../services/learnService";
import {
  userService,
  UserProfile,
  Achievement as UserAchievement,
  BookshelfItem,
} from "../services/userService";

const ProfileScreen: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState("posts");

  const {
    data: profileData,
    isLoading: isLoadingProfile,
    isError: isErrorProfile,
    error: profileError,
  } = useQuery<UserProfile, Error>({
    queryKey: ["currentUserProfile"],
    queryFn: userService.getCurrentProfile,
  });

  const {
    data: achievementsData,
    isLoading: isLoadingAchievements,
    isError: isErrorAchievements,
    error: achievementsError,
  } = useQuery<UserAchievement[], Error>({
    queryKey: ["userAchievements"],
    queryFn: userService.getAchievements,
  });

  const {
    data: userPostsData,
    isLoading: isLoadingUserPosts,
    isError: isErrorUserPosts,
    error: userPostsError,
  } = useQuery<FeedPost[], Error>({
    queryKey: ["userPosts", profileData?.id],
    queryFn: async () => {
      if (!profileData?.id) {
        return [];
      }
      // Assuming getFeed fetches all posts and we filter, or ideally it would take a userId
      const feedResponse = await feedService.getFeed(); // Adjusted: Call without arguments or with (undefined, limit)
      return feedResponse.posts.filter(
        (post) => post.userId === profileData.id,
      );
    },
    enabled: !!profileData?.id, // Only run if profileData.id is available
  });

  const {
    data: bookshelfData,
    isLoading: isLoadingBookshelf,
    isError: isErrorBookshelf,
    error: bookshelfError,
  } = useQuery<BookshelfItem[], Error>({
    queryKey: ["userBookshelf"] as const, // Added 'as const' for stricter key typing
    queryFn: () => userService.getBookshelf(), // Explicitly wrapped in arrow function
  });

  const {
    data: enrolledCoursesData,
    isLoading: isLoadingEnrolledCourses,
    isError: isErrorEnrolledCourses,
    error: enrolledCoursesError,
  } = useQuery<Course[], Error>({
    queryKey: ["userEnrolledCourses"],
    queryFn: learnService.getEnrolledCourses,
  });

  const completedCourses = React.useMemo(() => {
    if (!enrolledCoursesData) {
      return [];
    }
    // Assuming Course interface has a 'completed' boolean field or similar
    // For example, if progress is 100, it's completed.
    // Adjust this logic based on the actual structure of the Course object.
    return enrolledCoursesData.filter((course) => course.progress === 100);
  }, [enrolledCoursesData]);

  if (isLoadingProfile || isLoadingAchievements) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#fff" />
      </SafeAreaView>
    );
  }

  if (isErrorProfile || isErrorAchievements) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>
          Failed to load profile data.{" "}
          {profileError?.message || achievementsError?.message}
        </Text>
      </SafeAreaView>
    );
  }

  // Helper to render tab content with loading/error states
  const renderTabContent = (
    isLoading: boolean,
    isError: boolean,
    error: Error | null,
    data: any[] | undefined,
    renderItems: () => React.ReactNode,
    emptyMessage: string,
  ) => {
    if (isLoading) {
      return (
        <ActivityIndicator
          style={{ marginBlockStart: 20 }}
          size="small"
          color="#fff"
        />
      );
    }
    if (isError) {
      return (
        <Text style={[styles.errorText, { marginBlockStart: 20 }]}>
          Error: {error?.message || "Could not load items."}
        </Text>
      );
    }
    if (!data || data.length === 0) {
      return <Text style={styles.noItemsText}>{emptyMessage}</Text>;
    }
    return renderItems();
  };

  const userStatsToDisplay = profileData?.stats
    ? [
        {
          label: "Courses Completed",
          value: profileData.stats.coursesCompleted,
        },
        {
          label: "Lessons Completed",
          value: profileData.stats.lessonsCompleted,
        },
        { label: "Events Attended", value: profileData.stats.eventsAttended },
        { label: "Posts Created", value: profileData.stats.postsCreated },
        {
          label: "Current Streak",
          value: `${profileData.stats.daysStreak} days`,
        },
        {
          label: "Minutes Learned",
          value: `${Math.round((profileData.stats.minutesLearned || 0) / 60)}h`,
        },
      ]
    : [
        { label: "Courses Completed", value: 0 },
        { label: "Total Hours", value: "0h" },
        { label: "Current Streak", value: "0 days" },
      ]; // Fallback to default stats

  const xpLevel = profileData?.stats?.xpLevel || 0;
  const currentXp = profileData?.stats?.currentXp || 0;
  const nextLevelXp = profileData?.stats?.nextLevelXp || 1000;
  const xpProgress = nextLevelXp > 0 ? (currentXp / nextLevelXp) * 100 : 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity>
          <Ionicons name="share-social-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri: profileData?.avatar || "https://placekitten.com/300/300",
              }}
              style={styles.profileImage}
            />
            <View style={styles.badgeContainer}>
              <LinearGradient
                colors={["#4776E6", "#8E54E9"]}
                style={styles.verifiedBadge}
              >
                <Ionicons name="checkmark" size={12} color="#fff" />
              </LinearGradient>
            </View>
          </View>

          <Text style={styles.userName}>
            {profileData?.name || "User Name"}
          </Text>
          <Text style={styles.userBio}>
            {profileData?.bio || "User bio not available."}
          </Text>

          <View style={styles.statsContainer}>
            {userStatsToDisplay.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsContainer}>
            {achievementsData && achievementsData.length > 0 ? (
              achievementsData.map((achievement) => (
                <View key={achievement.id} style={styles.achievementItem}>
                  <View style={styles.achievementIcon}>
                    {achievement.iconUrl &&
                    achievement.iconUrl.startsWith("http") ? (
                      <Image
                        source={{ uri: achievement.iconUrl }}
                        style={styles.achievementImage}
                      />
                    ) : (
                      <Ionicons
                        name={(achievement.iconUrl as any) || "ribbon-outline"}
                        size={24}
                        color="#fff"
                      />
                    )}
                  </View>
                  <Text style={styles.achievementName}>
                    {achievement.title}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noItemsText}>No achievements yet.</Text>
            )}
          </View>
        </View>

        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Learning Progress</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Your XP Level</Text>
              <Text style={styles.progressValue}>Level {xpLevel}</Text>
            </View>
            <View style={styles.xpProgressContainer}>
              <View
                style={[styles.xpProgressBar, { width: `${xpProgress}%` }]}
              />
              <Text style={styles.xpProgressText}>
                {currentXp} / {nextLevelXp} XP
              </Text>
            </View>
            <Text style={styles.progressHelperText}>
              {nextLevelXp - currentXp} XP more to reach Level {xpLevel + 1}
            </Text>
          </View>
        </View>

        <View style={styles.tabsSection}>
          <View style={styles.tabsBar}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "posts" && styles.activeTab]}
              onPress={() => setActiveTab("posts")}
            >
              <Ionicons
                name="grid-outline"
                size={22}
                color={activeTab === "posts" ? "#fff" : "#777"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "saved" && styles.activeTab]}
              onPress={() => setActiveTab("saved")}
            >
              <Ionicons
                name="bookmark-outline"
                size={22}
                color={activeTab === "saved" ? "#fff" : "#777"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "completed" && styles.activeTab,
              ]}
              onPress={() => setActiveTab("completed")}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={22}
                color={activeTab === "completed" ? "#fff" : "#777"}
              />
            </TouchableOpacity>
          </View>

          {activeTab === "posts" && (
            <View style={styles.tabContent}>
              {renderTabContent(
                isLoadingUserPosts,
                isErrorUserPosts,
                userPostsError,
                userPostsData,
                () => (
                  <View style={styles.postsGrid}>
                    {userPostsData?.map((post) => (
                      <TouchableOpacity key={post.id} style={styles.postItem}>
                        <Image
                          source={{
                            uri:
                              post.imageUrl ||
                              `https://picsum.photos/500/500?random=${post.id}`,
                          }}
                          style={styles.postImage}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                ),
                "No posts yet.",
              )}
            </View>
          )}

          {activeTab === "saved" && (
            <View style={styles.tabContent}>
              {renderTabContent(
                isLoadingBookshelf,
                isErrorBookshelf,
                bookshelfError,
                bookshelfData,
                () => (
                  <View style={styles.savedGrid}>
                    {bookshelfData?.map((item) => (
                      <TouchableOpacity key={item.id} style={styles.savedItem}>
                        <Image
                          source={{
                            uri:
                              item.imageUrl ||
                              `https://picsum.photos/500/300?random=${item.id}`,
                          }} // Changed from item.coverImage to item.imageUrl
                          style={styles.savedImage}
                        />
                        <LinearGradient
                          colors={["transparent", "rgba(0,0,0,0.8)"]}
                          style={styles.savedGradient}
                        />
                        <View style={styles.savedInfo}>
                          <Text style={styles.savedType}>
                            {item.type.toUpperCase()}
                          </Text>
                          <Text style={styles.savedTitle}>{item.title}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                ),
                "No saved items yet.",
              )}
            </View>
          )}

          {activeTab === "completed" && (
            <View style={styles.tabContent}>
              {renderTabContent(
                isLoadingEnrolledCourses, // We use the loading state for all enrolled courses
                isErrorEnrolledCourses,
                enrolledCoursesError,
                completedCourses,
                () => (
                  <View style={styles.completedList}>
                    {completedCourses.map((course) => (
                      <View key={course.id} style={styles.completedItem}>
                        <Image
                          source={{
                            uri:
                              course.coverImage ||
                              `https://picsum.photos/100/100?random=${course.id}`,
                          }} // Changed from course.thumbnailUrl to course.coverImage
                          style={styles.completedImage}
                        />
                        <View style={styles.completedInfo}>
                          <Text style={styles.completedType}>COURSE</Text>
                          <Text style={styles.completedTitle}>
                            {course.title}
                          </Text>
                          <View style={styles.completedMeta}>
                            <Ionicons
                              name="time-outline"
                              size={12}
                              color="#999"
                            />
                            {/* Assuming course.completedDate or similar exists */}
                            <Text style={styles.completedMetaText}>
                              Completed{" "}
                              {/* on {new Date(course.completedDate).toLocaleDateString()} */}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.completedBadge}>
                          <Ionicons name="trophy" size={24} color="#FFD700" />
                        </View>
                      </View>
                    ))}
                  </View>
                ),
                "No completed courses yet.",
              )}
            </View>
          )}
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
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    paddingInline: 20,
  },
  noItemsText: {
    color: "#999",
    textAlign: "center",
    marginBlockStart: 20,
    fontSize: 16,
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
    fontSize: 18,
    fontWeight: "600",
  },
  profileHeader: {
    alignItems: "center",
    paddingBlockStart: 20,
    paddingBlockEnd: 24,
  },
  profileImageContainer: {
    position: "relative",
    marginBlockEnd: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#3498db",
  },
  badgeContainer: {
    position: "absolute",
    insetBlockEnd: 0,
    insetInlineEnd: 0,
  },
  verifiedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  userName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBlockEnd: 4,
  },
  userBio: {
    color: "#999",
    textAlign: "center",
    paddingInline: 32,
    marginBlockEnd: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingInline: 16,
    marginBlockEnd: 24,
    flexWrap: "wrap", // Added for better layout on smaller screens
  },
  statItem: {
    alignItems: "center",
    minWidth: "30%", // Ensure items have some minimum width
    marginBlockEnd: 15, // Increased margin for wrapped items
    paddingInline: 5, // Add horizontal padding for each item
  },
  statValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  statLabel: {
    color: "#999",
    fontSize: 12,
    marginBlockStart: 4,
    textAlign: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginInlineEnd: 12,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  shareButton: {
    backgroundColor: "#222",
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  achievementsSection: {
    paddingHorizontal: 16,
    marginBlockEnd: 24,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBlockEnd: 16,
  },
  achievementsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  achievementItem: {
    width: "48%", // Adjusted for spacing
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 12, // Reduced padding slightly
    marginBlockEnd: 12, // Reduced margin slightly
    flexDirection: "row",
    alignItems: "center",
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
    marginInlineEnd: 10, // Reduced margin slightly
  },
  achievementImage: {
    // Style for achievement icon when it's an image
    width: 24,
    height: 24,
    borderRadius: 12, // Optional: if you want circular image icons
  },
  achievementName: {
    color: "#fff",
    fontWeight: "600",
    flexShrink: 1,
  },
  progressSection: {
    paddingHorizontal: 16,
    marginBlockEnd: 24,
  },
  progressCard: {
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBlockEnd: 12,
  },
  progressTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  progressValue: {
    color: "#3498db",
    fontSize: 18,
    fontWeight: "700",
  },
  xpProgressContainer: {
    height: 10, // Slightly thicker bar
    backgroundColor: "#333",
    borderRadius: 5,
    marginBlockEnd: 8,
    position: "relative",
    overflow: "hidden", // Ensure progress bar stays within bounds
  },
  xpProgressBar: {
    height: "100%",
    backgroundColor: "#3498db",
    borderRadius: 5,
  },
  xpProgressText: {
    color: "#fff", // Changed to white for better visibility on dark bar
    fontSize: 8, // Smaller text for XP values
    fontWeight: "bold",
    textAlign: "center",
    position: "absolute",
    width: "100%",
    lineHeight: 10, // Match bar height
  },
  progressHelperText: {
    color: "#999",
    fontSize: 12,
    textAlign: "center",
    marginBlockStart: 8,
  },
  tabsSection: {
    marginBlockStart: 16,
    paddingHorizontal: 16, // Keep consistent padding
    marginBlockEnd: 24,
  },
  tabsBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#111",
    borderRadius: 8,
    paddingVertical: 8, // Add some vertical padding inside the bar
    marginBlockEnd: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center", // Center icon in tab
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: "#3498db",
  },
  tabContent: {
    // Minimal styling for now, content will define its own layout
  },
  postsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  postItem: {
    width: "32%",
    aspectRatio: 1,
    marginBlockEnd: "2%",
    backgroundColor: "#222",
    borderRadius: 8,
  },
  postImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  savedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  savedItem: {
    width: "48%",
    aspectRatio: 0.75,
    marginBlockEnd: 16,
    borderRadius: 8,
    backgroundColor: "#222",
    overflow: "hidden",
  },
  savedImage: {
    width: "100%",
    height: "100%",
  },
  savedGradient: {
    position: "absolute",
    insetInlineStart: 0,
    insetInlineEnd: 0,
    insetBlockEnd: 0,
    height: "70%",
    borderRadius: 8, // Match item border radius
  },
  savedInfo: {
    position: "absolute",
    insetBlockEnd: 8,
    insetInlineStart: 8,
    insetInlineEnd: 8,
  },
  savedType: {
    color: "#ccc",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBlockEnd: 4,
  },
  savedTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  completedList: {
    // No specific grid styling, items will flow vertically
  },
  completedItem: {
    flexDirection: "row",
    backgroundColor: "#111",
    borderRadius: 8,
    padding: 12,
    marginBlockEnd: 16,
    alignItems: "center",
  },
  completedImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginInlineEnd: 12,
    backgroundColor: "#222",
  },
  completedInfo: {
    flex: 1,
  },
  completedType: {
    color: "#999",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBlockEnd: 4,
  },
  completedTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBlockEnd: 8,
  },
  completedMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  completedMetaText: {
    color: "#999",
    fontSize: 12,
    marginInlineStart: 4,
  },
  completedBadge: {
    marginInlineStart: "auto",
    paddingInlineStart: 10, // Add some padding so badge is not flush with info
  },
});

export default ProfileScreen;
