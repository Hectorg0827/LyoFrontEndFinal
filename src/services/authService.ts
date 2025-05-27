import { AppError, ErrorType } from "../utils/AppError";
import { LoginCredentials, RegistrationData, AuthResponse } from "./api";
import apiService from "./apiService";
import { useAppStore } from "../store/appStore";

export const authService = {
  /**
   * Log in a user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Call the API service to log in
      const response = await apiService.login(credentials);
      
      // Store the token for future requests
      apiService.setToken(response.token);
      
      // Return the response
      return response;
    } catch (error: any) {
      throw new AppError(ErrorType.Auth, "Login failed", error);
    }
  },

  /**
   * Register a new user
   */
  async register(data: RegistrationData): Promise<AuthResponse> {
    try {
      // Call the API service to register
      const response = await apiService.register(data);
      
      // Store the token for future requests
      apiService.setToken(response.token);
      
      // Return the response
      return response;
    } catch (error: any) {
      throw new AppError(ErrorType.Auth, "Registration failed", error);
    }
  },

  /**
   * Log out the current user
   */
  async logout(): Promise<void> {
    try {
      // Call the API service to log out
      await apiService.logout();
    } catch (error: any) {
      console.warn("Error during logout:", error);
    } finally {
      // Clear the token regardless of API call success
      apiService.clearToken();
      
      // Reset app state
      const { setAuthenticated, setUser } = useAppStore.getState();
      setAuthenticated(false);
      setUser(null);
    }
  },

  /**
   * Check if user is logged in (has valid token)
   */
  isLoggedIn(): boolean {
    return apiService.getToken() !== null;
  },
};