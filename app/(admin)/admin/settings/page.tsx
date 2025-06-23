"use client";

import { motion } from 'framer-motion';
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { 
  Layout, 
  Bell, 
  Shield,
} from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { adminApi } from "@/lib/api-backend";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { FormSkeleton } from "@/components/ui/skeleton";
import { authService } from "@/lib/auth-backend";


interface AdminSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  autoLogout: number;
  tableRowsPerPage: number;
  sidebarCollapsed: boolean;
  theme: string;
  language: string;
  avatar: string;
}

const defaultSettings: AdminSettings = {
  emailNotifications: true,
  pushNotifications: true,
  autoLogout: 30,
  tableRowsPerPage: 25,
  sidebarCollapsed: false,
  theme: 'light',
  language: 'en',
  avatar: ''
};

function SettingsPageContent() {
  const { user, updateUserAvatar } = useAuth();
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      

      
      const response = await adminApi.getSettings();
      if (response) {
        setSettings({ ...defaultSettings, ...response });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load settings');
      // Use default settings if loading fails
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    
    try {
      await adminApi.updateSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = <K extends keyof AdminSettings>(
    key: K, 
    value: AdminSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Upload avatar
      const response = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/upload/avatar`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${authService.getSession()?.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      const data = await response.json();
      
      // Update local state with new avatar URL
      setSettings(prev => ({
        ...prev,
        avatar: data.url
      }));

      // Update auth context to sync avatar across components
      updateUserAvatar(data.url);

      toast.success('Avatar updated successfully');
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to upload avatar');
    }
  };

  const SettingCard = ({ 
    icon: Icon, 
    title, 
    description, 
    children 
  }: { 
    icon: any, 
    title: string, 
    description: string, 
    children: React.ReactNode 
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-background p-6 rounded-xl shadow-sm border border-muted/50 hover:border-primary/20 transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <AdminPageLayout title="Settings" showSearch={false}>
        <FormSkeleton />
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="Settings"
      showSearch={false}
      className="mx-auto px-4 md:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-sm border border-blue-100"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group shrink-0">
              <Avatar className="h-32 w-32 md:h-40 md:w-40 ring-4 ring-white/80 shadow-lg">
                <AvatarImage 
                  src={user?.avatar}
                  alt={user?.name || 'Admin User'}
                  className="object-cover"
                />
                <AvatarFallback>
                  {[user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('') || 'A'}
                </AvatarFallback>
              </Avatar>
              <label 
                htmlFor="avatarUpload"
                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
              >
                <Camera className="h-8 w-8 text-white" />
              </label>
              <input
                id="avatarUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin User' : 'Admin User'}
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                {user?.email}
              </p>
              <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {user?.role || 'admin'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Settings Cards */}
        <div className="flex flex-col gap-6">
          <SettingCard
            icon={Layout}
            title="Interface Preferences"
            description="Customize your dashboard appearance and layout"
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Table Density</Label>
                <Select
                  value={settings.tableRowsPerPage.toString()}
                  onValueChange={(value) => 
                    updateSetting('tableRowsPerPage', Number(value))
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Rows per page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 rows</SelectItem>
                    <SelectItem value="25">25 rows</SelectItem>
                    <SelectItem value="50">50 rows</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Theme</Label>
                <Select
                  value={settings.theme}
                  onValueChange={(value) => updateSetting('theme', value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <Label className="font-medium">Compact Sidebar</Label>
                  <p className="text-sm text-muted-foreground">
                    Collapse sidebar navigation
                  </p>
                </div>
                <Switch
                  checked={settings.sidebarCollapsed}
                  onCheckedChange={(checked) => 
                    updateSetting('sidebarCollapsed', checked)
                  }
                />
              </div>
            </div>
          </SettingCard>

          <SettingCard
            icon={Bell}
            title="Notifications"
            description="Manage your notification preferences"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <Label className="font-medium">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => 
                    updateSetting('emailNotifications', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <Label className="font-medium">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive browser push notifications
                  </p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => 
                    updateSetting('pushNotifications', checked)
                  }
                />
              </div>
            </div>
          </SettingCard>

          <SettingCard
            icon={Shield}
            title="Security"
            description="Manage your security preferences"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Auto Logout (minutes)</Label>
                <Select
                  value={settings.autoLogout.toString()}
                  onValueChange={(value) => 
                    updateSetting('autoLogout', Number(value))
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Auto logout time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="0">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SettingCard>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-6">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            size="lg"
            className="min-w-[120px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </div>
      </div>
    </AdminPageLayout>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute requireAdmin>
      <SettingsPageContent />
    </ProtectedRoute>
  );
} 