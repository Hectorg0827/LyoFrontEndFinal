import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ErrorHandler, ErrorType } from "../utils/errorHandler";
import ENV from "../config/env";
import apiService from "../services/apiService";
import { apiMiddleware } from "../services/apiMiddleware";

interface UserPreferences {
  notificationsEnabled: boolean;
  emailUpdatesEnabled: boolean;
  preferredLanguage: string;
  appTheme: "dark" | "light" | "system";
  fontSize: "small" | "medium" | "large";
  dataSaverMode: boolean;
}

// User authentication interface - matches API response
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AppState {
  // App settings
  isOnboardingCompleted: boolean;
  appVersion: string;
  currentLanguage: string;
  analyticsEnabled: boolean;
  lastBackupDate: string | null;
  userPreferences: UserPreferences;

  // Authentication state
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setOnboardingCompleted: (status: boolean) => void;
  setAnalyticsEnabled: (enabled: boolean) => void;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
  setLastBackupDate: (date: string | null) => void;
  setCurrentLanguage: (language: string) => void;

  // Authentication actions
  setUser: (user: User | null) => void;
  setAuthenticated: (status: boolean) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const defaultUserPreferences: UserPreferences = {
  notificationsEnabled: true,
  emailUpdatesEnabled: false,
  preferredLanguage: "en",
  appTheme: "system",
  fontSize: "medium",
  dataSaverMode: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // App settings
      isOnboardingCompleted: false,
      appVersion: "1.0.2", // Increment or fetch dynamically
      currentLanguage: defaultUserPreferences.preferredLanguage,
      analyticsEnabled: true,
      lastBackupDate: null,
      userPreferences: defaultUserPreferences,

      // Authentication state
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,

      setOnboardingCompleted: (status) => {
        set({ isOnboardingCompleted: status });
        
        // Also store in AsyncStorage directly for access during app initialization
        try {
          AsyncStorage.setItem('@onboardingCompleted', status.toString());
        } catch (error) {
          ErrorHandler.processError(error, "appStore.setOnboardingCompleted");
        }
      },

      setAnalyticsEnabled: (enabled) => {
        set({ analyticsEnabled: enabled });
      },
      
      setCurrentLanguage: (language) => {
        set({ currentLanguage: language });
        
        // Update preferences too to keep in sync
        const currentPrefs = get().userPreferences;
        if (currentPrefs.preferredLanguage !== language) {
          set({
            userPreferences: {
              ...currentPrefs,
              preferredLanguage: language
            }
          });
        }
        
        // Store in AsyncStorage for quick access
        try {
          AsyncStorage.setItem("@currentLanguage", language);
        } catch (error) {
          ErrorHandler.processError(error, "appStore.setCurrentLanguage");
        }
      },

      updateUserPreferences: (newPrefs) =>
        set((state) => {
          const updatedPreferences = {
            ...state.userPreferences,
            ...newPrefs,
          };
          
          // If theme or language changes, update AsyncStorage for immediate access
          try {
            if (newPrefs.appTheme) {
              AsyncStorage.setItem("@appTheme", newPrefs.appTheme);
            }
            
            if (newPrefs.preferredLanguage) {
              AsyncStorage.setItem("@currentLanguage", newPrefs.preferredLanguage);
              
              // Also update currentLanguage state
              set({ currentLanguage: newPrefs.preferredLanguage });
            }
          } catch (error) {
            ErrorHandler.processError(error, "appStore.updateUserPreferences");
          }
          
          return {
            userPreferences: updatedPreferences,
          };
        }),

      setLastBackupDate: (date) => set({ lastBackupDate: date }),

      // Authentication actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAuthenticated: (status) => set({ isAuthenticated: status }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Login action
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiService.login({ email, password });
          
          // Store auth token via apiMiddleware
          await apiMiddleware.handleAuthSuccess(response.token, response.user);
          
          set({ isLoading: false, isAuthenticated: true, user: response.user });
          return true;
        } catch (error) {
          const appError = ErrorHandler.processError(error, "appStore.login");
          set({ isLoading: false, error: appError.message });
          return false;
        }
      },

      // Register action
      register: async (email, password, name) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiService.register({ email, password, name });
          
          // Store auth token via apiMiddleware
          await apiMiddleware.handleAuthSuccess(response.token, response.user);
          
          set({ isLoading: false, isAuthenticated: true, user: response.user });
          return true;
        } catch (error) {
          const appError = ErrorHandler.processError(error, "appStore.register");
          set({ isLoading: false, error: appError.message });
          return false;
        }
      },

      // Logout action
      logout: async () => {
        set({ isLoading: true });
        try {
          await apiMiddleware.handleLogout();
          
          set({ 
            isLoading: false, 
            isAuthenticated: false, 
            user: null, 
            error: null 
          });
        } catch (error) {
          const appError = ErrorHandler.processError(error, "appStore.logout");
          set({ isLoading: false, error: appError.message });
        }
      },

      // Reset password action
      resetPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          // For now, just simulate success - implement actual API call later
          await new Promise(resolve => setTimeout(resolve, 1000));
          set({ isLoading: false });
          return true;
        } catch (error) {
          const appError = ErrorHandler.processError(error, "appStore.resetPassword");
          set({ isLoading: false, error: appError.message });
          return false;
        }
      },
    }),
    {
      name: "lyo-app-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist what's necessary and safe
        isOnboardingCompleted: state.isOnboardingCompleted,
        currentLanguage: state.currentLanguage,
        analyticsEnabled: state.analyticsEnabled,
        appVersion: state.appVersion,
        lastBackupDate: state.lastBackupDate,
        userPreferences: state.userPreferences,
        // Note: We don't persist authentication state here - handled by apiMiddleware
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            const appError = ErrorHandler.processError(
              error, 
              "appStore.onRehydrateStorage"
            );
            console.error("Zustand persist: Hydration error:", appError.message);
          } else {
            console.log("Zustand persist: Hydration finished.");
            
            // Apply app theme from user preferences if available
            try {
              if (state?.userPreferences?.appTheme) {
                AsyncStorage.setItem(
                  "@appTheme",
                  state.userPreferences.appTheme,
                );
              }
            } catch (storageError) {
              ErrorHandler.processError(storageError, "appStore.applyThemeAfterHydration");
            }
          }
        };
      },
    },
  ),
);

export default useAppStore;
