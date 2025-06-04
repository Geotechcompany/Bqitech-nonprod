export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  active: boolean;
  avatarUrl?: string;
  createdAt?: string;
} 