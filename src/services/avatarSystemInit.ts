// Avatar System Performance Initialization
// This file initializes the optimized avatar system with monitoring and adaptive features

import { AvatarPerformanceMonitor } from '../utils/performanceMonitor';
import { DevicePerformanceAdapter } from '../utils/devicePerformanceAdapter';
import { AvatarCacheManager } from '../utils/smartCache';
import { EnhancedErrorHandler } from '../services/enhancedErrorHandler';

export interface AvatarSystemConfig {
  enablePerformanceMonitoring: boolean;
  enableAdaptiveQuality: boolean;
  enableSmartCaching: boolean;
  enableEnhancedErrorHandling: boolean;
  cacheConfig?: {
    maxVoiceResponses: number;
    maxAnimationCache: number;
    maxUserDataCache: number;
  };
}

const DEFAULT_CONFIG: AvatarSystemConfig = {
  enablePerformanceMonitoring: true,
  enableAdaptiveQuality: true,
  enableSmartCaching: true,
  enableEnhancedErrorHandling: true,
  cacheConfig: {
    maxVoiceResponses: 50,
    maxAnimationCache: 20,
    maxUserDataCache: 100,
  },
};

/**
 * Initialize the optimized avatar system
 * Call this during app startup
 */
export const initializeAvatarSystem = async (
  config: Partial<AvatarSystemConfig> = {}
): Promise<void> => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  try {
    console.log('🚀 Initializing Avatar System Optimizations...');

    // 1. Initialize device performance detection
    await DevicePerformanceAdapter.initialize();
    const deviceTier = DevicePerformanceAdapter.getDeviceTier();
    console.log(`📱 Device tier detected: ${deviceTier}`);

    // 2. Configure performance monitoring
    if (finalConfig.enablePerformanceMonitoring) {
      await AvatarPerformanceMonitor.initialize({
        enableRealTimeTracking: true,
        trackingInterval: 1000,
        adaptiveQuality: finalConfig.enableAdaptiveQuality,
      });
      console.log('📊 Performance monitoring enabled');
    }

    // 3. Initialize smart caching
    if (finalConfig.enableSmartCaching) {
      await AvatarCacheManager.initialize(finalConfig.cacheConfig);
      console.log('🧠 Smart caching system initialized');
    }

    // 4. Setup enhanced error handling
    if (finalConfig.enableEnhancedErrorHandling) {
      EnhancedErrorHandler.initialize({
        enableRecoveryStrategies: true,
        enableUserNotifications: true,
        maxRetryAttempts: 3,
      });
      console.log('🛡️ Enhanced error handling enabled');
    }

    // 5. Apply device-specific optimizations
    const optimizations = DevicePerformanceAdapter.getOptimizationSettings();
    console.log('⚙️ Applied device optimizations:', optimizations);

    console.log('✅ Avatar system optimization complete!');
    
    // Log performance baseline
    const metrics = await AvatarPerformanceMonitor.getCurrentMetrics();
    console.log('📈 Initial performance metrics:', metrics);

  } catch (error) {
    console.error('❌ Failed to initialize avatar system optimizations:', error);
    throw error;
  }
};

/**
 * Get current system performance status
 */
export const getSystemStatus = async () => {
  const metrics = await AvatarPerformanceMonitor.getCurrentMetrics();
  const deviceTier = DevicePerformanceAdapter.getDeviceTier();
  const cacheStats = AvatarCacheManager.getCacheStats();
  
  return {
    deviceTier,
    performance: metrics,
    cache: cacheStats,
    optimizationsActive: true,
  };
};

/**
 * Reset all caches and performance counters
 */
export const resetSystem = async (): Promise<void> => {
  await AvatarCacheManager.clearAll();
  AvatarPerformanceMonitor.reset();
  console.log('🔄 Avatar system reset complete');
};

/**
 * Enable/disable specific optimizations at runtime
 */
export const toggleOptimization = async (
  optimization: keyof AvatarSystemConfig,
  enabled: boolean
): Promise<void> => {
  switch (optimization) {
    case 'enablePerformanceMonitoring':
      if (enabled) {
        await AvatarPerformanceMonitor.start();
      } else {
        AvatarPerformanceMonitor.stop();
      }
      break;
    case 'enableSmartCaching':
      if (!enabled) {
        await AvatarCacheManager.clearAll();
      }
      break;
    // Add other optimizations as needed
  }
  
  console.log(`🔧 ${optimization} ${enabled ? 'enabled' : 'disabled'}`);
};
