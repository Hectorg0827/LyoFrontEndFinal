import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UserPreferences {
  notificationsEnabled: boolean;
  emailUpdatesEnabled: boolean;
  preferredLanguage: string;
  appTheme: "dark" | "light" | "system";
  fontSize: "small" | "medium" | "large";
  dataSaverMode: boolean;
}

interface User {
  id: string;
  name: string;
  avatar: string; // URL or local identifier
  email?: string;
  preferences: UserPreferences; // User-specific preferences, MUST exist for a logged-in user
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isOnboardingCompleted: boolean;
  appVersion: string;
  currentLanguage: string; // This might be redundant if always derived from user.preferences.preferredLanguage
  analyticsEnabled: boolean;
  lastBackupDate: string | null;

  // Actions
  setUser: (user: User | null) => void;
  login: (userData: User) => void;
  logout: () => void;
  // setAuthenticated: (status: boolean) => void; // Covered by setUser and logout
  setOnboardingCompleted: (status: boolean) => void;
  setAnalyticsEnabled: (enabled: boolean) => void;
  // setCurrentLanguage: (language: string) => void; // Should be part of updateUserPreferences
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
  setLastBackupDate: (date: string | null) => void;
  // Internal action for rehydration if needed, though persist handles much of this
  // _rehydrateExtras: () => Promise<void>;
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
      user: null,
      isAuthenticated: false,
      isOnboardingCompleted: false,
      appVersion: "1.0.2", // Increment or fetch dynamically
      currentLanguage: defaultUserPreferences.preferredLanguage, // Initialize from default
      analyticsEnabled: true,
      lastBackupDate: null,

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          currentLanguage:
            user?.preferences?.preferredLanguage || get().currentLanguage,
        });
      },

      login: (userData) => {
        // Ensure userData always has a preferences object
        const userWithPrefs: User = {
          ...userData,
          preferences: {
            ...defaultUserPreferences, // Start with defaults
            ...(userData.preferences || {}), // Override with any provided prefs
          },
        };
        set({
          user: userWithPrefs,
          isAuthenticated: true,
          currentLanguage: userWithPrefs.preferences.preferredLanguage,
        });
        // Persist theme immediately if it's a critical UI element
        AsyncStorage.setItem("@appTheme", userWithPrefs.preferences.appTheme);
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          currentLanguage: defaultUserPreferences.preferredLanguage, // Reset to default
        });
        AsyncStorage.removeItem("@userToken"); // Example: clear token
        AsyncStorage.removeItem("@appTheme"); // Clear theme preference
      },

      setOnboardingCompleted: (status) => {
        set({ isOnboardingCompleted: status });
        // AsyncStorage.setItem('@onboardingCompleted', status.toString()); // Persist handles this if in partialize
      },

      setAnalyticsEnabled: (enabled) => {
        set({ analyticsEnabled: enabled });
        // AsyncStorage.setItem('@analyticsEnabled', enabled.toString()); // Persist handles this
      },

      updateUserPreferences: (newPrefs) =>
        set((state) => {
          if (state.user) {
            const updatedPreferences: UserPreferences = {
              ...state.user.preferences,
              ...newPrefs,
            };
            // If theme or language changes, update AsyncStorage for immediate non-store access if needed
            if (newPrefs.appTheme) {
              AsyncStorage.setItem("@appTheme", newPrefs.appTheme);
            }
            if (newPrefs.preferredLanguage) {
              AsyncStorage.setItem(
                "@currentLanguage",
                newPrefs.preferredLanguage,
              );
            }
            return {
              user: { ...state.user, preferences: updatedPreferences },
              currentLanguage:
                updatedPreferences.preferredLanguage || state.currentLanguage,
            };
          }
          return {}; // No change if no user
        }),

      setLastBackupDate: (date) => set({ lastBackupDate: date }),
    }),
    {
      name: "lyo-app-storage", // Unique name for AsyncStorage item
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist what's necessary and safe
        user: state.user, // User object (includes their preferences)
        isAuthenticated: state.isAuthenticated,
        isOnboardingCompleted: state.isOnboardingCompleted,
        currentLanguage: state.currentLanguage, // Persisted for quick access before full user object hydration
        analyticsEnabled: state.analyticsEnabled,
        appVersion: state.appVersion, // Good to persist if it influences compatibility
        lastBackupDate: state.lastBackupDate,
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error(
              "Zustand persist: An error occurred during hydration:",
              error,
            );
          } else {
            console.log("Zustand persist: Hydration finished.");
            // Post-hydration logic can go here if needed
            // For example, ensuring the currentLanguage in state matches the user's preference
            if (
              state?.user?.preferences?.preferredLanguage &&
              state.currentLanguage !== state.user.preferences.preferredLanguage
            ) {
              useAppStore.setState({
                currentLanguage: state.user.preferences.preferredLanguage,
              });
            }
            // Similarly, ensure app theme from user preferences is applied if needed by other systems
            if (state?.user?.preferences?.appTheme) {
              AsyncStorage.setItem(
                "@appTheme",
                state.user.preferences.appTheme,
              );
            }
          }
        };
      },
    },
  ),
);

// Optional: Function to initialize or check things after store is ready
// (though onRehydrateStorage is often sufficient)
// const initializeStore = async () => {
//   const state = useAppStore.getState();
//   // Example: if onboarding not completed and no user, navigate to onboarding
// };
// initializeStore();

export default useAppStore;
