// Using expo's Network utility instead of react-native-community/netinfo
import * as Network from "expo-network";

import { ErrorHandler, ErrorType } from "./errorHandler";

class NetworkService {
  /**
   * Check if the device is currently connected to the internet
   * @returns Promise<boolean> - True if connected, false if not
   */
  async isConnected(): Promise<boolean> {
    const state = await Network.getNetworkStateAsync();
    return state.isConnected;
  }

  /**
   * Perform a network operation with connectivity checks
   * @param operation - The async operation to perform
   * @param errorMessage - The error message to display if offline
   * @returns Promise<T> - The result of the operation
   */
  async withConnectivityCheck<T>(
    operation: () => Promise<T>,
    errorMessage = "Network connection unavailable",
  ): Promise<T> {
    const isConnected = await this.isConnected();

    if (!isConnected) {
      const error = new Error(errorMessage);
      ErrorHandler.handleError({
        type: ErrorType.NETWORK,
        message: errorMessage,
        error,
      });
      throw error;
    }

    try {
      return await operation();
    } catch (error) {
      // Rethrow the error to be handled by the caller
      throw error;
    }
  }

  /**
   * Listener for network state changes
   * @param callback - Function to call when network state changes
   * @returns Function to unsubscribe the listener
   */
  addNetworkListener(callback: (isConnected: boolean) => void): () => void {
    const unsubscribe = NetInfo.addEventListener((state) => {
      callback(!!state.isConnected);
    });

    return unsubscribe;
  }
}

export const networkService = new NetworkService();
