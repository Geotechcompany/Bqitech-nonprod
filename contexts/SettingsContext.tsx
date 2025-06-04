"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "react-hot-toast";
import useSWR from 'swr';
import { useSession } from "next-auth/react";

interface SettingsContextType {
  emailNotifications: boolean;
  pushNotifications: boolean;
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
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Add SWR fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { data, error, mutate } = useSWR('/api/admin/settings', fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 300000 // 5 minutes
  });

  const { data: session, update } = useSession();

  const [settings, setSettings] = useState<Omit<SettingsContextType, 'updateSettings'>>({
    // Initialize with default values
    emailNotifications: true,
    pushNotifications: true,
    autoLogout: 30,
    tableRowsPerPage: 10,
    sidebarCollapsed: false,
    profile: {
      name: '',
      email: '',
      avatarUrl: ''
    },
    theme: 'light',
    updateTheme: (theme: 'light' | 'dark') => {}
  });

  // Update local state when SWR data changes
  useEffect(() => {
    if (data) {
      setSettings(prev => ({
        ...prev,
        ...data,
        profile: {
          ...prev.profile,
          ...data.profile
        }
      }));
    }
  }, [data]);

  const updateSettings = async (newSettings: Partial<SettingsContextType>) => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });

      if (!response.ok) throw new Error('Failed to update settings');
      
      if (newSettings.profile?.avatarUrl) {
        await update({
          ...session,
          user: {
            ...session?.user,
            image: newSettings.profile.avatarUrl
          }
        });
      }

      mutate({ ...data, ...newSettings }, false);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error(error.message);
      mutate();
      throw error;
    }
  };

  const updateTheme = (theme: 'light' | 'dark') => {
    setSettings(prev => ({ ...prev, theme }));
    // Optional: Save to localStorage
  };

  return (
    <SettingsContext.Provider value={{ 
      ...settings, 
      updateSettings,
      updateTheme 
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