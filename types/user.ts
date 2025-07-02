export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role: string;
  avatar?: string | null;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  profileImage?: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  experience?: any[];
  education?: any[];
  socialLinks?: Record<string, string>;
  settings?: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    theme: 'light' | 'dark' | 'system';
  };
} 