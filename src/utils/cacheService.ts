import AsyncStorage from "@react-native-async-storage/async-storage";
import ENV from "../config/env";

// Default cache expiry time (24 hours in milliseconds)
const DEFAULT_EXPIRY = ENV.CACHE_EXPIRY ? parseInt(ENV.CACHE_EXPIRY) * 1000 : 86400000;

// Cache entry structure
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * A utility service for caching data locally with automatic expiry
 */
export const cacheService = {
  /**
   * Sets data in the cache with automatic expiry
   * 
   * @param key - Unique key to identify the cached data
   * @param data - Data to cache
   * @param expiryMs - Optional custom expiry time in milliseconds
   * @returns Promise that resolves when data is cached
   */
  async set<T>(key: string, data: T, expiryMs?: number): Promise<void> {
    try {
      const cacheEntry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(cacheEntry));
    } catch (error) {
      console.warn(`Failed to cache data for key ${key}:`, error);
      // Continue without caching
    }
  },
  
  /**
   * Gets data from the cache if it exists and hasn't expired
   * 
   * @param key - Key to retrieve cached data
   * @param expiryMs - Optional custom expiry time in milliseconds
   * @returns The cached data or null if not found or expired
   */
  async get<T>(key: string, expiryMs = DEFAULT_EXPIRY): Promise<T | null> {
    try {
      const cachedValue = await AsyncStorage.getItem(key);
      
      if (!cachedValue) {
        return null;
      }
      
      const { data, timestamp }: CacheEntry<T> = JSON.parse(cachedValue);
      
      // Check if the cache has expired
      if (Date.now() - timestamp > expiryMs) {
        // Cache expired, remove it
        await AsyncStorage.removeItem(key);
        return null;
      }
      
      return data;
    } catch (error) {
      console.warn(`Failed to retrieve cached data for key ${key}:`, error);
      return null;
    }
  },
  
  /**
   * Gets data from the cache with automatic update function if not found or expired
   * 
   * @param key - Key to retrieve or update cached data
   * @param updateFn - Function to call if cache is missing or expired
   * @param expiryMs - Optional custom expiry time in milliseconds
   * @returns The cached or freshly fetched data
   */
  async getOrUpdate<T>(
    key: string, 
    updateFn: () => Promise<T>, 
    expiryMs = DEFAULT_EXPIRY
  ): Promise<T> {
    // First try to get from cache
    const cachedData = await this.get<T>(key, expiryMs);
    
    if (cachedData !== null) {
      return cachedData;
    }
    
    // If not in cache or expired, call update function
    try {
      const freshData = await updateFn();
      
      // Cache the fresh data
      await this.set(key, freshData, expiryMs);
      
      return freshData;
    } catch (error) {
      throw error; // Re-throw to let caller handle the error
    }
  },
  
  /**
   * Removes an item from the cache
   * 
   * @param key - Key to remove from cache
   * @returns Promise that resolves when item is removed
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove cached data for key ${key}:`, error);
    }
  },
  
  /**
   * Clears all cached data with a specified prefix
   * 
   * @param prefix - Optional prefix to limit which keys to clear
   * @returns Promise that resolves when cache is cleared
   */
  async clear(prefix?: string): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      
      // If prefix is provided, only clear keys with that prefix
      const keysToRemove = prefix 
        ? keys.filter(key => key.startsWith(prefix))
        : keys;
      
      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
      }
    } catch (error) {
      console.warn("Failed to clear cache:", error);
    }
  },
  
  /**
   * Updates part of a cached object without fetching new data
   * 
   * @param key - Key of the cached object to update
   * @param updateFn - Function that receives the current data and returns updated data
   * @returns Promise that resolves with the updated data or null if not found
   */
  async update<T>(key: string, updateFn: (data: T) => T): Promise<T | null> {
    try {
      const cachedValue = await AsyncStorage.getItem(key);
      
      if (!cachedValue) {
        return null;
      }
      
      const { data, timestamp }: CacheEntry<T> = JSON.parse(cachedValue);
      
      // Apply the update
      const updatedData = updateFn(data);
      
      // Save the updated data with the original timestamp
      const updatedEntry: CacheEntry<T> = {
        data: updatedData,
        timestamp,  // Preserve the original timestamp
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(updatedEntry));
      
      return updatedData;
    } catch (error) {
      console.warn(`Failed to update cached data for key ${key}:`, error);
      return null;
    }
  },
  
  /**
   * Gets the cache metadata (just the timestamp)
   * 
   * @param key - Key to get metadata for
   * @returns The cache timestamp or null if not found
   */
  async getMetadata(key: string): Promise<{ timestamp: number } | null> {
    try {
      const cachedValue = await AsyncStorage.getItem(key);
      
      if (!cachedValue) {
        return null;
      }
      
      const { timestamp } = JSON.parse(cachedValue);
      return { timestamp };
    } catch (error) {
      console.warn(`Failed to get metadata for key ${key}:`, error);
      return null;
    }
  },
};

export default cacheService;