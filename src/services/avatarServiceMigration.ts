// Avatar service migration script
// This script helps transition from the original avatarService to optimizedAvatarService

import { optimizedAvatarService } from '../services/optimizedAvatarService';
import { avatarService as originalAvatarService } from '../services/avatarService';

/**
 * Migration wrapper that allows gradual transition from original to optimized service
 * Set useOptimized to true once you've validated the optimized service works correctly
 */
class AvatarServiceMigration {
  private useOptimized = true; // Set to true to use optimized service

  // Proxy methods that route to appropriate service
  async getUserPreferences() {
    if (this.useOptimized) {
      return await optimizedAvatarService.getUserPreferences();
    }
    return await originalAvatarService.getUserPreferences();
  }

  async saveUserPreferences(preferences: any) {
    if (this.useOptimized) {
      return await optimizedAvatarService.saveUserPreferences(preferences);
    }
    return await originalAvatarService.saveUserPreferences(preferences);
  }

  async startVoiceRecognition(audioUri: string) {
    if (this.useOptimized) {
      return await optimizedAvatarService.startVoiceRecognition(audioUri);
    }
    return await originalAvatarService.startVoiceRecognition(audioUri);
  }

  async generateResponse(input: string) {
    if (this.useOptimized) {
      return await optimizedAvatarService.generateResponse(input);
    }
    return await originalAvatarService.generateAIResponse(input);
  }

  // Performance monitoring (only in optimized service)
  getPerformanceReport() {
    if (this.useOptimized) {
      return optimizedAvatarService.getPerformanceReport();
    }
    return 'Performance monitoring not available in original service';
  }

  async optimizeStorage() {
    if (this.useOptimized) {
      return await optimizedAvatarService.optimizeStorage();
    }
    // Original service doesn't have this method
    console.log('Storage optimization not available in original service');
  }

  // Utility methods for testing
  enableOptimizedService() {
    this.useOptimized = true;
    console.log('✅ Switched to optimized avatar service');
  }

  enableOriginalService() {
    this.useOptimized = false;
    console.log('⚠️ Switched to original avatar service (fallback mode)');
  }

  isUsingOptimized() {
    return this.useOptimized;
  }

  getCurrentServiceInfo() {
    return {
      usingOptimized: this.useOptimized,
      serviceName: this.useOptimized ? 'OptimizedAvatarService' : 'OriginalAvatarService',
      features: this.useOptimized ? [
        'Performance monitoring',
        'Smart caching',
        'Device optimization',
        'Enhanced error handling',
        'Memory management'
      ] : [
        'Basic avatar functionality',
        'Voice recognition',
        'User preferences'
      ]
    };
  }
}

// Export singleton instance
export const avatarServiceMigration = new AvatarServiceMigration();

// Export for backward compatibility
export const avatarService = avatarServiceMigration;
