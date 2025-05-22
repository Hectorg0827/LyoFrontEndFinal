// Localization service for handling multiple languages
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import { I18n } from "i18n-js";
import { useState, useEffect } from "react";

import { useAppStore } from "../store/appStore";

// Define available languages for the app
export enum Language {
  ENGLISH = "en",
  SPANISH = "es",
  FRENCH = "fr",
  GERMAN = "de",
  CHINESE_SIMPLIFIED = "zh-CN",
  JAPANESE = "ja",
  KOREAN = "ko",
  PORTUGUESE = "pt",
  ITALIAN = "it",
  RUSSIAN = "ru",
}

// Map of language codes to their display names
export const LanguageNames = {
  [Language.ENGLISH]: "English",
  [Language.SPANISH]: "Español",
  [Language.FRENCH]: "Français",
  [Language.GERMAN]: "Deutsch",
  [Language.CHINESE_SIMPLIFIED]: "简体中文",
  [Language.JAPANESE]: "日本語",
  [Language.KOREAN]: "한국어",
  [Language.PORTUGUESE]: "Português",
  [Language.ITALIAN]: "Italiano",
  [Language.RUSSIAN]: "Русский",
};

// English translations (default)
const en = {
  welcome: "Welcome to Lyo",
  general: {
    save: "Save",
    cancel: "Cancel",
    done: "Done",
    edit: "Edit",
    delete: "Delete",
    search: "Search",
    loading: "Loading...",
    retry: "Retry",
    error: "Something went wrong",
    networkError: "Network error",
  },
  auth: {
    login: "Login",
    register: "Register",
    forgotPassword: "Forgot Password?",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    username: "Username",
    loginTitle: "Welcome back",
    registerTitle: "Create an account",
    continueWith: "Or continue with",
    alreadyHaveAccount: "Already have an account?",
    noAccount: "Don't have an account?",
  },
  home: {
    feed: "Feed",
    stories: "Stories",
    trending: "Trending",
    refresh: "Pull to refresh",
  },
  learn: {
    courses: "Courses",
    myCourses: "My Courses",
    popularCourses: "Popular Courses",
    continueLeaning: "Continue Learning",
    startLearning: "Start Learning",
    modules: "Modules",
    difficulty: "Difficulty",
    duration: "Duration",
    progress: "Progress",
    beginnerLevel: "Beginner",
    intermediateLevel: "Intermediate",
    advancedLevel: "Advanced",
    aiClassroom: "AI Classroom",
    createCourse: "Create My Course",
    enterTopic: "What would you like to learn about?",
    selectDifficulty: "Select difficulty level",
    courseCreation: "Lyo is creating your personalized course...",
    completed: "Completed",
    markAsCompleted: "Mark as Completed",
    enrollCourse: "Enroll in Course",
    createAnotherCourse: "Create Another Course",
  },
  profile: {
    myProfile: "My Profile",
    editProfile: "Edit Profile",
    settings: "Settings",
    achievements: "Achievements",
    streak: "Learning Streak",
    followers: "Followers",
    following: "Following",
    courses: "Courses",
    posts: "Posts",
    saved: "Saved",
    logout: "Log Out",
    accountSettings: "Account Settings",
    privacySettings: "Privacy Settings",
    notifications: "Notifications",
    language: "Language",
    darkMode: "Dark Mode",
    about: "About",
    help: "Help & Support",
  },
  community: {
    events: "Events",
    groups: "Groups",
    nearbyEvents: "Nearby Events",
    joinGroup: "Join Group",
    attendEvent: "Attend",
    createEvent: "Create Event",
    findNearby: "Find Nearby",
    members: "Members",
    attendees: "Attendees",
  },
  notifications: {
    title: "Notifications",
    markAllRead: "Mark All as Read",
    settings: "Notification Settings",
    noNotifications: "You have no notifications",
    today: "Today",
    yesterday: "Yesterday",
    earlier: "Earlier",
    newMessage: "New Message",
    courseUpdate: "Course Update",
    achievement: "Achievement",
    reminder: "Reminder",
  },
  avatar: {
    settings: "Avatar Settings",
    voice: "Avatar Voice",
    appearance: "Avatar Appearance",
    behavior: "Avatar Behavior",
    speakFaster: "Speak Faster",
    speakSlower: "Speak Slower",
    voicePitch: "Voice Pitch",
    customize: "Customize",
  },
  errors: {
    login: "Login failed. Please check your credentials.",
    register: "Registration failed. Please try again.",
    network: "Network error. Please check your connection.",
    server: "Server error. Please try again later.",
    validation: "Please check the highlighted fields.",
    sessionExpired: "Your session has expired. Please login again.",
  },
};

// Spanish translations
const es = {
  welcome: "Bienvenido a Lyo",
  general: {
    save: "Guardar",
    cancel: "Cancelar",
    done: "Hecho",
    edit: "Editar",
    delete: "Eliminar",
    search: "Buscar",
    loading: "Cargando...",
    retry: "Reintentar",
    error: "Algo salió mal",
    networkError: "Error de red",
  },
  auth: {
    login: "Iniciar sesión",
    register: "Registrarse",
    forgotPassword: "¿Olvidó su contraseña?",
    email: "Correo electrónico",
    password: "Contraseña",
    confirmPassword: "Confirmar contraseña",
    username: "Nombre de usuario",
    loginTitle: "Bienvenido de nuevo",
    registerTitle: "Crear una cuenta",
    continueWith: "O continuar con",
    alreadyHaveAccount: "¿Ya tienes una cuenta?",
    noAccount: "¿No tienes una cuenta?",
  },
  // Rest of Spanish translations would go here
};

// French translations
const fr = {
  welcome: "Bienvenue à Lyo",
  general: {
    save: "Sauvegarder",
    cancel: "Annuler",
    done: "Terminé",
    edit: "Modifier",
    delete: "Supprimer",
    search: "Rechercher",
    loading: "Chargement...",
    retry: "Réessayer",
    error: "Quelque chose s'est mal passé",
    networkError: "Erreur de réseau",
  },
  // Rest of French translations would go here
};

// Create the i18n instance
const i18n = new I18n({
  en,
  es,
  fr,
  // Additional translations would be added here
});

// Set default locale and fallback
i18n.defaultLocale = Language.ENGLISH;
i18n.enableFallback = true;

class LocalizationService {
  constructor() {
    this.init();
  }

  // Initialize the service
  async init() {
    try {
      // Get stored language preference
      const storedLocale = await AsyncStorage.getItem("@language");

      // Use stored language, device language, or fall back to English
      const deviceLocale = Localization.locale.split("-")[0];
      const locale = storedLocale || deviceLocale || Language.ENGLISH;

      this.setLanguage(locale);
    } catch (error) {
      console.error("Error initializing localization:", error);
      // Fall back to device locale or English
      const deviceLocale = Localization.locale.split("-")[0];
      this.setLanguage(deviceLocale || Language.ENGLISH);
    }
  }

  // Set current language
  setLanguage(language: string) {
    i18n.locale = language;

    // Store the selected language
    AsyncStorage.setItem("@language", language);
  }

  // Get current language
  getLanguage() {
    return i18n.locale;
  }

  // Get available languages
  getAvailableLanguages() {
    return Object.values(Language);
  }

  // Translate a key
  translate(key: string, options?: any) {
    return i18n.t(key, options);
  }
}

// Create a singleton instance
export const localizationService = new LocalizationService();

// React Hook for using translations in components
export function useTranslation() {
  const currentLanguage = useAppStore((state) => state.currentLanguage);
  const [t, setTranslate] = useState(
    () => (key: string, options?: any) => i18n.t(key, options),
  );

  useEffect(() => {
    // Update the locale when language changes
    i18n.locale = currentLanguage;

    // Update the translation function
    setTranslate(() => (key: string, options?: any) => i18n.t(key, options));
  }, [currentLanguage]);

  return { t, locale: currentLanguage };
}
