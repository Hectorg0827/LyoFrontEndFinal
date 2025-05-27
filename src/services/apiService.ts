/**
 * API Service - Handles connection to backend or uses mock data when backend is not available
 */

import ENV from "../config/env";
import { api, AuthResponse, LoginCredentials, RegistrationData } from "./api";
import { FeedPost, FeedResponse, StoriesResponse } from "./feedService";
import { Course, Lesson, LearningTool } from "./learnService";
import { UserProfile, Notification, BookshelfItem } from "./userService";
import { Event, Community, Post } from "./communityService";
import { NotificationCategory } from "./notificationService";
import mockApiService from "./mockApiService";
import NetworkUtils from "../utils/networkUtils";

// Helper function to determine if we should use mock data
async function shouldUseMockData(): Promise<boolean> {
  // Always use mock data if specified in environment
  if (!ENV.USE_BACKEND_API) {
    return true;
  }
  
  // Use mock data if offline
  const isConnected = await NetworkUtils.isConnected();
  return !isConnected;
}

// API service that handles both real and mock API calls
class ApiService {
  /**
   * Authentication methods
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      if (await shouldUseMockData()) {
        return mockApiService.login(credentials.email, credentials.password);
      }
      return api.post<AuthResponse>("/auth/login", credentials);
    } catch (error) {
      console.error("Login error:", error);
      // Fall back to mock service if API call fails
      return mockApiService.login(credentials.email, credentials.password);
    }
  }

  async register(data: RegistrationData): Promise<AuthResponse> {
    try {
      if (await shouldUseMockData()) {
        return mockApiService.register(data.name, data.email, data.password);
      }
      return api.post<AuthResponse>("/auth/register", data);
    } catch (error) {
      console.error("Registration error:", error);
      // Fall back to mock service if API call fails
      return mockApiService.register(data.name, data.email, data.password);
    }
  }

  async logout(): Promise<void> {
    try {
      if (await shouldUseMockData()) {
        return mockApiService.logout();
      }
      
      await api.post("/auth/logout");
    } catch (error) {
      console.warn("Logout error:", error);
      // Proceed with local logout regardless of API error
    } finally {
      api.clearToken();
    }
  }

  /**
   * Feed methods
   */
  async getFeed(cursor?: string): Promise<FeedResponse> {
    if (await shouldUseMockData()) {
      return mockApiService.getFeed(cursor);
    }
    return api.get<FeedResponse>("/feed", cursor ? { cursor } : {});
  }

  async getStories(): Promise<StoriesResponse> {
    if (await shouldUseMockData()) {
      return mockApiService.getStories();
    }
    return api.get<StoriesResponse>("/stories");
  }

  async likePost(postId: string): Promise<void> {
    if (useMockApi) {
      return mockApiService.likePost(postId);
    }
    return api.post(`/posts/${postId}/like`);
  }

  async unlikePost(postId: string): Promise<void> {
    if (useMockApi) {
      return mockApiService.unlikePost(postId);
    }
    return api.delete(`/posts/${postId}/like`);
  }

  async savePost(postId: string): Promise<void> {
    if (useMockApi) {
      return mockApiService.savePost(postId);
    }
    return api.post(`/posts/${postId}/save`);
  }

  async unsavePost(postId: string): Promise<void> {
    if (useMockApi) {
      return mockApiService.unsavePost(postId);
    }
    return api.delete(`/posts/${postId}/save`);
  }

  async markStoryViewed(storyId: string): Promise<void> {
    if (useMockApi) {
      return mockApiService.markStoryViewed(storyId);
    }
    return api.post(`/stories/${storyId}/view`);
  }

  /**
   * Course and learning methods
   */
  async getCourses(filters?: {
    category?: string;
    level?: string;
    query?: string;
  }): Promise<Course[]> {
    if (useMockApi) {
      return mockApiService.getCourses(filters);
    }
    return api.get<Course[]>("/courses", filters);
  }

  async getCourseDetails(
    courseId: string,
  ): Promise<{ course: Course; lessons: Lesson[] }> {
    if (useMockApi) {
      return mockApiService.getCourseDetails(courseId);
    }
    return api.get<{ course: Course; lessons: Lesson[] }>(`/courses/${courseId}`);
  }

  async getEnrolledCourses(): Promise<Course[]> {
    if (useMockApi) {
      return mockApiService.getEnrolledCourses();
    }
    return api.get<Course[]>("/user/courses");
  }

  async enrollCourse(courseId: string): Promise<void> {
    if (useMockApi) {
      return mockApiService.enrollCourse(courseId);
    }
    return api.post(`/courses/${courseId}/enroll`);
  }

  async completeLesson(courseId: string, lessonId: string): Promise<void> {
    if (useMockApi) {
      return mockApiService.completeLesson(courseId, lessonId);
    }
    return api.post(`/courses/${courseId}/lessons/${lessonId}/complete`);
  }

  async getLearningTools(): Promise<LearningTool[]> {
    if (useMockApi) {
      return mockApiService.getLearningTools();
    }
    return api.get<LearningTool[]>("/learning-tools");
  }

  /**
   * Avatar methods
   */
  async sendMessageToAvatar(message: string, sessionId?: string): Promise<any> {
    if (useMockApi) {
      return mockApiService.sendMessageToAvatar(message);
    }
    return api.post("/ai/avatar/message", { message, sessionId });
  }

  /**
   * User profile methods
   */
  async getUserProfile(): Promise<UserProfile> {
    if (useMockApi) {
      return mockApiService.getUserProfile();
    }
    return api.get<UserProfile>("/user/profile");
  }

  async getUserProfileById(userId: string): Promise<UserProfile> {
    if (useMockApi) {
      return mockApiService.getUserProfileById(userId);
    }
    return api.get<UserProfile>(`/users/${userId}/profile`);
  }

  async updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    if (useMockApi) {
      return mockApiService.updateUserProfile(profileData);
    }
    return api.put<UserProfile>("/user/profile", profileData);
  }

  /**
   * User follow methods
   */
  async followUser(userId: string): Promise<void> {
    if (useMockApi) {
      return mockApiService.followUser(userId);
    }
    return api.post(`/users/${userId}/follow`);
  }

  async unfollowUser(userId: string): Promise<void> {
    if (useMockApi) {
      return mockApiService.unfollowUser(userId);
    }
    return api.delete(`/users/${userId}/follow`);
  }

  /**
   * Achievement methods
   */
  async getAchievements(): Promise<UserProfile['achievements']> {
    if (useMockApi) {
      return mockApiService.getAchievements();
    }
    return api.get<UserProfile['achievements']>("/user/achievements");
  }

  /**
   * Notification methods
   */
  async getNotifications(limit: number = 20, offset: number = 0): Promise<Notification[]> {
    if (useMockApi) {
      return mockApiService.getNotifications(limit, offset);
    }
    return api.get<Notification[]>("/notifications", { limit, offset });
  }

  async markNotificationsRead(notificationIds: string[]): Promise<void> {
    if (useMockApi) {
      return mockApiService.markNotificationsRead(notificationIds);
    }
    return api.post("/notifications/read", { notificationIds });
  }

  async markAllNotificationsRead(): Promise<void> {
    if (useMockApi) {
      return mockApiService.markAllNotificationsRead();
    }
    return api.post("/notifications/read-all");
  }

  /**
   * Bookshelf methods
   */
  async getBookshelfItems(
    type?: "post" | "course" | "event" | "article",
    limit: number = 20,
    offset: number = 0
  ): Promise<BookshelfItem[]> {
    if (useMockApi) {
      return mockApiService.getBookshelfItems(type, limit, offset);
    }
    return api.get<BookshelfItem[]>("/user/bookshelf", { type, limit, offset });
  }

  /**
   * Community methods
   */
  async getEvents(latitude: number, longitude: number, radiusInKm: number = 10): Promise<Event[]> {
    if (useMockApi) {
      return mockApiService.getEvents(latitude, longitude, radiusInKm);
    }
    return api.get<Event[]>("/events", { latitude, longitude, radius: radiusInKm });
  }

  async getEventDetails(eventId: string): Promise<Event> {
    if (useMockApi) {
      return mockApiService.getEventDetails(eventId);
    }
    return api.get<Event>(`/events/${eventId}`);
  }

  async attendEvent(eventId: string): Promise<void> {
    if (useMockApi) {
      return mockApiService.attendEvent(eventId);
    }
    return api.post(`/events/${eventId}/attend`);
  }

  async unattendEvent(eventId: string): Promise<void> {
    if (useMockApi) {
      return mockApiService.unattendEvent(eventId);
    }
    return api.delete(`/events/${eventId}/attend`);
  }

  async getCommunities(latitude: number, longitude: number, radiusInKm: number = 10): Promise<Community[]> {
    if (useMockApi) {
      return mockApiService.getCommunities(latitude, longitude, radiusInKm);
    }
    return api.get<Community[]>("/communities", { latitude, longitude, radius: radiusInKm });
  }

  async getCommunityDetails(communityId: string): Promise<{ community: Community; posts: Post[] }> {
    if (useMockApi) {
      return mockApiService.getCommunityDetails(communityId);
    }
    return api.get<{ community: Community; posts: Post[] }>(`/communities/${communityId}`);
  }

  async joinCommunity(communityId: string): Promise<void> {
    if (useMockApi) {
      return mockApiService.joinCommunity(communityId);
    }
    return api.post(`/communities/${communityId}/join`);
  }

  async leaveCommunity(communityId: string): Promise<void> {
    if (useMockApi) {
      return mockApiService.leaveCommunity(communityId);
    }
    return api.delete(`/communities/${communityId}/join`);
  }

  async createPost(communityId: string, data: { content: string; imageUrl?: string }): Promise<Post> {
    if (useMockApi) {
      return mockApiService.createPost(communityId, data);
    }
    return api.post<Post>(`/communities/${communityId}/posts`, data);
  }

  /**
   * Push notification methods
   */
  async registerPushToken(token: string, deviceType: string): Promise<boolean> {
    if (useMockApi) {
      return mockApiService.registerPushToken(token, deviceType);
    }
    await api.post("/user/push-token", { token, device: deviceType });
    return true;
  }

  async updateNotificationPreferences(preferences: Record<string, boolean>): Promise<void> {
    if (useMockApi) {
      return mockApiService.updateNotificationPreferences(preferences);
    }
    return api.put("/user/notification-preferences", { preferences });
  }

  /**
   * Token management
   */
  setToken(token: string): void {
    api.setToken(token);
  }

  clearToken(): void {
    api.clearToken();
  }

  getToken(): string | null {
    return api.getToken();
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;