import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, createJSONStorage } from "zustand/middleware";
import ENV from "../config/env";

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
          // For now, we'll simulate a successful login with a mock response
          
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          if (ENV.USE_BACKEND_API) {
            // TODO: Call real API endpoint
            // const response = await apiService.login(email, password);
            // await AsyncStorage.setItem(ENV.AUTH_STORAGE_KEY, response.token);
            // set({ isLoading: false, isAuthenticated: true, user: response.user });
            
            // Mock for now
            if (email === 'user@example.com' && password === 'password') {
              const mockUser: AuthUser = {
                id: "user-1",
                email: email,
                name: "Test User",
                avatar: "https://via.placeholder.com/150",
                isVerified: true,
                createdAt: new Date().toISOString(),
              };
              
              // Store mock token
              await AsyncStorage.setItem(ENV.AUTH_STORAGE_KEY, 'mock-jwt-token');
              set({ isLoading: false, isAuthenticated: true, user: mockUser });
              return true;
            } else {
              set({ isLoading: false, error: "Invalid email or password" });
              return false;
            }
          } else {
            // When using mock data, always succeed with test user
            const mockUser: AuthUser = {
              id: "user-1",
              email: email || "user@example.com",
              name: "Test User",
              avatar: "https://via.placeholder.com/150",
              isVerified: true,
              createdAt: new Date().toISOString(),
            };
            
            // Store mock token
            await AsyncStorage.setItem(ENV.AUTH_STORAGE_KEY, 'mock-jwt-token');
            set({ isLoading: false, isAuthenticated: true, user: mockUser });
            return true;
          }
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || "Failed to login. Please try again." 
          });
          return false;
        }
      },
      
      // Register action
      register: async (email, password, name) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          if (ENV.USE_BACKEND_API) {
            // TODO: Call real API endpoint
            // const response = await apiService.register(email, password, name);
            // await AsyncStorage.setItem(ENV.AUTH_STORAGE_KEY, response.token);
            // set({ isLoading: false, isAuthenticated: true, user: response.user });
            
            // Mock for now
            const mockUser: AuthUser = {
              id: "user-" + Date.now(),
              email: email,
              name: name,
              isVerified: false,
              createdAt: new Date().toISOString(),
            };
            
            // Store mock token
            await AsyncStorage.setItem(ENV.AUTH_STORAGE_KEY, 'mock-jwt-token');
            set({ isLoading: false, isAuthenticated: true, user: mockUser });
            return true;
          } else {
            // When using mock data, always succeed with test user
            const mockUser: AuthUser = {
              id: "user-" + Date.now(),
              email: email,
              name: name,
              isVerified: false,
              createdAt: new Date().toISOString(),
            };
            
            // Store mock token
            await AsyncStorage.setItem(ENV.AUTH_STORAGE_KEY, 'mock-jwt-token');
            set({ isLoading: false, isAuthenticated: true, user: mockUser });
            return true;
          }
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || "Failed to register. Please try again." 
          });
          return false;
        }
      },
      
      // Logout action
      logout: async () => {
        set({ isLoading: true });
        try {
          // Remove token from storage
          await AsyncStorage.removeItem(ENV.AUTH_STORAGE_KEY);
          
          // Clear user data and authentication state
          set({ 
            isLoading: false, 
            isAuthenticated: false, 
            user: null 
          });
        } catch (error: any) {
          console.error("Logout error:", error);
          set({ 
            isLoading: false, 
            error: error.message || "Failed to logout. Please try again." 
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
          
          if (ENV.USE_BACKEND_API) {
            // TODO: Validate token with API
            // const user = await apiService.validateToken(token);
            // set({ isLoading: false, isAuthenticated: true, user });
            
            // Mock for now
            const mockUser: AuthUser = {
              id: "user-1",
              email: "user@example.com",
              name: "Test User",
              avatar: "https://via.placeholder.com/150",
              isVerified: true,
              createdAt: new Date().toISOString(),
            };
            
            set({ isLoading: false, isAuthenticated: true, user: mockUser });
            return true;
          } else {
            // When using mock data, always return a valid session
            const mockUser: AuthUser = {
              id: "user-1",
              email: "user@example.com",
              name: "Test User",
              avatar: "https://via.placeholder.com/150",
              isVerified: true,
              createdAt: new Date().toISOString(),
            };
            
            set({ isLoading: false, isAuthenticated: true, user: mockUser });
            return true;
          }
        } catch (error: any) {
          // Invalid token or error, clear auth state
          await AsyncStorage.removeItem(ENV.AUTH_STORAGE_KEY);
          set({ 
            isLoading: false, 
            isAuthenticated: false, 
            user: null,
            error: error.message || "Session expired. Please login again." 
          });
          return false;
        }
      },
      
      // Refresh authentication token
      refreshAuth: async () => {
        try {
          // In a real app, this would refresh the JWT token
          // For now, we'll just check if the current token exists
          const token = await AsyncStorage.getItem(ENV.AUTH_STORAGE_KEY);
          
          if (!token) {
            set({ isAuthenticated: false, user: null });
            return false;
          }
          
          // Mock: Set a new token
          await AsyncStorage.setItem(ENV.AUTH_STORAGE_KEY, 'mock-jwt-token-' + Date.now());
          return true;
        } catch (error: any) {
          console.error("Refresh token error:", error);
          await AsyncStorage.removeItem(ENV.AUTH_STORAGE_KEY);
          set({ 
            isAuthenticated: false, 
            user: null,
            error: error.message || "Failed to refresh session. Please login again." 
          });
          return false;
        }
      },
      
      // Reset password
      resetPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // In a real app, this would call an API endpoint
          // For now, always succeed
          set({ isLoading: false });
          return true;
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || "Failed to reset password. Please try again." 
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