interface User {
  id: string;
  _id?: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
  refresh_token: string;
}

interface SessionData {
  user: User;
  token: string;
  refreshToken: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:10000';

// Token storage utilities
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

class AuthService {
  private SESSION_KEY = 'auth_session';

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

  // Set session data
  setSession(session: SessionData): void {
    if (typeof window !== 'undefined') {
      console.log('Setting session:', session);
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    }
  }

  // Get current session
  getSession(): SessionData | null {
    if (typeof window === 'undefined') return null;
    
    const session = localStorage.getItem(this.SESSION_KEY);
    console.log('Raw session from storage:', session);
    
    if (!session) {
      console.log('No session found in storage');
      return null;
    }
    
    try {
      const parsedSession = JSON.parse(session);
      console.log('Parsed session:', parsedSession);
      return parsedSession;
    } catch (error) {
      console.error('Error parsing session:', error);
      this.clearSession();
      return null;
    }
  }

  // Clear session data
  clearSession(): void {
    if (typeof window !== 'undefined') {
      console.log('Clearing session');
      localStorage.removeItem(this.SESSION_KEY);
    }
  }

  // Login with email and password
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('Attempting login for:', email);
      
      // Use URLSearchParams for form data as required by FastAPI
      const formData = new URLSearchParams();
      formData.append('username', email.toLowerCase());
      formData.append('password', password);

      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Login error response:', error);
        throw new Error(error.detail || 'Login failed');
      }

      const data: AuthResponse = await response.json();
      console.log('Login response:', data);
      
      if (!data.access_token || !data.refresh_token || !data.user) {
        console.error('Invalid login response:', data);
        throw new Error('Invalid login response');
      }

      // Normalize user ID
      const user = {
        ...data.user,
        id: data.user.id || data.user._id
      };
      
      // Store session data
      const sessionData: SessionData = {
        user,
        token: data.access_token,
        refreshToken: data.refresh_token
      };
      
      console.log('Setting session after login:', sessionData);
      this.setSession(sessionData);
      
      return {
        ...data,
        user
      };
    } catch (error) {
      console.error('Login error:', error);
      this.clearSession();
      throw error;
    }
  }

  // Register new user
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    try {
      // Use FormData as required by the backend
      const formData = new FormData();
      formData.append('email', email.toLowerCase());
      formData.append('password', password);
      formData.append('name', name);

      const response = await fetch(`${BACKEND_URL}/api/auth/signup`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Registration error response:', error);
        throw new Error(error.detail || 'Registration failed');
      }

      // After successful registration, login the user
      return await this.login(email, password);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      // Clear session data
      this.clearSession();
      this.clearAuthData();

      // Redirect to login page with success message
      if (typeof window !== 'undefined') {
        window.location.href = '/login?message=Successfully logged out';
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Refresh token
  async refreshToken(): Promise<AuthResponse | null> {
    try {
      const session = this.getSession();
      
      if (!session?.refreshToken) {
        console.log('No refresh token available');
        this.clearSession();
        return null;
      }

      console.log('Attempting to refresh token');
      const response = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: session.refreshToken
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Token refresh failed:', response.status);
        this.clearSession();
        return null;
      }

      const data = await response.json();
      console.log('Token refresh successful:', data);
      
      if (!data.access_token || !data.refresh_token) {
        console.error('Invalid refresh response:', data);
        this.clearSession();
        return null;
      }

      // Update session with new tokens while preserving user data
      const newSession: SessionData = {
        user: session.user,
        token: data.access_token,
        refreshToken: data.refresh_token
      };
      
      console.log('Setting new session after refresh:', newSession);
      this.setSession(newSession);
      
      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        token_type: 'bearer',
        user: session.user
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearSession();
      return null;
    }
  }

  // Helper methods
  getCurrentUser(): User | null {
    const session = this.getSession();
    return session?.user || null;
  }

  isAuthenticated(): boolean {
    const session = this.getSession();
    return !!(session?.token && session?.user);
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'SUPER_ADMIN';
  }

  getAuthHeader(): { Authorization: string } | {} {
    const session = this.getSession();
    return session?.token ? { Authorization: `Bearer ${session.token}` } : {};
  }

  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    console.log('Making authenticated request to:', url);
    const session = this.getSession();
    
    if (!session?.token) {
      console.error('No authentication token available');
      throw new Error('No authentication token');
    }

    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${session.token}`,
    };

    console.log('Request headers:', headers);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      console.log('Response status:', response.status);

      if (response.status === 401) {
        console.log('Token expired, attempting refresh');
        // Token expired, try to refresh
        const refreshResult = await this.refreshToken();
        if (!refreshResult) {
          console.error('Token refresh failed');
          throw new Error('Token refresh failed');
        }

        // Retry with new token
        const newSession = this.getSession();
        console.log('Retrying request with new token');
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${newSession!.token}`,
          },
          credentials: 'include',
        });
      }

      return response;
    } catch (error) {
      console.error('Authenticated fetch error:', error);
      throw error;
    }
  }

  // Check if user's email is verified
  isEmailVerified(): boolean {
    const session = this.getSession();
    return session?.user?.isEmailVerified || false;
  }

  // Refresh user profile data
  async refreshUserProfile(): Promise<SessionData | null> {
    try {
      const response = await this.authenticatedFetch(`${BACKEND_URL}/api/users/profile`);
      
      if (response.ok) {
        const profileData = await response.json();
        
        // Update session with new profile data
        const currentSession = this.getSession();
        if (currentSession) {
          const updatedSession = {
            ...currentSession,
            user: {
              ...currentSession.user,
              ...profileData,
              isEmailVerified: profileData.isEmailVerified || false
            }
          };
          this.setSession(updatedSession);
          return updatedSession;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      return null;
    }
  }
}

// Create singleton instance
const authService = AuthService.getInstance();

export { authService };
export type { User, AuthResponse, SessionData };

// Export convenience methods
export const login = (email: string, password: string) => authService.login(email, password);
export const register = (email: string, password: string, name: string) => authService.register(email, password, name);
export const logout = () => authService.logout();
export const getSession = () => authService.getSession();
export const getCurrentUser = () => authService.getCurrentUser();
export const isAuthenticated = () => authService.isAuthenticated();
export const isAdmin = () => authService.isAdmin();
export const getAuthHeader = () => authService.getAuthHeader();
export const authenticatedFetch = (url: string, options?: RequestInit) => authService.authenticatedFetch(url, options);