/**
 * API Service - Handles connection to backend or uses mock data when backend is not available
 */

import ENV from "@config/env";
import { api, AuthResponse, LoginCredentials, RegistrationData } from "./api";
import { FeedPost, FeedResponse, StoriesResponse } from "./feedService";
import { Course, Lesson, LearningTool } from "./learnService";
import { UserProfile, Notification, BookshelfItem } from "./userService";
import { Event, Community, Post } from "./communityService";
import { NotificationCategory } from "./notificationService";
import mockApiService from "./mockApiService";
import NetworkUtils from "@utils/networkUtils";
import { ErrorHandler, ErrorType } from "@utils/errorHandler";

// API service that handles both real and mock API calls
class ApiService {
  private networkConnected: boolean = true;
  private forceMock: boolean = !ENV.USE_BACKEND_API;
  
  constructor() {
    // Initialize network state
    this.initializeNetworkStatus();
  }
  
  /**
   * Initialize network status and set up listener
   */
  private async initializeNetworkStatus(): Promise<void> {
    try {
      // Get initial network state
      this.networkConnected = await NetworkUtils.isConnected();
      
      // Set up listener for network changes
      NetworkUtils.addNetworkListener((connected) => {
        this.networkConnected = connected;
        console.log(`Network status changed: ${connected ? 'online' : 'offline'}`);
      });
    } catch (error) {
      console.error("Failed to initialize network status:", error);
      this.networkConnected = false;
    }
  }
  
  /**
   * Determine if we should use mock data
   * This is now a synchronous method to avoid await in every API call
   */
  private shouldUseMockData(): boolean {
    // Always use mock if specified in environment config
    if (this.forceMock) {
      return true;
    }
    
    // Use mock if offline
    return !this.networkConnected;
  }
  
  /**
   * Try to execute real API call, fall back to mock if necessary
   */
  private async executeWithFallback<T>(
    realApiCall: () => Promise<T>,
    mockApiCall: () => Promise<T>,
    context: string
  ): Promise<T> {
    // If we should use mock data based on config or network status
    if (this.shouldUseMockData()) {
      return mockApiCall();
    }
    
    // Try real API call
    try {
      return await realApiCall();
    } catch (error) {
      // Process the error
      const appError = ErrorHandler.processError(error, context);
      
      // If it's a network error or server error, fall back to mock
      if (
        ErrorHandler.isErrorType(appError, ErrorType.Network) ||
        ErrorHandler.isErrorType(appError, ErrorType.Server)
      ) {
        console.warn(`API call failed (${context}), falling back to mock data:`, appError.message);
        return mockApiCall();
      }
      
      // For other errors (auth, validation, etc.), propagate the error
      throw appError;
    }
  }

  /**
   * Authentication methods
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.executeWithFallback(
      () => api.post<AuthResponse>("/auth/login", credentials),
      () => mockApiService.login(credentials.email, credentials.password),
      "apiService.login"
    );
  }

  async register(data: RegistrationData): Promise<AuthResponse> {
    return this.executeWithFallback(
      () => api.post<AuthResponse>("/auth/register", data),
      () => mockApiService.register(data.name, data.email, data.password),
      "apiService.register"
    );
  }

  async logout(): Promise<void> {
    try {
      if (this.shouldUseMockData()) {
        await mockApiService.logout();
      } else {
        await api.post("/auth/logout");
      }
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
    return this.executeWithFallback(
      () => api.get<FeedResponse>("/feed", cursor ? { cursor } : {}),
      () => mockApiService.getFeed(cursor),
      "apiService.getFeed"
    );
  }

  async getStories(): Promise<StoriesResponse> {
    return this.executeWithFallback(
      () => api.get<StoriesResponse>("/stories"),
      () => mockApiService.getStories(),
      "apiService.getStories"
    );
  }

  async likePost(postId: string): Promise<void> {
    return this.executeWithFallback(
      () => api.post(`/posts/${postId}/like`),
      () => mockApiService.likePost(postId),
      "apiService.likePost"
    );
  }

  async unlikePost(postId: string): Promise<void> {
    return this.executeWithFallback(
      () => api.delete(`/posts/${postId}/like`),
      () => mockApiService.unlikePost(postId),
      "apiService.unlikePost"
    );
  }

  async savePost(postId: string): Promise<void> {
    return this.executeWithFallback(
      () => api.post(`/posts/${postId}/save`),
      () => mockApiService.savePost(postId),
      "apiService.savePost"
    );
  }

  async unsavePost(postId: string): Promise<void> {
    return this.executeWithFallback(
      () => api.delete(`/posts/${postId}/save`),
      () => mockApiService.unsavePost(postId),
      "apiService.unsavePost"
    );
  }

  async markStoryViewed(storyId: string): Promise<void> {
    return this.executeWithFallback(
      () => api.post(`/stories/${storyId}/view`),
      () => mockApiService.markStoryViewed(storyId),
      "apiService.markStoryViewed"
    );
  }

  /**
   * Course and learning methods
   */
  async getCourses(filters?: {
    category?: string;
    level?: string;
    query?: string;
  }): Promise<Course[]> {
    return this.executeWithFallback(
      () => api.get<Course[]>("/courses", filters),
      () => mockApiService.getCourses(filters),
      "apiService.getCourses"
    );
  }

  async getCourseDetails(
    courseId: string,
  ): Promise<{ course: Course; lessons: Lesson[] }> {
    return this.executeWithFallback(
      () => api.get<{ course: Course; lessons: Lesson[] }>(`/courses/${courseId}`),
      () => mockApiService.getCourseDetails(courseId),
      "apiService.getCourseDetails"
    );
  }

  async getEnrolledCourses(): Promise<Course[]> {
    return this.executeWithFallback(
      () => api.get<Course[]>("/user/courses"),
      () => mockApiService.getEnrolledCourses(),
      "apiService.getEnrolledCourses"
    );
  }

  async enrollCourse(courseId: string): Promise<void> {
    return this.executeWithFallback(
      () => api.post(`/courses/${courseId}/enroll`),
      () => mockApiService.enrollCourse(courseId),
      "apiService.enrollCourse"
    );
  }

  async completeLesson(courseId: string, lessonId: string): Promise<void> {
    return this.executeWithFallback(
      () => api.post(`/courses/${courseId}/lessons/${lessonId}/complete`),
      () => mockApiService.completeLesson(courseId, lessonId),
      "apiService.completeLesson"
    );
  }

  async getLearningTools(): Promise<LearningTool[]> {
    return this.executeWithFallback(
      () => api.get<LearningTool[]>("/learning-tools"),
      () => mockApiService.getLearningTools(),
      "apiService.getLearningTools"
    );
  }
  
  async getFeaturedCourses(): Promise<Course[]> {
    return this.executeWithFallback(
      () => api.get<Course[]>("/courses/featured"),
      () => mockApiService.getFeaturedCourses(),
      "apiService.getFeaturedCourses"
    );
  }
  
  async getCourseCategories(): Promise<{id: string, name: string, courses: Course[]}[]> {
    return this.executeWithFallback(
      () => api.get<{id: string, name: string, courses: Course[]}[]>("/courses/categories"),
      () => mockApiService.getCourseCategories(),
      "apiService.getCourseCategories"
    );
  }
  
  async getCoursesByDomainAndLevel(domain: string, level: string): Promise<Course[]> {
    return this.executeWithFallback(
      () => api.get<Course[]>(`/courses/domain/${domain}/level/${level}`),
      () => mockApiService.getCoursesByDomainAndLevel(domain, level),
      "apiService.getCoursesByDomainAndLevel"
    );
  }

  /**
   * Avatar methods
   */
  async sendMessageToAvatar(message: string, sessionId?: string): Promise<any> {
    return this.executeWithFallback(
      () => api.post("/ai/avatar/message", { message, sessionId }),
      () => mockApiService.sendMessageToAvatar(message),
      "apiService.sendMessageToAvatar"
    );
  }

  /**
   * User profile methods
   */
  async getUserProfile(): Promise<UserProfile> {
    return this.executeWithFallback(
      () => api.get<UserProfile>("/user/profile"),
      () => mockApiService.getUserProfile(),
      "apiService.getUserProfile"
    );
  }

  async getUserProfileById(userId: string): Promise<UserProfile> {
    return this.executeWithFallback(
      () => api.get<UserProfile>(`/users/${userId}/profile`),
      () => mockApiService.getUserProfileById(userId),
      "apiService.getUserProfileById"
    );
  }

  async updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    return this.executeWithFallback(
      () => api.put<UserProfile>("/user/profile", profileData),
      () => mockApiService.updateUserProfile(profileData),
      "apiService.updateUserProfile"
    );
  }

  /**
   * User follow methods
   */
  async followUser(userId: string): Promise<void> {
    return this.executeWithFallback(
      () => api.post(`/users/${userId}/follow`),
      () => mockApiService.followUser(userId),
      "apiService.followUser"
    );
  }

  async unfollowUser(userId: string): Promise<void> {
    return this.executeWithFallback(
      () => api.delete(`/users/${userId}/follow`),
      () => mockApiService.unfollowUser(userId),
      "apiService.unfollowUser"
    );
  }

  /**
   * Achievement methods
   */
  async getAchievements(): Promise<UserProfile['achievements']> {
    return this.executeWithFallback(
      () => api.get<UserProfile['achievements']>("/user/achievements"),
      () => mockApiService.getAchievements(),
      "apiService.getAchievements"
    );
  }

  /**
   * Notification methods
   */
  async getNotifications(limit: number = 20, offset: number = 0): Promise<Notification[]> {
    return this.executeWithFallback(
      () => api.get<Notification[]>("/notifications", { limit, offset }),
      () => mockApiService.getNotifications(limit, offset),
      "apiService.getNotifications"
    );
  }

  async markNotificationsRead(notificationIds: string[]): Promise<void> {
    return this.executeWithFallback(
      () => api.post("/notifications/read", { notificationIds }),
      () => mockApiService.markNotificationsRead(notificationIds),
      "apiService.markNotificationsRead"
    );
  }

  async markAllNotificationsRead(): Promise<void> {
    return this.executeWithFallback(
      () => api.post("/notifications/read-all"),
      () => mockApiService.markAllNotificationsRead(),
      "apiService.markAllNotificationsRead"
    );
  }

  /**
   * Bookshelf methods
   */
  async getBookshelfItems(
    type?: "post" | "course" | "event" | "article",
    limit: number = 20,
    offset: number = 0
  ): Promise<BookshelfItem[]> {
    return this.executeWithFallback(
      () => api.get<BookshelfItem[]>("/user/bookshelf", { type, limit, offset }),
      () => mockApiService.getBookshelfItems(type, limit, offset),
      "apiService.getBookshelfItems"
    );
  }

  /**
   * Community methods
   */
  async getEvents(latitude: number, longitude: number, radiusInKm: number = 10): Promise<Event[]> {
    return this.executeWithFallback(
      () => api.get<Event[]>("/events", { latitude, longitude, radius: radiusInKm }),
      () => mockApiService.getEvents(latitude, longitude, radiusInKm),
      "apiService.getEvents"
    );
  }

  async getEventDetails(eventId: string): Promise<Event> {
    return this.executeWithFallback(
      () => api.get<Event>(`/events/${eventId}`),
      () => mockApiService.getEventDetails(eventId),
      "apiService.getEventDetails"
    );
  }

  async attendEvent(eventId: string): Promise<void> {
    return this.executeWithFallback(
      () => api.post(`/events/${eventId}/attend`),
      () => mockApiService.attendEvent(eventId),
      "apiService.attendEvent"
    );
  }

  async unattendEvent(eventId: string): Promise<void> {
    return this.executeWithFallback(
      () => api.delete(`/events/${eventId}/attend`),
      () => mockApiService.unattendEvent(eventId),
      "apiService.unattendEvent"
    );
  }

  async getCommunities(latitude: number, longitude: number, radiusInKm: number = 10): Promise<Community[]> {
    return this.executeWithFallback(
      () => api.get<Community[]>("/communities", { latitude, longitude, radius: radiusInKm }),
      () => mockApiService.getCommunities(latitude, longitude, radiusInKm),
      "apiService.getCommunities"
    );
  }

  async getCommunityDetails(communityId: string): Promise<{ community: Community; posts: Post[] }> {
    return this.executeWithFallback(
      () => api.get<{ community: Community; posts: Post[] }>(`/communities/${communityId}`),
      () => mockApiService.getCommunityDetails(communityId),
      "apiService.getCommunityDetails"
    );
  }

  async joinCommunity(communityId: string): Promise<void> {
    return this.executeWithFallback(
      () => api.post(`/communities/${communityId}/join`),
      () => mockApiService.joinCommunity(communityId),
      "apiService.joinCommunity"
    );
  }

  async leaveCommunity(communityId: string): Promise<void> {
    return this.executeWithFallback(
      () => api.delete(`/communities/${communityId}/join`),
      () => mockApiService.leaveCommunity(communityId),
      "apiService.leaveCommunity"
    );
  }

  async createPost(communityId: string, data: { content: string; imageUrl?: string }): Promise<Post> {
    return this.executeWithFallback(
      () => api.post<Post>(`/communities/${communityId}/posts`, data),
      () => mockApiService.createPost(communityId, data),
      "apiService.createPost"
    );
  }

  /**
   * Push notification methods
   */
  async registerPushToken(token: string, deviceType: string): Promise<boolean> {
    return this.executeWithFallback(
      async () => {
        await api.post("/user/push-token", { token, device: deviceType });
        return true;
      },
      () => mockApiService.registerPushToken(token, deviceType),
      "apiService.registerPushToken"
    );
  }

  async updateNotificationPreferences(preferences: Record<string, boolean>): Promise<void> {
    return this.executeWithFallback(
      () => api.put("/user/notification-preferences", { preferences }),
      () => mockApiService.updateNotificationPreferences(preferences),
      "apiService.updateNotificationPreferences"
    );
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

  /**
   * Check if the API is accessible
   */
  async checkApiAccess(): Promise<boolean> {
    try {
      // First check if device is online
      if (!this.networkConnected) {
        return false;
      }
      
      // Then try a simple API health check
      await api.get('/health');
      return true;
    } catch (error) {
      console.warn("API access check failed:", error);
      return false;
    }
  }

  /**
   * Toggle between mock and real API
   */
  setForceMockApi(useMock: boolean): void {
    this.forceMock = useMock;
    console.log(`API Service now using ${useMock ? 'mock' : 'real'} API`);
  }

  /**
   * Generic HTTP methods
   */
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.executeWithFallback(
      () => api.get<T>(endpoint, params),
      // For generic endpoints without mock implementation, we still need to call the real API
      // This might fail in offline mode, but it's better than returning undefined
      () => api.get<T>(endpoint, params),
      `apiService.get(${endpoint})`
    );
  }

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.executeWithFallback(
      () => api.post<T>(endpoint, data),
      () => api.post<T>(endpoint, data),
      `apiService.post(${endpoint})`
    );
  }

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.executeWithFallback(
      () => api.put<T>(endpoint, data),
      () => api.put<T>(endpoint, data),
      `apiService.put(${endpoint})`
    );
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.executeWithFallback(
      () => api.delete<T>(endpoint),
      () => api.delete<T>(endpoint),
      `apiService.delete(${endpoint})`
    );
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;