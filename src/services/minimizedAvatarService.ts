// Simplified avatar service
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ErrorHandler, ErrorType } from './errorHandler';
import { UserPreferences } from '../types/avatar';

const STORAGE_KEYS = {
  PREFERENCES: 'lyo_user_preferences',
};

class SimplifiedAvatarService {
  private defaultPreferences: UserPreferences = {
    voiceEnabled: true,
    animationsEnabled: true,
    avatarColor: '#8E54E9',
    voiceRate: 1.0,
    voicePitch: 1.0,
    learningInterests: [],
    courseHistory: [],
    accessibilityMode: false,
    subtitlesEnabled: false,
    avatarSize: 'medium',
    avatarPersonality: 'friendly',
    autoHideAvatar: false,
  };

  // Get user preferences
  async getUserPreferences(): Promise<UserPreferences> {
    try {
      const savedPrefs = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (!savedPrefs) {
        return this.defaultPreferences;
      }

      const preferences = JSON.parse(savedPrefs) as UserPreferences;
      return preferences;
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      return this.defaultPreferences;
    }
  }

  // Update user preferences
  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      const currentPrefs = await this.getUserPreferences();
      const updatedPrefs = { ...currentPrefs, ...preferences };
      
      await AsyncStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updatedPrefs));
      return updatedPrefs;
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      throw ErrorHandler.createError(
        ErrorType.Storage,
        'Failed to update user preferences',
        error
      );
    }
  }
}

export const simplifiedAvatarService = new SimplifiedAvatarService();
