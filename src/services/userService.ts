import { api } from './api';

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
  type: 'like' | 'comment' | 'follow' | 'event' | 'achievement' | 'course';
  message: string;
  read: boolean;
  createdAt: string;
  data: Record<string, any>; // Additional data based on notification type
}

export interface BookshelfItem {
  id: string;
  title: string;
  type: 'post' | 'course' | 'event' | 'article';
  imageUrl: string;
  createdAt: string;
  savedAt: string;
  data: Record<string, any>; // Type-specific data
}

// User service for profile, notifications, bookshelf
export const userService = {
  // Get current user profile
  async getCurrentProfile(): Promise<UserProfile> {
    return api.get<UserProfile>('/user/profile');
  },
  
  // Get another user's profile
  async getUserProfile(userId: string): Promise<UserProfile> {
    return api.get<UserProfile>(`/users/${userId}/profile`);
  },
  
  // Update user profile
  async updateProfile(data: Partial<{
    name: string;
    bio: string;
    location: string;
    website: string;
    avatar: string; // Base64 encoded or URL
  }>): Promise<UserProfile> {
    return api.put<UserProfile>('/user/profile', data);
  },
  
  // Get user's notifications
  async getNotifications(
    limit: number = 20,
    offset: number = 0
  ): Promise<Notification[]> {
    return api.get<Notification[]>('/user/notifications', { limit, offset });
  },
  
  // Mark notifications as read
  async markNotificationsRead(notificationIds: string[]): Promise<void> {
    return api.post('/user/notifications/read', { notificationIds });
  },
  
  // Get user's bookshelf items
  async getBookshelf(
    type?: 'post' | 'course' | 'event' | 'article',
    limit: number = 20,
    offset: number = 0
  ): Promise<BookshelfItem[]> {
    return api.get<BookshelfItem[]>('/user/bookshelf', { type, limit, offset });
  },
  
  // Follow a user
  async followUser(userId: string): Promise<void> {
    return api.post(`/users/${userId}/follow`);
  },
  
  // Unfollow a user
  async unfollowUser(userId: string): Promise<void> {
    return api.delete(`/users/${userId}/follow`);
  },

  // Get user's achievements
  async getAchievements(): Promise<Achievement[]> {
    return api.get<Achievement[]>('/user/achievements');
  }
};
