import { authService } from './auth-backend';

const BACKEND_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:10000';

// Generic API client class
export class BackendApiClient {
  private baseUrl: string;
  private origin: string;

  constructor(baseUrl: string = BACKEND_URL) {
    this.baseUrl = baseUrl;
    this.origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  }

  // Get auth headers
  private getAuthHeaders(): Headers {
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
    headers.set('Origin', this.origin);

    // Get session from auth service
    const session = authService.getSession();
    
    if (session?.token) {
      headers.set('Authorization', `Bearer ${session.token}`);
    }

    // Add X-User-Session header if we have user data
    if (session?.user) {
      const { id, _id, ...userData } = session.user;
      headers.set('X-User-Session', JSON.stringify({
        ...userData,
        id: id || _id,
        _id: _id || id,
      }));
    }

    return headers;
  }

  // Build URL
  private buildUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  }

  // Make request
  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    const headers = this.getAuthHeaders();
    
    // Merge custom headers
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        headers.set(key, value);
      });
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      if (response.status === 401) {
        // Token expired, try to refresh using AuthService
        const refreshResult = await authService.refreshToken();
        if (!refreshResult) {
          throw new Error('Failed to refresh token');
        }

        // Retry with new token
        const retryResponse = await fetch(url, {
          ...options,
          headers: this.getAuthHeaders(), // Get fresh headers with new token
          credentials: 'include',
        });

        if (!retryResponse.ok) {
          throw new Error(`API request failed: ${retryResponse.status}`);
        }

        return retryResponse.json();
      }

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Parse response based on content type
  private async parseResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return response.text();
  }

  // GET request
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(this.buildUrl(endpoint));
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return this.request<T>(url.pathname + url.search);
  }

  // POST request
  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH request
  async patch<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Upload file
  async upload<T = any>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const headers = this.getAuthHeaders();
    headers.delete('Content-Type'); // Let browser set correct content type for FormData
    
    try {
      const response = await fetch(this.buildUrl(endpoint), {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `Upload failed: HTTP ${response.status}`);
      }

      return this.parseResponse(response);
    } catch (error) {
      console.error(`File upload failed for ${endpoint}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const backendApi = new BackendApiClient();

// Export the singleton instance
export { backendApi };

// Specific API functions for different modules
export const adminApi = {
  // Applications
  getApplications: (params?: { 
    skip?: number; 
    limit?: number; 
    status?: string;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }) => backendApi.get('/api/admin/applications', params),
  
  getApplication: (id: string) =>
    backendApi.get(`/api/admin/applications/${id}`),
  
  updateApplication: (id: string, data: any) =>
    backendApi.put(`/api/admin/applications/${id}`, data),
  
  deleteApplication: (id: string) =>
    backendApi.delete(`/api/admin/applications/${id}`),

  // Bulk operations
  updateBulkApplicationStatus: (ids: string[], status: string) =>
    backendApi.put('/api/admin/applications/bulk-status', { ids, status }),
    
  deleteBulkApplications: (ids: string[]) =>
    backendApi.delete('/api/admin/applications/bulk', { ids }),

  // Status-specific endpoints
  getShortlisted: (params?: { skip?: number; limit?: number }) =>
    backendApi.get('/api/admin/shortlisted', params),
  
  getTechnicalAssessment: (params?: { skip?: number; limit?: number }) =>
    backendApi.get('/api/admin/technical-assessment', params),
  
  getInterviewing: (params?: { skip?: number; limit?: number }) =>
    backendApi.get('/api/admin/interviewing', params),
  
  getHired: (params?: { skip?: number; limit?: number }) =>
    backendApi.get('/api/admin/hired', params),
  
  getDisqualified: (params?: { skip?: number; limit?: number }) =>
    backendApi.get('/api/admin/disqualified', params),

  // Job Postings
  getJobPostings: (params?: { skip?: number; limit?: number }) =>
    backendApi.get('/api/admin/job-postings', params),
  
  createJobPosting: (data: any) =>
    backendApi.post('/api/admin/job-postings', data),
  
  getJobPosting: (id: string) =>
    backendApi.get(`/api/admin/job-postings/${id}`),
  
  updateJobPosting: (id: string, data: any) =>
    backendApi.put(`/api/admin/job-postings/${id}`, data),
  
  deleteJobPosting: (id: string) =>
    backendApi.delete(`/api/admin/job-postings/${id}`),
  
  toggleJobPostingStatus: (id: string, data: { isActive: boolean }) =>
    backendApi.patch(`/api/admin/job-postings/${id}/toggle-status`, data),

  // Users
  getUsers: (params?: { skip?: number; limit?: number }) =>
    backendApi.get('/api/admin/users', params),
  
  updateUser: (id: string, data: any) =>
    backendApi.put(`/api/admin/users/${id}`, data),
  
  deleteUser: (id: string) =>
    backendApi.delete(`/api/admin/users/${id}`),

  // Blog Posts
  getBlogPosts: (params?: { skip?: number; limit?: number }) =>
    backendApi.get('/api/admin/blog-posts', params),
  
  createBlogPost: (data: any) =>
    backendApi.post('/api/admin/blog-posts', data),
  
  getBlogPost: (id: string) =>
    backendApi.get(`/api/admin/blog-posts/${id}`),
  
  updateBlogPost: (id: string, data: any) =>
    backendApi.put(`/api/admin/blog-posts/${id}`, data),
  
  deleteBlogPost: (id: string) =>
    backendApi.delete(`/api/admin/blog-posts/${id}`),

  // Overview & Analytics
  getOverview: () =>
    backendApi.get('/api/admin/overview'),
  
  getTrends: (days?: number) =>
    backendApi.get('/api/admin/trends', { days }),
  
  getApplicationsByJob: () =>
    backendApi.get('/api/admin/applications-by-job'),

  // Questions
  getQuestions: (jobId?: string) =>
    backendApi.get('/api/admin/questions', jobId ? { job_id: jobId } : undefined),
  
  getQuestion: (id: string) =>
    backendApi.get(`/api/admin/questions/${id}`),
  
  createQuestion: (data: any) =>
    backendApi.post('/api/admin/questions', data),
  
  updateQuestion: (id: string, data: any) =>
    backendApi.put(`/api/admin/questions/${id}`, data),
  
  deleteQuestion: (id: string) =>
    backendApi.delete(`/api/admin/questions/${id}`),
  
  reorderQuestions: (data: { updates: Array<{ id: string; order: number }> }) =>
    backendApi.put('/api/admin/questions/reorder-questions', data),

  // Settings
  getSettings: async () => {
    const response = await backendApi.get('/api/admin/settings');
    return response;
  },
  
  updateSettings: (data: any) =>
    backendApi.put('/api/admin/settings', data),

  // Get notifications
  async getNotifications() {
    const response = await backendApi.request('/api/admin/notifications');
    // The admin API returns {notifications: [...], total: number}
    return response.notifications || [];
  },

  // Mark notification as read
  async markNotificationAsRead(notificationId: string) {
    return backendApi.request(`/api/admin/notifications/${notificationId}/read`, {
      method: 'PUT',
      body: JSON.stringify({}),
    });
  },

  // Delete notification
  async deleteNotification(notificationId: string) {
    return backendApi.request(`/api/admin/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  },

  // Mark all notifications as read
  async markAllNotificationsAsRead() {
    return backendApi.request('/api/admin/notifications/mark-all-read', {
      method: 'PUT',
    });
  }
};

export const userApi = {
  // Applications
  submitApplication: (data: any) =>
    backendApi.post('/api/applications', data),
  
  getMyApplications: (params?: { skip?: number; limit?: number; status?: string }) =>
    backendApi.get('/api/applications', params),
  
  getApplication: (id: string) =>
    backendApi.get(`/api/applications/${id}`),

  getApplicationStats: () =>
    backendApi.get('/api/users/application-stats'),

  getLatestApplication: () =>
    backendApi.get('/api/users/latest-application'),

  // Profile
  async getProfile() {
    return backendApi.get('/api/users/profile');
  },
  
  async updateProfile(data: any) {
    return backendApi.put('/api/users/profile', data);
  },
  
  // Settings
  async getSettings() {
    return backendApi.get('/api/users/settings');
  },
  
  async updateSettings(data: any) {
    return backendApi.put('/api/users/settings', data);
  },
  
  // Password
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    backendApi.post('/api/users/change-password', data),

  // Email verification
  async resendVerification() {
    const profile = await this.getProfile();
    return backendApi.post('/api/users/resend-verification', profile.email);
  },

  // Avatar Upload
  uploadAvatar: (file: File) =>
    backendApi.upload('/api/upload/avatar', file),

  // Jobs
  async getJobs({ skip = 0, limit = 10 } = {}) {
    return backendApi.get('/api/jobs', { skip, limit });
  },
  
  async hasApplied(jobId: string) {
    try {
      const response = await backendApi.get(`/api/applications/check/${jobId}`);
      return response.hasApplied;
    } catch (error) {
      console.error('Error checking application status:', error);
      return false;
    }
  },

  getJob: (id: string) =>
    backendApi.get(`/api/jobs/${id}`),

  getHiringProgress: () =>
    backendApi.get('/api/users/hiring-progress'),

  // User Notifications
  async getUserNotifications(params?: { skip?: number; limit?: number }) {
    return backendApi.get('/api/user-notifications/', params);
  },

  async markUserNotificationAsRead(notificationId: string) {
    return backendApi.patch(`/api/user-notifications/${notificationId}`, {
      isRead: true
    });
  },

  async deleteUserNotification(notificationId: string) {
    return backendApi.delete(`/api/user-notifications/${notificationId}`);
  },

  async createUserNotification(notification: {
    title: string;
    message: string;
    type?: string;
    priority?: string;
    link?: string;
  }) {
    return backendApi.post('/api/user-notifications/', notification);
  },

  async seedUserNotifications() {
    return backendApi.post('/api/user-notifications/seed');
  }
};

// Public API (no auth required)
export const publicApi = {
  // Health check
  healthCheck: () =>
    fetch(`${BACKEND_URL}/health`).then(r => r.json()),
  
  // Blog posts
  getBlogPosts: (params?: { skip?: number; limit?: number }) =>
    fetch(`${BACKEND_URL}/api/blog-posts?${new URLSearchParams(params as any)}`).then(r => r.json()),
  
  getBlogPost: (slug: string) =>
    fetch(`${BACKEND_URL}/api/blog-posts/${slug}`).then(r => r.json()),

  // Contact
  submitContact: (data: any) =>
    fetch(`${BACKEND_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),
};

export default backendApi;