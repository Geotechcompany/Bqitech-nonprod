"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "react-hot-toast";
import { useAuth } from './AuthContext';
import { adminApi, userApi } from '@/lib/api-backend';

interface SettingsContextType {
  emailNotifications: boolean;
  pushNotifications: boolean;
  jobAlerts: boolean;
  applicationUpdates: boolean;
  autoLogout: number;
  tableRowsPerPage: number;
  sidebarCollapsed: boolean;
  profile: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  theme: 'light' | 'dark';
  updateSettings: (settings: Partial<SettingsContextType>) => Promise<void>;
  updateTheme: (theme: 'light' | 'dark') => void;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  const [settings, setSettings] = useState<Omit<SettingsContextType, 'updateSettings' | 'updateTheme' | 'isLoading'>>({
    // Initialize with default values
    emailNotifications: true,
    pushNotifications: true,
    jobAlerts: true,
    applicationUpdates: true,
    autoLogout: 30,
    tableRowsPerPage: 25,
    sidebarCollapsed: false,
    profile: {
      name: '',
      email: '',
      avatarUrl: ''
    },
    theme: 'light'
  });

  // Load settings when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadSettings();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Update profile when user data changes
  useEffect(() => {
    if (user) {
      setSettings(prev => ({
        ...prev,
        profile: {
          name: user.name || '',
          email: user.email || '',
          avatarUrl: prev.profile.avatarUrl
        }
      }));
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const api = isAdmin ? adminApi : userApi;
      const response = await api.getSettings();
      
      if (response) {
        setSettings(prev => ({
          ...prev,
          ...(isAdmin ? response : response.settings),
          profile: {
            name: user?.name || '',
            email: user?.email || '',
            avatarUrl: response.profile?.avatarUrl || prev.profile.avatarUrl
          }
        }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Don't show error toast on load failure, just use defaults
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<SettingsContextType>) => {
    try {
      // Optimistic update
      const oldSettings = settings;
      setSettings(prev => ({ ...prev, ...newSettings }));
      
      const api = isAdmin ? adminApi : userApi;
      await api.updateSettings(newSettings);
      toast.success('Settings updated successfully');
    } catch (error) {
      // Revert on error
      setSettings(settings);
      console.error('Failed to update settings:', error);
      toast.error('Failed to update settings');
      throw error;
    }
  };

  const updateTheme = (theme: 'light' | 'dark') => {
    setSettings(prev => ({ ...prev, theme }));
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
  };

  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
      if (savedTheme) {
        setSettings(prev => ({ ...prev, theme: savedTheme }));
      }
    }
  }, []);

  return (
    <SettingsContext.Provider value={{ 
      ...settings, 
      updateSettings,
      updateTheme,
      isLoading
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
} 