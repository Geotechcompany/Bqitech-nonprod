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
import { useSettings } from "@/contexts/SettingsContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface SettingsState {
  emailNotifications: boolean;
  pushNotifications: boolean;
  autoLogout: number;
  tableRowsPerPage: number;
  sidebarCollapsed: boolean;
}

export default function SettingsPage() {
  const settings = useSettings();
  const { data: session } = useSession();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save settings');
      }
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
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

  return (
    <AdminPageLayout
      title="Settings"
      showSearch={false}
      className=" mx-auto px-4 md:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-sm border border-blue-100"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group shrink-0">
              <Avatar className="h-32 w-32 md:h-40 md:w-40 ring-4 ring-white/80 shadow-lg">
                <AvatarImage 
                  src={settings.profile.avatarUrl || session?.user?.image}
                  className="object-cover"
                />
                <AvatarFallback>
                  {session?.user?.name?.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <label 
                htmlFor="avatarUpload"
                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
              >
                <Camera className="h-8 w-8 text-white" />
              </label>
            </div>
            
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                {settings.profile.name}
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                {settings.profile.email}
              </p>
            </div>
          </div>
        </motion.div>

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
                    settings.updateSettings({ tableRowsPerPage: Number(value) })
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
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <Label className="font-medium">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={handleEmailNotificationChange}
                />
              </div>
            </div>
          </SettingCard>
        </div>

        <motion.div 
          className="sticky bottom-6 z-10 flex justify-end"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            size="lg"
            className="rounded-full px-8 shadow-lg gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : 'Save Changes'}
          </Button>
        </motion.div>
      </div>
    </AdminPageLayout>
  );
} 