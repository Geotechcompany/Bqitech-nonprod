// app/dashboard/settings/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);
  const [emailVerified, setEmailVerified] = useState<Date | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '',
      email: ''
    }
  });

  const passwordSchema = z.object({
    currentPassword: z.string().min(8, "Minimum 8 characters required"),
    newPassword: z.string()
      .min(8, "Minimum 8 characters required")
      .regex(/[A-Z]/, "At least one uppercase letter")
      .regex(/[0-9]/, "At least one number"),
    confirmPassword: z.string()
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema)
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/user/settings', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error('Failed to load settings');
        
        const data = await response.json();
        reset(data.user);
        if (data.user.emailVerified) {
          setEmailVerified(new Date(data.user.emailVerified));
        }
      } catch (error) {
        toast.error('Failed to load settings');
      } finally {
        setIsLoadingSettings(false);
      }
    };

    fetchSettings();
  }, [reset, session?.user?.email]);

  const onSubmit = async (data: any) => {
    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update settings");
      }

      toast.success("Settings updated successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update settings");
    }
  };

  const handleResendVerification = async () => {
    try {
      setIsResending(true);
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session?.user?.email })
      });

      if (!response.ok) throw new Error('Failed to resend verification');
      
      toast.success('Verification email sent! Check your inbox.');
      router.push(`/auth/verify-email?email=${encodeURIComponent(session?.user?.email || '')}`);
    } catch (error) {
      toast.error(error.message || 'Failed to resend verification');
    } finally {
      setIsResending(false);
    }
  };

  const onPasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error || "Password update failed");

      toast.success("Password updated successfully");
      passwordForm.reset();
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Add password strength meter component
  const PasswordStrength = ({ password }: { password: string }) => {
    const getStrength = (pass: string) => {
      let score = 0;
      if (pass.length >= 8) score++;
      if (/[A-Z]/.test(pass)) score++;
      if (/[0-9]/.test(pass)) score++;
      if (/[^A-Za-z0-9]/.test(pass)) score++;
      return score;
    };

    const strength = getStrength(password);
    
    return (
      <div className="grid grid-cols-4 gap-2 mt-2">
        {[...Array(4)].map((_, i) => (
          <div 
            key={i}
            className={`h-2 rounded-full ${i < strength ? 'bg-green-500' : 'bg-gray-200'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
          Account Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your professional account preferences and security settings
        </p>
      </header>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Email Verification</h3>
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <span className="block text-sm font-medium">
              Status: {emailVerified ? 
                <span className="text-green-600">Verified</span> : 
                <span className="text-yellow-600">Not Verified</span>
              }
            </span>
            {emailVerified ? (
              <p className="text-sm text-muted-foreground">
                Verified on {emailVerified.toLocaleDateString()}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Please verify your email address to access all features
              </p>
            )}
          </div>
          {!emailVerified && (
            <Button 
              onClick={handleResendVerification}
              disabled={isResending}
              variant="outline"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : 'Verify Email'}
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Your name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            {...register("email")}
            type="email"
            placeholder="Your email"
            disabled
          />
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit"
            disabled={isLoadingSettings || isResending}
          >
            {isLoadingSettings ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isLoadingSettings ? 'Loading...' : 'Save Changes'}
          </Button>
        </div>
      </form>

      <div className="space-y-6">
        <h3 className="text-lg font-medium">Change Password</h3>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              {...passwordForm.register("currentPassword")}
            />
            {passwordForm.formState.errors.currentPassword && (
              <p className="text-sm text-destructive">
                {passwordForm.formState.errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              {...passwordForm.register("newPassword")}
              onChange={(e) => {
                passwordForm.setValue("newPassword", e.target.value);
                passwordForm.trigger("newPassword");
              }}
            />
            <PasswordStrength password={passwordForm.watch("newPassword") || ""} />
            {passwordForm.formState.errors.newPassword && (
              <p className="text-sm text-destructive">
                {passwordForm.formState.errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...passwordForm.register("confirmPassword")}
            />
            {passwordForm.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {passwordForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button 
              type="submit"
              disabled={passwordForm.formState.isSubmitting}
            >
              {passwordForm.formState.isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Change Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
