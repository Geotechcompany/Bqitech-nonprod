"use client";

import { useState } from 'react';
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
import { useSettings } from "@/contexts/SettingsContext";

interface SettingsState {
  emailNotifications: boolean;
  pushNotifications: boolean;
  autoLogout: number;
  tableRowsPerPage: number;
  sidebarCollapsed: boolean;
}

export default function SettingsPage() {
  const settings = useSettings();

  const handleSave = async () => {
    try {
      // In a real app, you would save to your backend
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleEmailNotificationChange = async (checked: boolean) => {
    try {
      await settings.updateSettings({ emailNotifications: checked });
    } catch (error) {
      // Error is already handled by the context
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
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-blue-50">
          <Icon className="w-6 h-6 text-blue-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-4">{description}</p>
          {children}
        </div>
      </div>
    </motion.div>
  );

  return (
    <AdminPageLayout
      title="Settings"
      showSearch={false}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <SettingCard
          icon={Layout}
          title="Layout"
          description="Customize the layout of tables and sidebar"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="rowsPerPage">Rows per page</Label>
              <Select
                value={settings.tableRowsPerPage.toString()}
                onValueChange={(value) => 
                  settings.updateSettings({ tableRowsPerPage: parseInt(value) })
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select rows" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 rows</SelectItem>
                  <SelectItem value="10">10 rows</SelectItem>
                  <SelectItem value="20">20 rows</SelectItem>
                  <SelectItem value="50">50 rows</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="sidebarCollapsed">Collapsed Sidebar</Label>
              <Switch
                checked={settings.sidebarCollapsed}
                onCheckedChange={(checked) => 
                  settings.updateSettings({ sidebarCollapsed: checked })
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
            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={handleEmailNotificationChange}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="pushNotifications">Push Notifications</Label>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => 
                  settings.updateSettings({ pushNotifications: checked })
                }
              />
            </div>
          </div>
        </SettingCard>

        <SettingCard
          icon={Shield}
          title="Security"
          description="Configure security settings"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="autoLogout">Auto Logout (minutes)</Label>
              <Input
                type="number"
                value={settings.autoLogout}
                onChange={(e) => 
                  settings.updateSettings({ autoLogout: parseInt(e.target.value) })
                }
                className="w-[180px]"
                min={5}
                max={120}
              />
            </div>
          </div>
        </SettingCard>

        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Reset
          </Button>
          <Button
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </AdminPageLayout>
  );
} 