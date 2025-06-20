import { authService } from './auth-backend';

const BACKEND_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000';

// Generic API client class
export class BackendApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = BACKEND_URL) {
    this.baseUrl = baseUrl;
  }

  // Build full URL
  private buildUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  }

  // Make authenticated request
  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    
    try {
      const response = await authService.authenticatedFetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return response.text() as any;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
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
  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
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

    const headers = authService.getAuthHeader();
    
    try {
      const response = await fetch(this.buildUrl(endpoint), {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `Upload failed: HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`File upload failed for ${endpoint}:`, error);
      throw error;
    }
  }
}

// Create singleton instance
export const backendApi = new BackendApiClient();

// Specific API functions for different modules
export const adminApi = {
  // Applications
  getApplications: (params?: { skip?: number; limit?: number; search?: string; status?: string }) =>
    backendApi.get('/api/admin/applications', params),
  
  getApplication: (id: string) =>
    backendApi.get(`/api/admin/applications/${id}`),
  
  updateApplication: (id: string, data: any) =>
    backendApi.put(`/api/admin/applications/${id}`, data),
  
  deleteApplication: (id: string) =>
    backendApi.delete(`/api/admin/applications/${id}`),

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

  // Questions
  getQuestions: (jobId?: string) =>
    backendApi.get('/api/admin/questions', jobId ? { job_id: jobId } : undefined),
  
  createQuestion: (data: any) =>
    backendApi.post('/api/admin/questions', data),
  
  updateQuestion: (id: string, data: any) =>
    backendApi.put(`/api/admin/questions/${id}`, data),
  
  deleteQuestion: (id: string) =>
    backendApi.delete(`/api/admin/questions/${id}`),
  
  reorderQuestions: (data: { updates: Array<{ id: string; order: number }> }) =>
    backendApi.put('/api/admin/questions/reorder', data),

  // Settings
  getSettings: () =>
    backendApi.get('/api/admin/settings'),
  
  updateSettings: (data: any) =>
    backendApi.put('/api/admin/settings', data),
};

export const userApi = {
  // Applications
  submitApplication: (data: any) =>
    backendApi.post('/api/applications', data),
  
  getMyApplications: (params?: { skip?: number; limit?: number; status?: string }) =>
    backendApi.get('/api/applications', params),
  
  getApplication: (id: string) =>
    backendApi.get(`/api/applications/${id}`),

  // Jobs
  getJobs: (params?: { skip?: number; limit?: number }) =>
    backendApi.get('/api/jobs', params),
  
  getJob: (id: string) =>
    backendApi.get(`/api/jobs/${id}`),
};

// Public API (no auth required)
export const publicApi = {
  // Health check
  healthCheck: () =>
    fetch(`${BACKEND_URL}/api/health`).then(r => r.json()),
  
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