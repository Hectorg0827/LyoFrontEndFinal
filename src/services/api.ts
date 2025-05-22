import { ENV } from "../config/env";
import { useAppStore } from "../store/appStore";

import { ErrorHandler, ErrorType } from "./errorHandler";

// API client configuration
const API_URL = ENV.API_URL;
const API_TIMEOUT = ENV.API_TIMEOUT;

/**
 * API client for making requests to the Lyo backend
 */
class ApiClient {
  private token: string | null = null;
  private controller: AbortController | null = null;

  /**
   * Set the authentication token for subsequent requests
   */
  setToken(token: string) {
    this.token = token;
  }

  /**
   * Clear the authentication token (for logout)
   */
  clearToken() {
    this.token = null;
  }

  /**
   * Get the currently stored auth token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Build headers for API requests
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Handle API request errors
   */
  private async handleResponse(response: Response) {
    if (response.ok) {
      return await response.json();
    }

    // Handle 401 Unauthorized errors (expired or invalid token)
    if (response.status === 401) {
      // Reset auth state in the app
      const { setAuthenticated, setUser } = useAppStore.getState();
      setAuthenticated(false);
      setUser(null);
      this.clearToken();
    }

    // Parse error response
    const errorData = await response.json().catch(() => ({}));

    throw ErrorHandler.createError(
      response.status === 401
        ? ErrorType.AUTHENTICATION
        : response.status === 403
          ? ErrorType.AUTHORIZATION
          : response.status === 404
            ? ErrorType.NOT_FOUND
            : response.status === 429
              ? ErrorType.RATE_LIMIT
              : response.status >= 500
                ? ErrorType.SERVER
                : ErrorType.NETWORK,
      errorData.message ||
        `API Error: ${response.status} ${response.statusText}`,
      { statusCode: response.status, data: errorData },
    );
  }

  /**
   * Create a timeout promise for fetch
   */
  private createTimeoutPromise(): {
    timeoutId: number;
    promise: Promise<never>;
  } {
    let timeoutId: number;
    const promise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        this.controller?.abort();
        reject(
          ErrorHandler.createError(
            ErrorType.TIMEOUT,
            `Request timed out after ${API_TIMEOUT}ms`,
          ),
        );
      }, API_TIMEOUT) as unknown as number;
    });

    return { timeoutId, promise };
  }

  /**
   * Make a GET request to the API
   */
  async get<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    // Create abort controller for timeout
    this.controller = new AbortController();
    const { timeoutId, promise: timeoutPromise } = this.createTimeoutPromise();

    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          queryParams.append(key, params[key].toString());
        }
      });

      const queryString = queryParams.toString();
      const url = `${API_URL}${endpoint}${queryString ? "?" + queryString : ""}`;

      const fetchPromise = fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
        signal: this.controller.signal,
      }).then((response) => this.handleResponse(response));

      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      clearTimeout(timeoutId);
      return response as T;
    } catch (error) {
      if (error && typeof error === "object" && "type" in error) {
        throw error; // Already handled by ErrorHandler
      }

      throw ErrorHandler.createError(
        ErrorType.NETWORK,
        "Network request failed",
        error,
      );
    } finally {
      this.controller = null;
    }
  }

  /**
   * Make a POST request to the API
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    // Create abort controller for timeout
    this.controller = new AbortController();
    const { timeoutId, promise: timeoutPromise } = this.createTimeoutPromise();

    try {
      const fetchPromise = fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        signal: this.controller.signal,
      }).then((response) => this.handleResponse(response));

      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      clearTimeout(timeoutId);
      return response as T;
    } catch (error) {
      if (error && typeof error === "object" && "type" in error) {
        throw error; // Already handled by ErrorHandler
      }

      throw ErrorHandler.createError(
        ErrorType.NETWORK,
        "Network request failed",
        error,
      );
    } finally {
      this.controller = null;
    }
  }

  /**
   * Make a PUT request to the API
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    // Create abort controller for timeout
    this.controller = new AbortController();
    const { timeoutId, promise: timeoutPromise } = this.createTimeoutPromise();

    try {
      const fetchPromise = fetch(`${API_URL}${endpoint}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        signal: this.controller.signal,
      }).then((response) => this.handleResponse(response));

      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      clearTimeout(timeoutId);
      return response as T;
    } catch (error) {
      if (error && typeof error === "object" && "type" in error) {
        throw error; // Already handled by ErrorHandler
      }

      throw ErrorHandler.createError(
        ErrorType.NETWORK,
        "Network request failed",
        error,
      );
    } finally {
      this.controller = null;
    }
  }

  /**
   * Make a DELETE request to the API
   */
  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    return this.handleResponse(response) as Promise<T>;
  }
}

// Create and export a singleton instance
export const api = new ApiClient();

// Types for authentication
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegistrationData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

// Authentication service
export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    api.setToken(response.token);
    return response;
  },

  async register(data: RegistrationData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/register", data);
    api.setToken(response.token);
    return response;
  },

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } finally {
      api.clearToken();
      const { setAuthenticated, setUser } = useAppStore.getState();
      setAuthenticated(false);
      setUser(null);
    }
  },
};
