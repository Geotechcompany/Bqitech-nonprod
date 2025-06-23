// app/dashboard/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { userApi } from "@/lib/api-backend";
import { toast } from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { FormSkeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle, XCircle, Mail, Camera, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    jobAlerts: boolean;
    applicationUpdates: boolean;
    marketingEmails: boolean;
  };
  privacy: {
    profileVisibility: string;
    showActivity: boolean;
    showApplicationHistory: boolean;
  };
  preferences: {
    theme: string;
    language: string;
    timezone: string;
  };
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isEmailVerified: boolean;
  avatar?: string;
}

const defaultSettings: UserSettings = {
  notifications: {
    email: true,
    push: true,
    jobAlerts: true,
    applicationUpdates: true,
    marketingEmails: false
  },
  privacy: {
    profileVisibility: "public",
    showActivity: true,
    showApplicationHistory: true
  },
  preferences: {
    theme: "light",
    language: "en",
    timezone: "UTC"
  }
};

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function SettingsPage() {
  const { user, updateUserAvatar } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [profile, setProfile] = useState<UserProfile>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
    isEmailVerified: false,
    avatar: user?.avatar || ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    loadSettings();
    loadProfile();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await userApi.getSettings();
      if (response?.settings) {
        setSettings(response.settings);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const response = await userApi.getProfile();
      if (response) {
        setProfile({
          firstName: response.firstName || user?.firstName || "",
          lastName: response.lastName || user?.lastName || "",
          email: response.email || user?.email || "",
          phone: response.phone || "",
          isEmailVerified: response.isEmailVerified || false,
          avatar: response.avatar || user?.avatar || ""
        });
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      toast.error("Failed to load profile");
    }
  };

  const handleSaveSettings = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      await userApi.updateSettings(settings);
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      await userApi.updateProfile(profile);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setIsChangingPassword(true);
      setPasswordErrors({});

      const validatedData = passwordSchema.parse(passwordData);
      await userApi.changePassword({
        currentPassword: validatedData.currentPassword,
        newPassword: validatedData.newPassword
      });
      
      toast.success("Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message;
          }
        });
        setPasswordErrors(errors);
      } else {
        toast.error("Failed to change password");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await userApi.resendVerification();
      toast.success("Verification email sent successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification email");
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, or GIF)');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const response = await userApi.uploadAvatar(file);
      
      // Update profile state with new avatar URL
      setProfile(prev => ({
        ...prev,
        avatar: response.url
      }));

      // Update auth context to sync avatar across components
      updateUserAvatar(response.url);

      toast.success('Profile photo updated successfully!');
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to upload profile photo. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  if (isLoading) {
    return <FormSkeleton />;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Photo Section */}
            <div className="flex flex-col items-center space-y-4 pb-6 border-b">
              <div className="relative group">
                <Avatar className="h-24 w-24 ring-4 ring-white shadow-lg">
                  <AvatarImage 
                    src={profile.avatar}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-xl">
                    {profile.firstName?.[0]?.toUpperCase()}{profile.lastName?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label 
                  htmlFor="avatarUpload"
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                </label>
                <input
                  id="avatarUpload"
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={isUploadingAvatar}
                />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Profile Photo</p>
                <p className="text-xs text-muted-foreground">
                  Click to upload a new photo (Max 5MB)
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  />
                  {profile.isEmailVerified ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-5 w-5 mr-1" />
                      <span className="text-sm">Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-amber-600">
                        <XCircle className="h-5 w-5 mr-1" />
                        <span className="text-sm">Unverified</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResendVerification}
                        className="ml-2"
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Resend
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profile.phone || ""}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="mt-4"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Password Change Section */}
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>Change your password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                />
                {passwordErrors.currentPassword && (
                  <p className="text-sm text-red-500">{passwordErrors.currentPassword}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                />
                {passwordErrors.newPassword && (
                  <p className="text-sm text-red-500">{passwordErrors.newPassword}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-red-500">{passwordErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              variant="secondary"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* Notifications Section */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                checked={settings.notifications.email}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      email: checked,
                    },
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive browser push notifications
                </p>
              </div>
              <Switch
                checked={settings.notifications.push}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      push: checked,
                    },
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Job Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about new job postings
                </p>
              </div>
              <Switch
                checked={settings.notifications.jobAlerts}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      jobAlerts: checked,
                    },
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Application Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about your application status changes
                </p>
              </div>
              <Switch
                checked={settings.notifications.applicationUpdates}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      applicationUpdates: checked,
                    },
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Receive promotional emails and newsletters
                </p>
              </div>
              <Switch
                checked={settings.notifications.marketingEmails}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      marketingEmails: checked,
                    },
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Section */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
            <CardDescription>Manage your privacy settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Profile Visibility</Label>
                <Select
                  value={settings.privacy.profileVisibility}
                  onValueChange={(value) =>
                    setSettings((prev) => ({
                      ...prev,
                      privacy: {
                        ...prev.privacy,
                        profileVisibility: value,
                      },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="contacts">Contacts Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Show Activity</Label>
                  <p className="text-sm text-muted-foreground">
                    Show your activity status to others
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.showActivity}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      privacy: {
                        ...prev.privacy,
                        showActivity: checked,
                      },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Show Application History</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to see your application history
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.showApplicationHistory}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      privacy: {
                        ...prev.privacy,
                        showApplicationHistory: checked,
                      },
                    }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences Section */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Theme</Label>
                <Select
                  value={settings.preferences.theme}
                  onValueChange={(value) =>
                    setSettings((prev) => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        theme: value,
                      },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Language</Label>
                <Select
                  value={settings.preferences.language}
                  onValueChange={(value) =>
                    setSettings((prev) => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        language: value,
                      },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Timezone</Label>
                <Select
                  value={settings.preferences.timezone}
                  onValueChange={(value) =>
                    setSettings((prev) => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        timezone: value,
                      },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={handleSaveSettings}
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
              "Save Settings"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
