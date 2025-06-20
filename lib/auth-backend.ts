interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

interface SessionData {
  user: User;
  token: string;
  expires: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000';

// Token storage utilities
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export class AuthService {
  private static instance: AuthService;
  
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Store auth data in localStorage
  private setAuthData(token: string, user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }

  // Get stored auth data
  private getAuthData(): { token: string | null; user: User | null } {
    if (typeof window === 'undefined') {
      return { token: null, user: null };
    }

    const token = localStorage.getItem(TOKEN_KEY);
    const userData = localStorage.getItem(USER_KEY);
    
    return {
      token,
      user: userData ? JSON.parse(userData) : null
    };
  }

  // Clear auth data
  private clearAuthData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }

  // Login with email and password
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }

      const data: AuthResponse = await response.json();
      
      // Store auth data
      this.setAuthData(data.access_token, data.user);
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Register new user
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed');
      }

      const data: AuthResponse = await response.json();
      
      // Store auth data
      this.setAuthData(data.access_token, data.user);
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      const { token } = this.getAuthData();
      
      if (token) {
        // Optional: Call backend logout endpoint
        await fetch(`${BACKEND_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local data
      this.clearAuthData();
    }
  }

  // Get current session
  getSession(): SessionData | null {
    const { token, user } = this.getAuthData();
    
    if (!token || !user) {
      return null;
    }

    // Check if token is expired (basic check)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      
      if (payload.exp < now) {
        this.clearAuthData();
        return null;
      }

      return {
        user,
        token,
        expires: new Date(payload.exp * 1000).toISOString(),
      };
    } catch (error) {
      console.error('Session error:', error);
      this.clearAuthData();
      return null;
    }
  }

  // Refresh token
  async refreshToken(): Promise<AuthResponse | null> {
    try {
      const { token } = this.getAuthData();
      
      if (!token) {
        return null;
      }

      const response = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.clearAuthData();
        return null;
      }

      const data: AuthResponse = await response.json();
      this.setAuthData(data.access_token, data.user);
      
      return data;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearAuthData();
      return null;
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    const session = this.getSession();
    return session?.user || null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  // Check if user is admin
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'super_admin';
  }

  // Get authorization header for API calls
  getAuthHeader(): { Authorization: string } | {} {
    const { token } = this.getAuthData();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Make authenticated API call
  async authenticatedFetch(
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> {
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...options.headers,
    };

    let response = await fetch(url, {
      ...options,
      headers,
    });

    // If unauthorized, try to refresh token
    if (response.status === 401) {
      const refreshed = await this.refreshToken();
      
      if (refreshed) {
        // Retry with new token
        const newHeaders = {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
          ...options.headers,
        };

        response = await fetch(url, {
          ...options,
          headers: newHeaders,
        });
      } else {
        // Refresh failed, redirect to login
        this.clearAuthData();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    return response;
  }
}

// Singleton instance
export const authService = AuthService.getInstance();

// Helper functions for easier use
export const login = (email: string, password: string) => authService.login(email, password);
export const register = (email: string, password: string, name: string) => authService.register(email, password, name);
export const logout = () => authService.logout();
export const getSession = () => authService.getSession();
export const getCurrentUser = () => authService.getCurrentUser();
export const isAuthenticated = () => authService.isAuthenticated();
export const isAdmin = () => authService.isAdmin();
export const getAuthHeader = () => authService.getAuthHeader();
export const authenticatedFetch = (url: string, options?: RequestInit) => authService.authenticatedFetch(url, options);

// React hook for auth state (to be used with context)
export type { User, AuthResponse, SessionData };