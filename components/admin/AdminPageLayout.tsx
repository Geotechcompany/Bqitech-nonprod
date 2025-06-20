import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminPageLayoutProps {
  title: string;
  searchPlaceholder?: string;
  children: React.ReactNode;
  filters?: React.ReactNode;
  onSearch?: (value: string) => void;
  searchValue?: string;
  showSearch?: boolean;
  className?: string;
  headerActions?: React.ReactNode;
  breadcrumb?: string;
}

export function AdminPageLayout({
  title,
  searchPlaceholder,
  children,
  filters,
  onSearch,
  searchValue,
  showSearch = true,
  className,
  headerActions
}: AdminPageLayoutProps) {
  return (
    <div className={cn("h-full w-full flex flex-col bg-gray-100", className)}>
      <div className="flex-shrink-0 px-4 md:px-6 pt-6 pb-4">
        <AdminPageHeader title={title} />
      </div>
      
      {/* Only show search section if showSearch is true */}
      {showSearch && (
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                value={searchValue}
                onChange={(e) => onSearch?.(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            {filters}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-auto w-full">
        {children}
      </div>
    </div>
  );
} 