import { UserButton, useUser } from "@clerk/nextjs";
import { ChevronRight } from "lucide-react";
import { NotificationButton } from "@/components/NotificationButton";

interface AdminPageHeaderProps {
  title: string;
  breadcrumb?: string;
  children?: React.ReactNode;
}

export function AdminPageHeader({ title, breadcrumb, children }: AdminPageHeaderProps) {
  const { user } = useUser();

  return (
    <div className="flex flex-col gap-4 mb-6 md:mb-8">
      {/* Top Bar with Profile - Always Visible */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
        
        <div className="flex items-center gap-3">
          <NotificationButton variant="ghost" />
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">
              {user?.firstName || ''}
            </span>
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8"
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Breadcrumb - Hidden on Mobile */}
      {breadcrumb && (
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <span>Admin</span>
          <ChevronRight className="h-4 w-4" />
          <span>{breadcrumb}</span>
        </div>
      )}

      {children}
    </div>
  );
} 