/**
 * Mock API Service
 * This service provides mock implementations of API endpoints for offline development
 * or when the backend is not available.
 */

import { AuthResponse } from "./api";
import { FeedPost, FeedResponse, StoriesResponse, Story } from "./feedService";
import { Course, Lesson, LearningTool } from "./learnService";
import { UserProfile, Notification, BookshelfItem } from "./userService";
import { Event, Community, Post } from "./communityService";
import { NotificationCategory } from "./notificationService";
import {
  mockAuthResponses,
  mockFeedData,
  mockStoriesData,
  mockCoursesData,
  mockLessonsData,
  mockLearningToolsData,
  mockAvatarResponses,
  mockUserProfileData,
  mockNotificationsData,
  mockBookshelfData,
  mockEventsData,
  mockCommunitiesData,
  mockCommunityPostsData,
} from "./mockData";

// Simulate API delay
const simulateDelay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to simulate API errors occasionally
const shouldSimulateError = (errorRate: number = 0.05) => Math.random() < errorRate;

class MockApiService {
  private authToken: string | null = null;
  private loggedInUser: any = null;
  private likedPosts: Set<string> = new Set();
  private savedPosts: Set<string> = new Set();
  private viewedStories: Set<string> = new Set();
  private enrolledCourses: Set<string> = new Set();
  private completedLessons: Map<string, Set<string>> = new Map();
  private readNotifications: Set<string> = new Set();
  private joinedCommunities: Set<string> = new Set();
  private attendingEvents: Set<string> = new Set();

  constructor() {
    this.initializeUserData();
  }

  private initializeUserData() {
    // Initialize with some default user data
    this.likedPosts = new Set(["post-2"]);
    this.savedPosts = new Set(["post-3"]);
    this.viewedStories = new Set(["story-2"]);
    this.enrolledCourses = new Set(["course-1", "course-2"]);
    this.readNotifications = new Set(["notif-3", "notif-4"]);
    this.joinedCommunities = new Set(["community-1", "community-3"]);
    this.attendingEvents = new Set(["event-2"]);
    
    // Initialize completed lessons
    this.completedLessons.set("course-1", new Set(["lesson-1-1", "lesson-1-2"]));
    this.completedLessons.set("course-2", new Set(["lesson-2-1", "lesson-2-2", "lesson-2-3"]));
  }

  // Authentication methods
  async login(email: string, password: string): Promise<AuthResponse> {
    await simulateDelay(500);
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to login");
    }
    
    if (password === "invalid") {
      throw new Error("Invalid email or password");
    }
    
    const response = mockAuthResponses.login(email, password);
    this.authToken = response.token;
    this.loggedInUser = response.user;
    return response;
  }

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    await simulateDelay(700);
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to register");
    }
    
    if (email === "exists@example.com") {
      throw new Error("Email already registered");
    }
    
    const response = mockAuthResponses.register(name, email, password);
    this.authToken = response.token;
    this.loggedInUser = response.user;
    return response;
  }

  async logout(): Promise<void> {
    await simulateDelay(300);
    this.authToken = null;
    this.loggedInUser = null;
  }

  // Feed methods
  async getFeed(cursor?: string): Promise<FeedResponse> {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to get feed");
    }
    
    // Apply user interaction state to feed posts
    const posts = mockFeedData.map(post => ({
      ...post,
      liked: this.likedPosts.has(post.id),
      saved: this.savedPosts.has(post.id),
    }));
    
    // Implement simple cursor-based pagination
    if (cursor) {
      const cursorIndex = posts.findIndex(post => post.id === cursor);
      if (cursorIndex !== -1 && cursorIndex < posts.length - 1) {
        return {
          posts: posts.slice(cursorIndex + 1, cursorIndex + 3),
          nextCursor: cursorIndex + 3 < posts.length ? posts[cursorIndex + 3].id : undefined,
        };
      }
      return { posts: [] };
    }
    
    // First page
    return {
      posts: posts.slice(0, 2),
      nextCursor: posts.length > 2 ? posts[2].id : undefined,
    };
  }

  async getStories(): Promise<StoriesResponse> {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to get stories");
    }
    
    // Apply viewed state to stories
    const stories = mockStoriesData.map(story => ({
      ...story,
      viewed: this.viewedStories.has(story.id),
    }));
    
    return { stories };
  }

  async likePost(postId: string): Promise<void> {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to like post");
    }
    
    this.likedPosts.add(postId);
  }

  async unlikePost(postId: string): Promise<void> {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to unlike post");
    }
    
    this.likedPosts.delete(postId);
  }

  async savePost(postId: string): Promise<void> {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to save post");
    }
    
    this.savedPosts.add(postId);
  }

  async unsavePost(postId: string): Promise<void> {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to unsave post");
    }
    
    this.savedPosts.delete(postId);
  }

  async markStoryViewed(storyId: string): Promise<void> {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to mark story as viewed");
    }
    
    this.viewedStories.add(storyId);
  }

  // Learning methods
  async getCourses(filters?: { category?: string; level?: string; query?: string }): Promise<Course[]> {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to get courses");
    }
    
    let filteredCourses = [...mockCoursesData];
    
    // Apply filters
    if (filters) {
      if (filters.level) {
        filteredCourses = filteredCourses.filter(course => course.level === filters.level);
      }
      
      if (filters.category) {
        filteredCourses = filteredCourses.filter(course => 
          course.tags.some(tag => tag.toLowerCase().includes(filters.category!.toLowerCase()))
        );
      }
      
      if (filters.query) {
        const query = filters.query.toLowerCase();
        filteredCourses = filteredCourses.filter(course => 
          course.title.toLowerCase().includes(query) || 
          course.description.toLowerCase().includes(query)
        );
      }
    }
    
    return filteredCourses;
  }

  async getCourseDetails(courseId: string): Promise<{ course: Course; lessons: Lesson[] }> {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to get course details");
    }
    
    const course = mockCoursesData.find(c => c.id === courseId);
    
    if (!course) {
      throw new Error("Course not found");
    }
    
    const lessons = mockLessonsData[courseId] || [];
    
    // Apply completed state to lessons
    const completedLessonsForCourse = this.completedLessons.get(courseId) || new Set();
    const updatedLessons = lessons.map(lesson => ({
      ...lesson,
      completed: completedLessonsForCourse.has(lesson.id),
    }));
    
    return { course, lessons: updatedLessons };
  }

  async getEnrolledCourses(): Promise<Course[]> {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to get enrolled courses");
    }
    
    return mockCoursesData.filter(course => this.enrolledCourses.has(course.id));
  }

  async enrollCourse(courseId: string): Promise<void> {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to enroll in course");
    }
    
    this.enrolledCourses.add(courseId);
  }

  async completeLesson(courseId: string, lessonId: string): Promise<void> {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to mark lesson as completed");
    }
    
    if (!this.completedLessons.has(courseId)) {
      this.completedLessons.set(courseId, new Set());
    }
    
    this.completedLessons.get(courseId)!.add(lessonId);
  }

  async getLearningTools(): Promise<LearningTool[]> {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to get learning tools");
    }
    
    return mockLearningToolsData;
  }

  // Avatar methods
  async sendMessageToAvatar(message: string): Promise<any> {
    await simulateDelay(800);
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to send message to avatar");
    }
    
    return mockAvatarResponses.chat(message);
  }

  // User profile methods
  async getUserProfile(): Promise<UserProfile> {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to get user profile");
    }
    
    return mockUserProfileData;
  }

  async getUserProfileById(userId: string): Promise<UserProfile> {
    await simulateDelay(400);
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to get user profile");
    }
    
    // In a real implementation, this would get a different profile
    // For mock, we'll just return the same profile but with different ID
    return {
      ...mockUserProfileData,
      id: userId,
      name: userId === "user-2" ? "Jane Smith" : 
            userId === "user-3" ? "Michael Johnson" : 
            userId === "user-4" ? "Sarah Williams" : "User " + userId,
      email: `user-${userId}@example.com`,
    };
  }

  async updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    await simulateDelay(600);
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to update user profile");
    }
    
    // In a real implementation, this would update the user profile
    return { ...mockUserProfileData, ...profileData };
  }
  
  // Notification methods
  async getNotifications(limit: number = 20, offset: number = 0): Promise<Notification[]> {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to get notifications");
    }
    
    // Apply read state to notifications
    const notifications = mockNotificationsData.map(notification => ({
      ...notification,
      read: this.readNotifications.has(notification.id),
    }));
    
    // Sort by date (most recent first) and apply pagination
    return notifications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);
  }
  
  async markNotificationsRead(notificationIds: string[]): Promise<void> {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to mark notifications as read");
    }
    
    notificationIds.forEach(id => this.readNotifications.add(id));
  }
  
  async markAllNotificationsRead(): Promise<void> {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to mark all notifications as read");
    }
    
    mockNotificationsData.forEach(notification => {
      this.readNotifications.add(notification.id);
    });
  }
  
  // Bookshelf methods
  async getBookshelfItems(
    type?: "post" | "course" | "event" | "article",
    limit: number = 20,
    offset: number = 0
  ): Promise<BookshelfItem[]> {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to get bookshelf items");
    }
    
    let items = [...mockBookshelfData];
    
    // Apply type filter if provided
    if (type) {
      items = items.filter(item => item.type === type);
    }
    
    // Sort by saved date (most recent first) and apply pagination
    return items
      .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
      .slice(offset, offset + limit);
  }
  
  // User follow methods
  async followUser(userId: string): Promise<void> {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to follow user");
    }
    
    // In a real implementation, this would update follow status
    console.log(`Following user ${userId}`);
  }
  
  async unfollowUser(userId: string): Promise<void> {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to unfollow user");
    }
    
    // In a real implementation, this would update follow status
    console.log(`Unfollowing user ${userId}`);
  }
  
  // Achievement methods
  async getAchievements(): Promise<UserProfile['achievements']> {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to get achievements");
    }
    
    return mockUserProfileData.achievements;
  }
  
  // Community methods
  async getEvents(latitude: number, longitude: number, radiusInKm: number = 10): Promise<Event[]> {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to get events");
    }
    
    // Apply attending state
    return mockEventsData.map(event => ({
      ...event,
      isAttending: this.attendingEvents.has(event.id)
    }));
  }
  
  async getEventDetails(eventId: string): Promise<Event> {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to get event details");
    }
    
    const event = mockEventsData.find(e => e.id === eventId);
    
    if (!event) {
      throw new Error("Event not found");
    }
    
    return {
      ...event,
      isAttending: this.attendingEvents.has(event.id)
    };
  }
  
  async attendEvent(eventId: string): Promise<void> {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to attend event");
    }
    
    this.attendingEvents.add(eventId);
  }
  
  async unattendEvent(eventId: string): Promise<void> {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to unattend event");
    }
    
    this.attendingEvents.delete(eventId);
  }
  
  async getCommunities(latitude: number, longitude: number, radiusInKm: number = 10): Promise<Community[]> {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to get communities");
    }
    
    // Apply joined state
    return mockCommunitiesData.map(community => ({
      ...community,
      isJoined: this.joinedCommunities.has(community.id)
    }));
  }
  
  async getCommunityDetails(communityId: string): Promise<{ community: Community; posts: Post[] }> {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to get community details");
    }
    
    const community = mockCommunitiesData.find(c => c.id === communityId);
    
    if (!community) {
      throw new Error("Community not found");
    }
    
    const posts = mockCommunityPostsData[communityId] || [];
    
    return {
      community: {
        ...community,
        isJoined: this.joinedCommunities.has(community.id)
      },
      posts
    };
  }
  
  async joinCommunity(communityId: string): Promise<void> {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to join community");
    }
    
    this.joinedCommunities.add(communityId);
  }
  
  async leaveCommunity(communityId: string): Promise<void> {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to leave community");
    }
    
    this.joinedCommunities.delete(communityId);
  }
  
  async createPost(communityId: string, data: { content: string; imageUrl?: string }): Promise<Post> {
    await simulateDelay(600);
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to create post");
    }
    
    // Create a new post
    const newPost: Post = {
      id: `new-post-${Date.now()}`,
      communityId,
      userId: "user-1", // Current user
      userName: "John Doe", // Current user
      userAvatar: "https://placekitten.com/300/300", // Current user
      content: data.content,
      imageUrl: data.imageUrl,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0
    };
    
    // In a real implementation, this would save to the server
    return newPost;
  }
  
  // Push notification methods
  async registerPushToken(token: string, deviceType: string): Promise<boolean> {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to register push token");
    }
    
    // In a real implementation, this would send the token to the server
    console.log(`Registered push token: ${token} for device: ${deviceType}`);
    return true;
  }
  
  async updateNotificationPreferences(preferences: Record<string, boolean>): Promise<void> {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error("Network error: Failed to update notification preferences");
    }
    
    // In a real implementation, this would update preferences on the server
    console.log("Updated notification preferences:", preferences);
  }
}

export default new MockApiService();