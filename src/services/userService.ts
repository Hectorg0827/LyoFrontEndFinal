import { AppError, ErrorType } from "../utils/AppError";
import apiService from "./apiService";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatar: string;
  location: string;
  website: string;
  joinDate: string;
  followers: number;
  following: number;
  achievements: Achievement[];
  stats: UserStats;
}

export interface UserStats {
  coursesCompleted: number;
  lessonsCompleted: number;
  eventsAttended: number;
  postsCreated: number;
  daysStreak: number;
  minutesLearned: number;
  xpLevel?: number; // Added
  currentXp?: number; // Added
  nextLevelXp?: number; // Added
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconUrl: string;
  unlockedAt?: string;
  progress?: number; // 0-100 for in-progress achievements
}

export interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "event" | "achievement" | "course";
  message: string;
  read: boolean;
  createdAt: string;
  data: Record<string, any>; // Additional data based on notification type
}

export interface BookshelfItem {
  id: string;
  title: string;
  type: "post" | "course" | "event" | "article";
  imageUrl: string;
  createdAt: string;
  savedAt: string;
  data: Record<string, any>; // Type-specific data
}

// User service for profile, notifications, bookshelf
export const userService = {
  // Get current user profile
  async getCurrentProfile(): Promise<UserProfile> {
    try {
      return await apiService.getUserProfile();
    } catch (error: any) {
      throw new AppError(
        ErrorType.Server,
        "Failed to get current user profile",
        error,
      );
    }
  },

  // Get another user's profile
  async getUserProfile(userId: string): Promise<UserProfile> {
    if (!userId) {
      throw new AppError(ErrorType.Validation, "User ID is required");
    }
    try {
      return await apiService.getUserProfileById(userId);
    } catch (error: any) {
      throw new AppError(
        ErrorType.Server,
        `Failed to get profile for user ${userId}`,
        error,
      );
    }
  },

  // Update user profile
  async updateProfile(
    data: Partial<{
      name: string;
      bio: string;
      location: string;
      website: string;
      avatar: string; // Base64 encoded or URL
    }>,
  ): Promise<UserProfile> {
    try {
      return await apiService.updateUserProfile(data);
    } catch (error: any) {
      throw new AppError(
        ErrorType.Server,
        "Failed to update user profile",
        error,
      );
    }
  },

  // Get user's notifications
  async getNotifications(limit = 20, offset = 0): Promise<Notification[]> {
    try {
      return await apiService.getNotifications(limit, offset);
    } catch (error: any) {
      throw new AppError(
        ErrorType.Server,
        "Failed to get notifications",
        error,
      );
    }
  },

  // Mark notifications as read
  async markNotificationsRead(notificationIds: string[]): Promise<void> {
    if (!notificationIds || notificationIds.length === 0) {
      throw new AppError(ErrorType.Validation, "Notification IDs are required");
    }
    try {
      return await apiService.markNotificationsRead(notificationIds);
    } catch (error: any) {
      throw new AppError(
        ErrorType.Server,
        "Failed to mark notifications as read",
        error,
      );
    }
  },
  
  // Mark all notifications as read
  async markAllNotificationsRead(): Promise<void> {
    try {
      return await apiService.markAllNotificationsRead();
    } catch (error: any) {
      throw new AppError(
        ErrorType.Server,
        "Failed to mark all notifications as read",
        error,
      );
    }
  },

  // Get user's bookshelf items
  async getBookshelf(
    type?: "post" | "course" | "event" | "article",
    limit = 20,
    offset = 0,
  ): Promise<BookshelfItem[]> {
    try {
      return await apiService.getBookshelfItems(type, limit, offset);
    } catch (error: any) {
      throw new AppError(
        ErrorType.Server,
        "Failed to get bookshelf items",
        error,
      );
    }
  },

  // Follow a user
  async followUser(userId: string): Promise<void> {
    if (!userId) {
      throw new AppError(
        ErrorType.Validation,
        "User ID is required for follow action",
      );
    }
    try {
      return await apiService.followUser(userId);
    } catch (error: any) {
      throw new AppError(
        ErrorType.Server,
        `Failed to follow user ${userId}`,
        error,
      );
    }
  },

  // Unfollow a user
  async unfollowUser(userId: string): Promise<void> {
    if (!userId) {
      throw new AppError(
        ErrorType.Validation,
        "User ID is required for unfollow action",
      );
    }
    try {
      return await apiService.unfollowUser(userId);
    } catch (error: any) {
      throw new AppError(
        ErrorType.Server,
        `Failed to unfollow user ${userId}`,
        error,
      );
    }
  },

  // Get user's achievements
  async getAchievements(): Promise<Achievement[]> {
    try {
      return await apiService.getAchievements();
    } catch (error: any) {
      throw new AppError(ErrorType.Server, "Failed to get achievements", error);
    }
  },
};
