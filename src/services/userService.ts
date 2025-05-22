import { AppError, ErrorType } from "../utils/AppError";

import { api } from "./api";

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
      return await api.get<UserProfile>("/user/profile");
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
      return await api.get<UserProfile>(`/users/${userId}/profile`);
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
      return await api.put<UserProfile>("/user/profile", data);
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
      return await api.get<Notification[]>("/user/notifications", {
        limit,
        offset,
      });
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
      return await api.post("/user/notifications/read", { notificationIds });
    } catch (error: any) {
      throw new AppError(
        ErrorType.Server,
        "Failed to mark notifications as read",
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
      return await api.get<BookshelfItem[]>("/user/bookshelf", {
        type,
        limit,
        offset,
      });
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
      return await api.post(`/users/${userId}/follow`);
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
      return await api.delete(`/users/${userId}/follow`);
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
      return await api.get<Achievement[]>("/user/achievements");
    } catch (error: any) {
      throw new AppError(ErrorType.Server, "Failed to get achievements", error);
    }
  },
};
