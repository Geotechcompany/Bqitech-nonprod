import { 
  Skeleton, 
  TableSkeleton, 
  CardSkeleton, 
  StatsSkeleton, 
  FormSkeleton, 
  PageSkeleton, 
  ListSkeleton, 
  ChartSkeleton 
} from "@/components/ui/skeleton";

export function SkeletonDemo() {
  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">Skeleton Loader Variants</h1>
      
      {/* Basic Skeleton */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Basic Skeleton</h2>
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Table Skeleton</h2>
        <div className="bg-white p-4 rounded-lg border">
          <TableSkeleton rows={5} columns={4} />
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Stats Skeleton</h2>
        <StatsSkeleton count={4} />
      </div>

      {/* Form Skeleton */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Form Skeleton</h2>
        <div className="bg-white p-6 rounded-lg border">
          <FormSkeleton />
        </div>
      </div>

      {/* List Skeleton */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">List Skeleton</h2>
        <div className="bg-white p-4 rounded-lg border">
          <ListSkeleton items={5} />
        </div>
      </div>

      {/* Chart Skeleton */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Chart Skeleton</h2>
        <ChartSkeleton />
      </div>

      {/* Full Page Skeleton */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Full Page Skeleton</h2>
        <div className="border rounded-lg">
          <PageSkeleton />
        </div>
      </div>
    </div>
  );
} 