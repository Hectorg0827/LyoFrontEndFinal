import { useAppStore } from '../store/appStore';

// Configure your backend URL here
const API_URL = 'https://lyobackendnew.com/api'; // Replace with your actual backend URL

/**
 * API client for making requests to the Lyo backend
 */
class ApiClient {
  private token: string | null = null;

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
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
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
    throw new Error(errorData.message || 'Something went wrong');
  }

  /**
   * Make a GET request to the API
   */
  async get<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    // Build query string from params
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key].toString());
      }
    });
    
    const queryString = queryParams.toString();
    const url = `${API_URL}${endpoint}${queryString ? '?' + queryString : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse(response) as Promise<T>;
  }

  /**
   * Make a POST request to the API
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    
    return this.handleResponse(response) as Promise<T>;
  }

  /**
   * Make a PUT request to the API
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    
    return this.handleResponse(response) as Promise<T>;
  }

  /**
   * Make a DELETE request to the API
   */
  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
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
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    api.setToken(response.token);
    return response;
  },

  async register(data: RegistrationData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    api.setToken(response.token);
    return response;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      api.clearToken();
      const { setAuthenticated, setUser } = useAppStore.getState();
      setAuthenticated(false);
      setUser(null);
    }
  }
};
