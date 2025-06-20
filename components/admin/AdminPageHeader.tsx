"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface AdminPageHeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export default function AdminPageHeader({ title, onMenuClick }: AdminPageHeaderProps) {
  const { user, logout } = useAuth();

  return (
    <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">
          Welcome, {user?.name || 'Admin'}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
        >
          Logout
        </Button>
      </div>
    </div>
  );
} 