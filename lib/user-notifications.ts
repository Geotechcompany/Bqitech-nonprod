import { api } from './api';
import { authService } from './auth-backend';

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  date: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

class UserNotificationService {
  // Get current user info for filtering
  private getCurrentUserInfo() {
    const session = authService.getSession();
    console.log('UserNotificationService - Current session:', session);
    
    if (!session) {
      console.warn('UserNotificationService - No session found');
      return null;
    }
    
    return {
      id: session?.user?.id || session?.user?._id,
      email: session?.user?.email,
      name: session?.user?.name || session?.user?.email,
      token: session?.token
    };
  }

  // Check if user is authenticated
  private isAuthenticated(): boolean {
    const session = authService.getSession();
    const hasToken = !!session?.token;
    const hasUser = !!session?.user;
    
    console.log('UserNotificationService - Auth check:', {
      hasSession: !!session,
      hasToken,
      hasUser,
      isAuthenticated: hasToken && hasUser
    });
    
    return hasToken && hasUser;
  }

  async getNotifications(limit: number = 10, skip: number = 0): Promise<UserNotification[]> {
    try {
      // Check authentication first
      if (!this.isAuthenticated()) {
        console.warn('UserNotificationService - User not authenticated, returning empty array');
        return [];
      }

      const currentUser = this.getCurrentUserInfo();
      console.log('UserNotificationService - Fetching notifications for user:', currentUser?.id);
      
      // Use the user-specific notifications endpoint
      const response = await api.get(`/api/user-notifications/?limit=${limit}&skip=${skip}`);
      
      // Debug logging
      console.log('=== USER NOTIFICATIONS DEBUG ===');
      console.log('Current user info:', currentUser);
      console.log('API response:', response.data);
      console.log('Response type:', typeof response.data);
      console.log('Is array:', Array.isArray(response.data));
      
      // The backend now properly filters notifications, so we can use them directly
      const notifications = Array.isArray(response.data) ? response.data : [];
      
      console.log(`Received ${notifications.length} user-specific notifications from backend`);
      
      // Minimal validation - the backend should now only return user-specific notifications
      const validNotifications = notifications.filter((notification: any) => {
        const hasValidId = notification.id || notification._id;
        const hasTitle = notification.title;
        const hasMessage = notification.message;
        
        const isValid = hasValidId && hasTitle && hasMessage;
        
        if (!isValid) {
          console.warn('Invalid notification found:', notification);
        }
        
        return isValid;
      });
      
      console.log(`Final valid notifications: ${validNotifications.length}`);
      console.log('Final notifications:', validNotifications);
      console.log('=== END DEBUG ===');
      
      return validNotifications;
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // If it's a 401, the user is not authenticated
      if (error.response?.status === 401) {
        console.warn('UserNotificationService - Authentication failed, clearing session');
        authService.clearSession();
        return [];
      }
      
      // If it's a 404 or similar, return empty array instead of error
      if (error.response?.status === 404 || error.response?.status === 403) {
        console.log('No notifications found or access denied - returning empty array');
        return [];
      }
      
      return [];
    }
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      if (!this.isAuthenticated()) {
        console.warn('UserNotificationService - User not authenticated for mark as read');
        return false;
      }

      console.log('UserNotificationService - Marking notification as read:', notificationId);
      await api.patch(`/api/user-notifications/${notificationId}`, { isRead: true });
      console.log('UserNotificationService - Successfully marked notification as read');
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        console.warn('UserNotificationService - Authentication failed during mark as read');
        authService.clearSession();
      }
      
      return false;
    }
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      if (!this.isAuthenticated()) {
        console.warn('UserNotificationService - User not authenticated for delete');
        return false;
      }

      console.log('Attempting to delete notification:', notificationId);
      const response = await api.delete(`/api/user-notifications/${notificationId}`);
      console.log('Delete response:', response.data);
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      
      if (error.response?.status === 401) {
        console.warn('UserNotificationService - Authentication failed during delete');
        authService.clearSession();
      }
      
      // Provide specific error feedback
      if (error.response?.status === 404) {
        console.error('Notification not found or does not belong to user');
      } else if (error.response?.status === 400) {
        console.error('Invalid notification ID format');
      } else if (error.response?.status === 500) {
        console.error('Server error occurred while deleting notification');
      }
      
      return false;
    }
  }

  async markAllAsRead(): Promise<boolean> {
    try {
      if (!this.isAuthenticated()) {
        console.warn('UserNotificationService - User not authenticated for mark all as read');
        return false;
      }

      const notifications = await this.getNotifications(50); // Get more notifications for bulk operation
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      console.log(`UserNotificationService - Marking ${unreadNotifications.length} notifications as read`);
      
      // Mark all unread notifications as read
      const promises = unreadNotifications.map(n => this.markAsRead(n.id));
      await Promise.all(promises);
      
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  // Create a test notification for current user (for testing purposes)
  async createTestNotification(): Promise<boolean> {
    try {
      if (!this.isAuthenticated()) {
        console.warn('UserNotificationService - User not authenticated for test notification');
        return false;
      }

      const currentUser = this.getCurrentUserInfo();
      
      const testNotification = {
        title: "Welcome to BQI Tech Dashboard",
        message: `Hello ${currentUser?.name}! You have successfully logged into your dashboard. You'll receive notifications here about your job applications and important updates.`,
        type: "info",
        date: new Date().toISOString(),
        isRead: false
        // Don't include userId here - let the backend set it
      };
      
      console.log('Creating test notification for user:', currentUser?.id);
      console.log('Notification payload:', testNotification);
      
      const response = await api.post('/api/user-notifications/', testNotification);
      console.log('Create notification response:', response.data);
      return true;
    } catch (error) {
      console.error('Error creating test notification:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        console.warn('UserNotificationService - Authentication failed during test notification creation');
        authService.clearSession();
      }
      
      return false;
    }
  }

  // Create user-specific notification about application status
  async createApplicationNotification(applicationId: string, status: string): Promise<boolean> {
    try {
      if (!this.isAuthenticated()) {
        console.warn('UserNotificationService - User not authenticated for application notification');
        return false;
      }

      const currentUser = this.getCurrentUserInfo();
      
      const statusMessages = {
        'shortlisted': 'Your application has been shortlisted! You will be contacted soon for the next steps.',
        'interviewing': 'You have been scheduled for an interview. Please check your email for details.',
        'hired': 'Congratulations! You have been selected for the position.',
        'rejected': 'Thank you for your application. Unfortunately, we have decided to move forward with other candidates.'
      };

      const testNotification = {
        title: "Your Application Status Update",
        message: statusMessages[status.toLowerCase()] || `Your application status has been updated to: ${status}`,
        type: status.toLowerCase() === 'hired' ? 'success' : 
              status.toLowerCase() === 'rejected' ? 'error' : 
              status.toLowerCase() === 'shortlisted' ? 'success' : 'info',
        date: new Date().toISOString(),
        isRead: false
        // Don't include userId here - let the backend set it
      };
      
      console.log('Creating application notification:', testNotification);
      const response = await api.post('/api/user-notifications/', testNotification);
      console.log('Create application notification response:', response.data);
      return true;
    } catch (error) {
      console.error('Error creating application notification:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        console.warn('UserNotificationService - Authentication failed during application notification creation');
        authService.clearSession();
      }
      
      return false;
    }
  }
}

export const userNotificationService = new UserNotificationService(); 