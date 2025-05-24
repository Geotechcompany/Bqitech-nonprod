import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Search } from "lucide-react";

interface AdminPageLayoutProps {
  title: string;
  searchPlaceholder?: string;
  children: React.ReactNode;
  filters?: React.ReactNode;
  onSearch?: (value: string) => void;
  searchValue?: string;
  showSearch?: boolean;
}

export function AdminPageLayout({
  title,
  searchPlaceholder,
  children,
  filters,
  onSearch,
  searchValue,
  showSearch = true
}: AdminPageLayoutProps) {
  return (
    <>
      <AdminPageHeader title={title} breadcrumb={title} />
      
      {/* Only show search section if showSearch is true */}
      {showSearch && (
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b">
          <div className="p-4 max-w-[2000px] mx-auto">
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
        </div>
      )}

      {/* Content Area */}
      <div className="p-6">
        {children}
      </div>
    </>
  );
} 