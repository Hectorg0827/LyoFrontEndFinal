import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import ENV from '../config/env';

// Network state listener for tracking connectivity
let isNetworkConnected = true;

// Setup global network monitoring
NetInfo.addEventListener((state) => {
  isNetworkConnected = state.isConnected === true;
});

/**
 * Utilities for network connectivity detection and offline behavior
 */
export const NetworkUtils = {
  /**
   * Check if the device is currently connected to the internet
   * 
   * @returns Promise that resolves to a boolean indicating connectivity
   */
  isConnected: async (): Promise<boolean> => {
    // If offline mode is forced through environment, always return false
    if (ENV.isFeatureEnabled('ENABLE_OFFLINE_MODE') && ENV.ENV === 'development') {
      return false;
    }
    
    try {
      const state = await NetInfo.fetch();
      return state.isConnected === true && state.isInternetReachable !== false;
    } catch (error) {
      console.warn('Error checking network status:', error);
      return false;
    }
  },
  
  /**
   * Get current connection status without async
   * 
   * @returns Boolean indicating if network is connected based on last known state
   */
  getConnectionStatus: (): boolean => {
    // If offline mode is forced through environment, always return false
    if (ENV.isFeatureEnabled('ENABLE_OFFLINE_MODE') && ENV.ENV === 'development') {
      return false;
    }
    
    return isNetworkConnected;
  },
  
  /**
   * Check if the app should use mock data based on connectivity and environment
   * 
   * @returns Boolean indicating if mock data should be used
   */
  shouldUseMockData: async (): Promise<boolean> => {
    // Always use mock data in development if USE_BACKEND_API is false
    if (!ENV.USE_BACKEND_API) {
      return true;
    }
    
    // Use mock data if offline
    const isConnected = await NetworkUtils.isConnected();
    return !isConnected;
  },
  
  /**
   * React hook for network connectivity status
   * 
   * @returns Object with isConnected status and refresh function
   */
  useNetworkStatus: () => {
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    
    // Check connection on mount
    useEffect(() => {
      let unsubscribe: NetInfoSubscription | null = null;
      
      const checkConnection = async () => {
        try {
          const state = await NetInfo.fetch();
          setIsConnected(state.isConnected === true && state.isInternetReachable !== false);
        } catch (error) {
          console.warn('Error checking network status:', error);
          setIsConnected(false);
        }
      };
      
      // Initial check
      checkConnection();
      
      // Subscribe to network changes
      unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
        setIsConnected(state.isConnected === true && state.isInternetReachable !== false);
      });
      
      // Cleanup on unmount
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }, []);
    
    // Function to manually refresh connection status
    const refreshConnectionStatus = async () => {
      try {
        const state = await NetInfo.fetch();
        setIsConnected(state.isConnected === true && state.isInternetReachable !== false);
        return state.isConnected === true;
      } catch (error) {
        console.warn('Error refreshing network status:', error);
        setIsConnected(false);
        return false;
      }
    };
    
    return { isConnected, refreshConnectionStatus };
  },
};

export default NetworkUtils;