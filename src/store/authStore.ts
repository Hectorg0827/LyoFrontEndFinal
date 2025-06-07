import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, createJSONStorage } from "zustand/middleware";
import ENV from "@config/env";
import apiService from "@services/apiService";
import { ErrorHandler, ErrorType } from "@utils/errorHandler";

// User authentication types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
  // We don't store the token here, as it's managed separately
}

export interface AuthState {
  // Authentication state
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  
  // Authentication actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  refreshAuth: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  
  // State management
  setUser: (user: AuthUser | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Create auth store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
      
      // Set user data
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      // Set error message
      setError: (error) => set({ error }),
      
      // Clear error message
      clearError: () => set({ error: null }),
      
      // Login action
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would call an API endpoint
          const response = await apiService.login({ email, password });
          
          // Store auth token
          await AsyncStorage.setItem(ENV.AUTH_STORAGE_KEY, response.token);
          
          // Update state with user data
          set({ 
            isLoading: false, 
            isAuthenticated: true, 
            user: {
              id: response.user.id,
              email: response.user.email,
              name: response.user.name,
              avatar: response.user.avatar,
              isVerified: true, // Assuming verified if login successful
              createdAt: new Date().toISOString() // Might come from response
            }
          });
          
          return true;
        } catch (error) {
          const appError = ErrorHandler.processError(error, "authStore.login");
          set({ 
            isLoading: false, 
            error: appError.getUserFriendlyMessage()
          });
          return false;
        }
      },
      
      // Register action
      register: async (email, password, name) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiService.register({ 
            email, 
            password, 
            name 
          });
          
          // Store auth token
          await AsyncStorage.setItem(ENV.AUTH_STORAGE_KEY, response.token);
          
          // Update state with user data
          set({ 
            isLoading: false, 
            isAuthenticated: true, 
            user: {
              id: response.user.id,
              email: response.user.email,
              name: response.user.name,
              avatar: response.user.avatar,
              isVerified: false, // Typically users start unverified
              createdAt: new Date().toISOString() // Might come from response
            }
          });
          
          return true;
        } catch (error) {
          const appError = ErrorHandler.processError(error, "authStore.register");
          set({ 
            isLoading: false, 
            error: appError.getUserFriendlyMessage()
          });
          return false;
        }
      },
      
      // Logout action
      logout: async () => {
        set({ isLoading: true });
        try {
          // Call logout API if connected
          try {
            await apiService.logout();
          } catch (error) {
            console.warn("Logout API error (continuing):", error);
          }
          
          // Remove token from storage
          await AsyncStorage.removeItem(ENV.AUTH_STORAGE_KEY);
          
          // Clear user data and authentication state
          set({ 
            isLoading: false, 
            isAuthenticated: false, 
            user: null 
          });
        } catch (error) {
          const appError = ErrorHandler.processError(error, "authStore.logout");
          console.error("Logout error:", appError);
          set({ 
            isLoading: false, 
            error: appError.getUserFriendlyMessage()
          });
        }
      },
      
      // Check if user is authenticated
      checkAuth: async () => {
        set({ isLoading: true });
        try {
          // Check if token exists
          const token = await AsyncStorage.getItem(ENV.AUTH_STORAGE_KEY);
          
          if (!token) {
            set({ isLoading: false, isAuthenticated: false, user: null });
            return false;
          }
          
          // Set token in API service
          apiService.setToken(token);
          
          // Get user profile
          try {
            const userProfile = await apiService.getUserProfile();
            
            set({ 
              isLoading: false, 
              isAuthenticated: true, 
              user: {
                id: userProfile.id,
                name: userProfile.name,
                email: userProfile.email,
                avatar: userProfile.avatar,
                isVerified: true, // Assuming verified if profile is fetched
                createdAt: userProfile.createdAt || new Date().toISOString()
              }
            });
            
            return true;
          } catch (error) {
            // If profile fetch fails, token might be invalid
            const appError = ErrorHandler.processError(error, "authStore.checkAuth");
            
            // Only clear auth if it's an auth error (401)
            if (ErrorHandler.isErrorType(appError, ErrorType.Auth)) {
              await AsyncStorage.removeItem(ENV.AUTH_STORAGE_KEY);
              apiService.clearToken();
              
              set({ 
                isLoading: false, 
                isAuthenticated: false, 
                user: null,
                error: "Session expired. Please login again."
              });
              return false;
            }
            
            // For other errors, try mock user but keep token
            // (network issues might prevent profile fetch but token could still be valid)
            const mockUser: AuthUser = {
              id: "user-fallback",
              email: "user@example.com",
              name: "User",
              isVerified: true,
              createdAt: new Date().toISOString(),
            };
            
            set({ 
              isLoading: false, 
              isAuthenticated: true, 
              user: mockUser,
              // Don't set error for network issues to avoid confusion
              error: ErrorHandler.isErrorType(appError, ErrorType.Network) ? null : appError.getUserFriendlyMessage()
            });
            
            return true;
          }
        } catch (error) {
          // Handle errors outside the try block (e.g., AsyncStorage errors)
          const appError = ErrorHandler.processError(error, "authStore.checkAuth");
          
          // Invalid token or other critical error, clear auth state
          await AsyncStorage.removeItem(ENV.AUTH_STORAGE_KEY);
          apiService.clearToken();
          
          set({ 
            isLoading: false, 
            isAuthenticated: false, 
            user: null,
            error: appError.getUserFriendlyMessage()
          });
          return false;
        }
      },
      
      // Refresh authentication token
      refreshAuth: async () => {
        try {
          // Get current token
          const token = await AsyncStorage.getItem(ENV.AUTH_STORAGE_KEY);
          
          if (!token) {
            set({ isAuthenticated: false, user: null });
            return false;
          }
          
          // In a real implementation, would call refresh token API
          // For now, assume token is still valid
          // TODO: Implement proper token refresh with apiService
          
          return true;
        } catch (error) {
          const appError = ErrorHandler.processError(error, "authStore.refreshAuth");
          console.error("Refresh token error:", appError);
          
          await AsyncStorage.removeItem(ENV.AUTH_STORAGE_KEY);
          apiService.clearToken();
          
          set({ 
            isAuthenticated: false, 
            user: null,
            error: appError.getUserFriendlyMessage()
          });
          return false;
        }
      },
      
      // Reset password
      resetPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          await apiService.post('/auth/reset-password', { email });
          set({ isLoading: false });
          return true;
        } catch (error) {
          const appError = ErrorHandler.processError(error, "authStore.resetPassword");
          set({ 
            isLoading: false, 
            error: appError.getUserFriendlyMessage()
          });
          return false;
        }
      },
    }),
    {
      name: "lyo-auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the authenticated state and user data
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);

export default useAuthStore;