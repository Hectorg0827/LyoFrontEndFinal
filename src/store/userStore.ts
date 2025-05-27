import { create } from "zustand";
import { userService, UserProfile, BookshelfItem, Notification } from "../services/userService";
import { AppError, ErrorType } from "../utils/AppError";

interface UserStore {
  // State
  profile: UserProfile | null;
  notifications: Notification[];
  unreadNotificationCount: number;
  bookshelf: BookshelfItem[];
  isLoadingProfile: boolean;
  isLoadingNotifications: boolean;
  isLoadingBookshelf: boolean;
  error: string | null;

  // Actions
  fetchProfile: () => Promise<UserProfile | null>;
  fetchNotifications: () => Promise<Notification[]>;
  fetchBookshelf: (type?: "post" | "course" | "event" | "article") => Promise<BookshelfItem[]>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<UserProfile | null>;
  clearError: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  // Initial state
  profile: null,
  notifications: [],
  unreadNotificationCount: 0,
  bookshelf: [],
  isLoadingProfile: false,
  isLoadingNotifications: false,
  isLoadingBookshelf: false,
  error: null,

  // Fetch current user profile
  fetchProfile: async () => {
    set({ isLoadingProfile: true, error: null });
    try {
      const profile = await userService.getCurrentProfile();
      set({ profile, isLoadingProfile: false });
      return profile;
    } catch (error: any) {
      const errorMessage = error instanceof AppError ? error.message : "Failed to fetch profile";
      set({ isLoadingProfile: false, error: errorMessage });
      return null;
    }
  },

  // Fetch user notifications
  fetchNotifications: async () => {
    set({ isLoadingNotifications: true, error: null });
    try {
      const notifications = await userService.getNotifications(50, 0);
      const unreadCount = notifications.filter(n => !n.read).length;
      set({ 
        notifications, 
        unreadNotificationCount: unreadCount,
        isLoadingNotifications: false 
      });
      return notifications;
    } catch (error: any) {
      const errorMessage = error instanceof AppError ? error.message : "Failed to fetch notifications";
      set({ isLoadingNotifications: false, error: errorMessage });
      return [];
    }
  },

  // Fetch user bookshelf
  fetchBookshelf: async (type) => {
    set({ isLoadingBookshelf: true, error: null });
    try {
      const bookshelf = await userService.getBookshelf(type);
      set({ bookshelf, isLoadingBookshelf: false });
      return bookshelf;
    } catch (error: any) {
      const errorMessage = error instanceof AppError ? error.message : "Failed to fetch bookshelf";
      set({ isLoadingBookshelf: false, error: errorMessage });
      return [];
    }
  },

  // Mark a notification as read
  markNotificationRead: async (notificationId: string) => {
    try {
      await userService.markNotificationsRead([notificationId]);
      
      // Update local state
      set(state => {
        const updatedNotifications = state.notifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        );
        
        const unreadCount = updatedNotifications.filter(n => !n.read).length;
        
        return { 
          notifications: updatedNotifications,
          unreadNotificationCount: unreadCount
        };
      });
    } catch (error: any) {
      const errorMessage = error instanceof AppError ? error.message : "Failed to mark notification as read";
      set({ error: errorMessage });
    }
  },

  // Mark all notifications as read
  markAllNotificationsRead: async () => {
    try {
      await userService.markAllNotificationsRead();
      
      // Update local state
      set(state => ({
        notifications: state.notifications.map(notification => ({ ...notification, read: true })),
        unreadNotificationCount: 0
      }));
    } catch (error: any) {
      const errorMessage = error instanceof AppError ? error.message : "Failed to mark all notifications as read";
      set({ error: errorMessage });
    }
  },

  // Update user profile
  updateProfile: async (data: Partial<UserProfile>) => {
    set({ isLoadingProfile: true, error: null });
    try {
      // Our userService.updateProfile only accepts certain fields, so we need to extract those
      const updateData = {
        name: data.name,
        bio: data.bio,
        location: data.location,
        website: data.website,
        avatar: data.avatar,
      };
      
      // Filter out undefined values
      const filteredData: any = {};
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) {
          filteredData[key] = value;
        }
      });
      
      const updatedProfile = await userService.updateProfile(filteredData);
      set({ profile: updatedProfile, isLoadingProfile: false });
      return updatedProfile;
    } catch (error: any) {
      const errorMessage = error instanceof AppError ? error.message : "Failed to update profile";
      set({ isLoadingProfile: false, error: errorMessage });
      return null;
    }
  },

  // Clear error state
  clearError: () => set({ error: null }),
}));

export default useUserStore;