// Device performance detection and adaptive optimization
import { Platform, Dimensions } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { AvatarOptimizationSettings, PerformanceMetrics } from '../types/avatar';

interface DeviceCapabilities {
  tier: 'low' | 'medium' | 'high' | 'premium';
  supportsNativeDriver: boolean;
  maxAnimationFPS: number;
  recommendedQuality: 'low' | 'medium' | 'high';
  memoryConstraints: {
    maxCacheSize: number;
    maxConcurrentAnimations: number;
  };
  voiceProcessing: {
    maxSampleRate: number;
    supportedFormats: string[];
    realtimeCapable: boolean;
  };
}

export class DevicePerformanceAdapter {
  private static deviceCapabilities: DeviceCapabilities | null = null;
  private static performanceHistory: PerformanceMetrics[] = [];
  private static lastPerformanceCheck = 0;

  static async initialize(): Promise<DeviceCapabilities> {
    return await this.initializeDeviceProfile();
  }

  static getDeviceTier(): string {
    if (!this.deviceCapabilities) {
      throw new Error('Device performance adapter not initialized. Call initialize() first.');
    }
    return this.deviceCapabilities.tier;
  }

  static getOptimizationSettings(): any {
    if (!this.deviceCapabilities) {
      throw new Error('Device performance adapter not initialized. Call initialize() first.');
    }
    return {
      animationSettings: {
        maxFPS: this.deviceCapabilities.maxAnimationFPS,
        useNativeDriver: this.deviceCapabilities.supportsNativeDriver,
        quality: this.deviceCapabilities.recommendedQuality,
      },
      memorySettings: this.deviceCapabilities.memoryConstraints,
      voiceSettings: this.deviceCapabilities.voiceProcessing,
    };
  }

  static async initializeDeviceProfile(): Promise<DeviceCapabilities> {
    if (this.deviceCapabilities) {
      return this.deviceCapabilities;
    }

    const deviceInfo = {
      model: await DeviceInfo.getModel(),
      manufacturer: await DeviceInfo.getManufacturer(),
      systemVersion: await DeviceInfo.getSystemVersion(),
      totalMemory: await DeviceInfo.getTotalMemory(),
      usedMemory: await DeviceInfo.getUsedMemory(),
      freeDiskStorage: await DeviceInfo.getFreeDiskStorage(),
      isEmulator: await DeviceInfo.isEmulator(),
      deviceType: await DeviceInfo.getDeviceType(),
    };

    const screenInfo = Dimensions.get('screen');
    const windowInfo = Dimensions.get('window');

    // Calculate device tier based on multiple factors
    const deviceTier = this.calculateDeviceTier(deviceInfo, screenInfo);
    
    this.deviceCapabilities = {
      tier: deviceTier,
      supportsNativeDriver: Platform.OS === 'ios' || (Platform.OS === 'android' && typeof Platform.Version === 'number' && Platform.Version >= 21),
      maxAnimationFPS: this.getMaxAnimationFPS(deviceTier),
      recommendedQuality: this.getRecommendedQuality(deviceTier),
      memoryConstraints: this.getMemoryConstraints(deviceInfo.totalMemory, deviceTier),
      voiceProcessing: this.getVoiceProcessingCapabilities(deviceTier),
    };

    return this.deviceCapabilities;
  }

  private static calculateDeviceTier(
    deviceInfo: any,
    screenInfo: any
  ): 'low' | 'medium' | 'high' | 'premium' {
    let score = 0;

    // Memory scoring (0-30 points)
    const memoryGB = deviceInfo.totalMemory / (1024 * 1024 * 1024);
    if (memoryGB >= 8) score += 30;
    else if (memoryGB >= 6) score += 25;
    else if (memoryGB >= 4) score += 20;
    else if (memoryGB >= 3) score += 15;
    else if (memoryGB >= 2) score += 10;
    else score += 5;

    // Screen resolution scoring (0-25 points)
    const totalPixels = screenInfo.width * screenInfo.height * (screenInfo.scale || 1);
    if (totalPixels >= 2000000) score += 25; // 2M+ pixels (high-end)
    else if (totalPixels >= 1000000) score += 20; // 1M+ pixels (mid-high)
    else if (totalPixels >= 500000) score += 15; // 500K+ pixels (mid)
    else score += 10; // Lower resolution

    // Platform and version scoring (0-20 points)
    if (Platform.OS === 'ios') {
      const version = parseInt(deviceInfo.systemVersion.split('.')[0]);
      if (version >= 15) score += 20;
      else if (version >= 13) score += 15;
      else if (version >= 11) score += 10;
      else score += 5;
    } else {
      const apiLevel = typeof Platform.Version === 'number' ? Platform.Version : parseInt(Platform.Version, 10);
      if (apiLevel >= 30) {
        score += 20;
      } else if (apiLevel >= 28) {
        score += 15;
      } else if (apiLevel >= 23) {
        score += 10;
      } else {
        score += 5;
      }
    }

    // Device type scoring (0-15 points)
    if (deviceInfo.deviceType === 'Tablet') score += 15;
    else if (deviceInfo.deviceType === 'Handset') score += 10;

    // Manufacturer bonus (0-10 points)
    const premiumManufacturers = ['Apple', 'Samsung', 'Google', 'OnePlus'];
    if (premiumManufacturers.includes(deviceInfo.manufacturer)) {
      score += 10;
    }

    // Determine tier based on total score
    if (score >= 85) return 'premium';
    if (score >= 70) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }

  private static getMaxAnimationFPS(tier: string): number {
    switch (tier) {
      case 'premium': return 60;
      case 'high': return 60;
      case 'medium': return 30;
      case 'low': return 15;
      default: return 30;
    }
  }

  private static getRecommendedQuality(tier: string): 'low' | 'medium' | 'high' {
    switch (tier) {
      case 'premium': return 'high';
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'medium';
    }
  }

  private static getMemoryConstraints(totalMemory: number, tier: string) {
    const memoryGB = totalMemory / (1024 * 1024 * 1024);
    
    const constraints = {
      premium: { maxCacheSize: 50 * 1024 * 1024, maxConcurrentAnimations: 5 }, // 50MB
      high: { maxCacheSize: 30 * 1024 * 1024, maxConcurrentAnimations: 4 },    // 30MB
      medium: { maxCacheSize: 20 * 1024 * 1024, maxConcurrentAnimations: 3 },  // 20MB
      low: { maxCacheSize: 10 * 1024 * 1024, maxConcurrentAnimations: 2 },     // 10MB
    };

    return constraints[tier as keyof typeof constraints] || constraints.medium;
  }

  private static getVoiceProcessingCapabilities(tier: string) {
    const capabilities = {
      premium: {
        maxSampleRate: 48000,
        supportedFormats: ['m4a', 'wav', 'webm', 'mp3'],
        realtimeCapable: true,
      },
      high: {
        maxSampleRate: 44100,
        supportedFormats: ['m4a', 'wav', 'webm'],
        realtimeCapable: true,
      },
      medium: {
        maxSampleRate: 22050,
        supportedFormats: ['m4a', 'wav'],
        realtimeCapable: false,
      },
      low: {
        maxSampleRate: 16000,
        supportedFormats: ['m4a'],
        realtimeCapable: false,
      },
    };

    return capabilities[tier as keyof typeof capabilities] || capabilities.medium;
  }

  static getOptimizedSettings(): AvatarOptimizationSettings {
    if (!this.deviceCapabilities) {
      throw new Error('Device profile not initialized. Call initializeDeviceProfile() first.');
    }

    const { tier, memoryConstraints } = this.deviceCapabilities;

    return {
      enablePerformanceMonitoring: tier === 'low',
      reduceAnimationsOnLowEnd: tier === 'low',
      adaptiveQuality: true,
      preloadAssets: tier !== 'low',
      cacheVoiceResponses: tier !== 'low',
      maxCacheSize: memoryConstraints.maxCacheSize,
    };
  }

  static adaptAnimationConfig(baseConfig: any) {
    if (!this.deviceCapabilities) return baseConfig;

    const { tier, maxAnimationFPS } = this.deviceCapabilities;

    // Adjust animation duration based on device tier
    const durationMultiplier = {
      premium: 1.0,
      high: 1.0,
      medium: 1.2,
      low: 1.5,
    };

    return {
      ...baseConfig,
      duration: baseConfig.duration * (durationMultiplier[tier] || 1.0),
      useNativeDriver: this.deviceCapabilities.supportsNativeDriver,
      // Reduce animation complexity on lower-end devices
      skipComplexEasing: tier === 'low',
      maxFPS: maxAnimationFPS,
    };
  }

  static shouldUseFeature(feature: string): boolean {
    if (!this.deviceCapabilities) return true;

    const { tier } = this.deviceCapabilities;

    const featureRequirements = {
      'realtime-voice': ['medium', 'high', 'premium'],
      'complex-animations': ['high', 'premium'],
      'particle-effects': ['premium'],
      'background-processing': ['medium', 'high', 'premium'],
      'voice-caching': ['medium', 'high', 'premium'],
      'performance-monitoring': ['low', 'medium'], // Counterintuitively enabled on lower-end devices
    };

    const allowedTiers = featureRequirements[feature as keyof typeof featureRequirements];
    return !allowedTiers || allowedTiers.includes(tier);
  }

  static recordPerformanceMetrics(metrics: PerformanceMetrics): void {
    this.performanceHistory.push({
      ...metrics,
      lastUpdated: Date.now(),
    });

    // Keep only last 100 entries to prevent memory bloat
    if (this.performanceHistory.length > 100) {
      this.performanceHistory.shift();
    }

    // Check if we need to adjust settings based on performance
    this.checkPerformanceThresholds();
  }

  private static checkPerformanceThresholds(): void {
    const now = Date.now();
    
    // Check performance every 30 seconds
    if (now - this.lastPerformanceCheck < 30000) return;
    
    this.lastPerformanceCheck = now;

    if (this.performanceHistory.length < 5) return;

    const recentMetrics = this.performanceHistory.slice(-5);
    const avgRenderTime = recentMetrics.reduce((sum, m) => sum + m.renderTime, 0) / recentMetrics.length;
    const avgFPS = recentMetrics.reduce((sum, m) => sum + m.animationFPS, 0) / recentMetrics.length;

    // If performance is consistently poor, recommend degraded mode
    if (avgRenderTime > 20 || avgFPS < 20) {
      console.warn('Poor performance detected, consider enabling reduced quality mode');
      // Could emit an event here for the app to react to
    }
  }

  static getPerformanceReport(): string {
    if (!this.deviceCapabilities) {
      return 'Device profile not initialized';
    }

    const { tier, maxAnimationFPS, recommendedQuality } = this.deviceCapabilities;
    const recentMetrics = this.performanceHistory.slice(-10);
    
    const avgMetrics = recentMetrics.length > 0 ? {
      renderTime: recentMetrics.reduce((sum, m) => sum + m.renderTime, 0) / recentMetrics.length,
      animationFPS: recentMetrics.reduce((sum, m) => sum + m.animationFPS, 0) / recentMetrics.length,
      voiceLatency: recentMetrics.reduce((sum, m) => sum + m.voiceLatency, 0) / recentMetrics.length,
      memoryUsage: recentMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) / recentMetrics.length,
    } : null;

    return `
Device Performance Report:
- Tier: ${tier}
- Max Animation FPS: ${maxAnimationFPS}
- Recommended Quality: ${recommendedQuality}
- Native Driver Support: ${this.deviceCapabilities.supportsNativeDriver}

${avgMetrics ? `
Recent Performance (avg of last ${recentMetrics.length} measurements):
- Render Time: ${avgMetrics.renderTime.toFixed(2)}ms
- Animation FPS: ${avgMetrics.animationFPS.toFixed(1)}
- Voice Latency: ${avgMetrics.voiceLatency.toFixed(2)}ms
- Memory Usage: ${avgMetrics.memoryUsage.toFixed(2)}MB
` : 'No performance data available'}
    `.trim();
  }
}
