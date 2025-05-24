import { ChevronRight } from "lucide-react";
import { NotificationButton } from "@/components/NotificationButton";
import { useSession } from "next-auth/react";

interface AdminPageHeaderProps {
  title: string;
  breadcrumb?: string;
  children?: React.ReactNode;
}

export function AdminPageHeader({ title, breadcrumb, children }: AdminPageHeaderProps) {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col gap-4 mb-6 md:mb-8">
      {/* Top Bar with Profile - Always Visible */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
        
        <div className="flex items-center gap-3">
          <NotificationButton variant="ghost" />
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">
              {session?.user?.name || ''}
            </span>
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              {session?.user?.name?.charAt(0) || 'U'}
            </div>
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