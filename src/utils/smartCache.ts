// Smart caching system for avatar voice responses and animations
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import { DevicePerformanceAdapter } from './devicePerformanceAdapter';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  priority: number;
  size: number; // In bytes
}

interface CacheConfig {
  maxSize: number; // Maximum cache size in bytes
  maxAge: number; // Maximum age in milliseconds
  maxEntries: number; // Maximum number of entries
  compressionEnabled: boolean;
}

export class SmartCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private cacheSize = 0;
  private config: CacheConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 50 * 1024 * 1024, // 50MB default
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      maxEntries: 1000,
      compressionEnabled: true,
      ...config,
    };

    // Start periodic cleanup
    this.startCleanupInterval();
  }

  private generateKey(input: string): string {
    return CryptoJS.MD5(input).toString();
  }

  private calculateSize(data: T): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      // Fallback for environments without Blob
      return JSON.stringify(data).length * 2; // Rough estimate
    }
  }

  private shouldEvict(): boolean {
    return (
      this.cacheSize > this.config.maxSize ||
      this.cache.size > this.config.maxEntries
    );
  }

  private evictLeastUsed(): void {
    if (this.cache.size === 0) return;

    // Sort by priority (combination of access count, recency, and age)
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => {
      const age = Date.now() - entry.timestamp;
      const recency = Date.now() - entry.lastAccessed;
      const priority = entry.accessCount / (1 + age / 3600000) / (1 + recency / 3600000);
      return { key, priority, entry };
    });

    entries.sort((a, b) => a.priority - b.priority);

    // Remove the least useful entries until we're under limits
    while (this.shouldEvict() && entries.length > 0) {
      const { key, entry } = entries.shift()!;
      this.cache.delete(key);
      this.cacheSize -= entry.size;
    }
  }

  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > this.config.maxAge;
  }

  async set(key: string, data: T, priority = 1): Promise<void> {
    const hashedKey = this.generateKey(key);
    const size = this.calculateSize(data);
    const timestamp = Date.now();

    // Remove existing entry if present
    const existing = this.cache.get(hashedKey);
    if (existing) {
      this.cacheSize -= existing.size;
    }

    // Create new entry
    const entry: CacheEntry<T> = {
      data,
      timestamp,
      accessCount: 1,
      lastAccessed: timestamp,
      priority,
      size,
    };

    this.cache.set(hashedKey, entry);
    this.cacheSize += size;

    // Evict if necessary
    if (this.shouldEvict()) {
      this.evictLeastUsed();
    }

    // Persist to storage for important entries
    if (priority > 5) {
      try {
        await AsyncStorage.setItem(`cache_${hashedKey}`, JSON.stringify(entry));
      } catch (error) {
        console.warn('Failed to persist cache entry:', error);
      }
    }
  }

  async get(key: string): Promise<T | null> {
    const hashedKey = this.generateKey(key);
    let entry = this.cache.get(hashedKey);

    // Try to load from persistent storage if not in memory
    if (!entry) {
      try {
        const stored = await AsyncStorage.getItem(`cache_${hashedKey}`);
        if (stored) {
          entry = JSON.parse(stored) as CacheEntry<T>;
          
          // Check if still valid
          if (!this.isExpired(entry)) {
            this.cache.set(hashedKey, entry);
            this.cacheSize += entry.size;
          } else {
            await AsyncStorage.removeItem(`cache_${hashedKey}`);
            return null;
          }
        }
      } catch (error) {
        console.warn('Failed to load from persistent cache:', error);
      }
    }

    if (!entry || this.isExpired(entry)) {
      this.cache.delete(hashedKey);
      if (entry) {
        this.cacheSize -= entry.size;
      }
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    return entry.data;
  }

  has(key: string): boolean {
    const hashedKey = this.generateKey(key);
    const entry = this.cache.get(hashedKey);
    return entry ? !this.isExpired(entry) : false;
  }

  delete(key: string): boolean {
    const hashedKey = this.generateKey(key);
    const entry = this.cache.get(hashedKey);
    
    if (entry) {
      this.cache.delete(hashedKey);
      this.cacheSize -= entry.size;
      
      // Remove from persistent storage
      AsyncStorage.removeItem(`cache_${hashedKey}`).catch(console.warn);
      return true;
    }
    
    return false;
  }

  clear(): void {
    this.cache.clear();
    this.cacheSize = 0;
    
    // Clear persistent storage entries
    AsyncStorage.getAllKeys().then(keys => {
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      if (cacheKeys.length > 0) {
        AsyncStorage.multiRemove(cacheKeys).catch(console.warn);
      }
    }).catch(console.warn);
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000); // Cleanup every 5 minutes
  }

  private cleanup(): void {
    const expiredKeys: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        expiredKeys.push(key);
        this.cacheSize -= entry.size;
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));

    // Also evict if over limits
    if (this.shouldEvict()) {
      this.evictLeastUsed();
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      totalSize: this.cacheSize,
      maxSize: this.config.maxSize,
      hitRate: this.calculateHitRate(),
      oldestEntry: this.getOldestEntry(),
      averageAccessCount: this.getAverageAccessCount(),
    };
  }

  private calculateHitRate(): number {
    if (this.cache.size === 0) return 0;
    const totalAccesses = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.accessCount, 0);
    return totalAccesses / this.cache.size;
  }

  private getOldestEntry(): number {
    if (this.cache.size === 0) return 0;
    return Math.min(...Array.from(this.cache.values()).map(entry => entry.timestamp));
  }

  private getAverageAccessCount(): number {
    if (this.cache.size === 0) return 0;
    const totalAccesses = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.accessCount, 0);
    return totalAccesses / this.cache.size;
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

// Specialized caches for avatar system
export class VoiceResponseCache extends SmartCache<string> {
  constructor() {
    const deviceSettings = DevicePerformanceAdapter.getOptimizedSettings();
    super({
      maxSize: deviceSettings.maxCacheSize * 0.6, // 60% for voice responses
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      maxEntries: 500,
      compressionEnabled: true,
    });
  }

  async cacheResponse(input: string, response: string, priority = 1): Promise<void> {
    const key = `voice_${input.toLowerCase().trim()}`;
    await this.set(key, response, priority);
  }

  async getCachedResponse(input: string): Promise<string | null> {
    const key = `voice_${input.toLowerCase().trim()}`;
    return await this.get(key);
  }
}

export class AnimationCache extends SmartCache<any> {
  constructor() {
    const deviceSettings = DevicePerformanceAdapter.getOptimizedSettings();
    super({
      maxSize: deviceSettings.maxCacheSize * 0.3, // 30% for animations
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      maxEntries: 200,
      compressionEnabled: false, // Animation data doesn't compress well
    });
  }

  async cacheAnimationConfig(state: string, config: any): Promise<void> {
    await this.set(`anim_${state}`, config, 3);
  }

  async getCachedAnimationConfig(state: string): Promise<any | null> {
    return await this.get(`anim_${state}`);
  }
}

export class UserDataCache extends SmartCache<any> {
  constructor() {
    const deviceSettings = DevicePerformanceAdapter.getOptimizedSettings();
    super({
      maxSize: deviceSettings.maxCacheSize * 0.1, // 10% for user data
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      maxEntries: 100,
      compressionEnabled: true,
    });
  }

  async cacheUserPreferences(userId: string, preferences: any): Promise<void> {
    await this.set(`prefs_${userId}`, preferences, 10); // High priority
  }

  async getCachedUserPreferences(userId: string): Promise<any | null> {
    return await this.get(`prefs_${userId}`);
  }

  async cacheConversationHistory(sessionId: string, history: any[]): Promise<void> {
    await this.set(`conv_${sessionId}`, history, 5);
  }

  async getCachedConversationHistory(sessionId: string): Promise<any[] | null> {
    return await this.get(`conv_${sessionId}`);
  }
}

// Cache manager to coordinate all caches
export class AvatarCacheManager {
  private static voiceCache = new VoiceResponseCache();
  private static animationCache = new AnimationCache();
  private static userDataCache = new UserDataCache();

  static getVoiceCache(): VoiceResponseCache {
    return this.voiceCache;
  }

  static getAnimationCache(): AnimationCache {
    return this.animationCache;
  }

  static getUserDataCache(): UserDataCache {
    return this.userDataCache;
  }

  static async initialize(config?: any): Promise<void> {
    // Initialize caches with optional config
    console.log('🧠 Initializing smart cache system...');
    // Cache instances are already created, just log initialization
    const stats = this.getAllStats();
    console.log('📊 Initial cache stats:', stats);
  }

  static getCacheStats() {
    return this.getAllStats();
  }

  static async clearAll(): Promise<void> {
    this.clearAllCaches();
  }

  static getAllStats() {
    return {
      voice: this.voiceCache.getStats(),
      animation: this.animationCache.getStats(),
      userData: this.userDataCache.getStats(),
    };
  }

  static clearAllCaches(): void {
    this.voiceCache.clear();
    this.animationCache.clear();
    this.userDataCache.clear();
  }

  static destroy(): void {
    this.voiceCache.destroy();
    this.animationCache.destroy();
    this.userDataCache.destroy();
  }
}
