import { adminApi } from './api-backend';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  date?: string;
  userId?: string;
  createdAt: string;
  updatedAt?: string;
  __v?: number;
  priority?: string;
}

class NotificationService {
  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await adminApi.getNotifications();
      return response || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      await adminApi.markNotificationAsRead(notificationId);
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      await adminApi.deleteNotification(notificationId);
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();