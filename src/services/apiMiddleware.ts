import { api } from './api';
import { useAppStore } from '../store/appStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage keys for persistent data
 */
const STORAGE_KEYS = {
  AUTH_TOKEN: 'lyo_auth_token',
  USER_DATA: 'lyo_user_data',
};

/**
 * API Middleware to handle common tasks like:
 * - Authentication token storage and retrieval
 * - Request/response processing
 * - Error handling and logging
 */
export const apiMiddleware = {
  /**
   * Initialize the API client with stored authentication token
   */
  async init() {
    try {
      // Try to restore the auth token from storage
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        api.setToken(token);
        
        // Try to restore user data
        const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
        if (userData) {
          const user = JSON.parse(userData);
          useAppStore.getState().setUser(user);
          useAppStore.getState().setAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Failed to restore authentication state:', error);
    }
  },
  
  /**
   * Handle successful login/registration by storing token and user data
   */
  async handleAuthSuccess(token: string, user: any) {
    try {
      api.setToken(token);
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      useAppStore.getState().setUser(user);
      useAppStore.getState().setAuthenticated(true);
    } catch (error) {
      console.error('Failed to save authentication state:', error);
    }
  },
  
  /**
   * Clear authentication data on logout
   */
  async handleLogout() {
    try {
      api.clearToken();
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      
      useAppStore.getState().setUser(null);
      useAppStore.getState().setAuthenticated(false);
    } catch (error) {
      console.error('Failed to clear authentication state:', error);
    }
  },
  
  /**
   * Convert API errors to user-friendly messages
   */
  getErrorMessage(error: any): string {
    if (error?.message) {
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    return 'Something went wrong. Please try again.';
  }
};

// Export a function to initialize the middleware
export const initializeApi = async () => {
  await apiMiddleware.init();
};
