"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "react-hot-toast";

interface SettingsContextType {
  emailNotifications: boolean;
  pushNotifications: boolean;
  autoLogout: number;
  tableRowsPerPage: number;
  sidebarCollapsed: boolean;
  updateSettings: (settings: Partial<SettingsContextType>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Omit<SettingsContextType, 'updateSettings'>>({
    emailNotifications: true,
    pushNotifications: true,
    autoLogout: 30,
    tableRowsPerPage: 10,
    sidebarCollapsed: false,
  });

  useEffect(() => {
    // Load settings from localStorage on mount
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const updateSettings = async (newSettings: Partial<SettingsContextType>) => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });

      if (!response.ok) throw new Error('Failed to update settings');

      setSettings(prev => {
        const updated = { ...prev, ...newSettings };
        localStorage.setItem('adminSettings', JSON.stringify(updated));
        return updated;
      });

      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ ...settings, updateSettings }}>
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