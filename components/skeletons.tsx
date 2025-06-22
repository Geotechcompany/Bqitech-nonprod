export function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
} 