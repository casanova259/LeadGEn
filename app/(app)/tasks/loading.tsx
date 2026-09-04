import { Skeleton } from "@/components/ui/skeleton";

export default function TasksLoading() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-48 bg-muted" />
          <Skeleton className="h-4 w-72 bg-muted/60" />
        </div>
        <Skeleton className="h-9 w-28 rounded-md bg-muted" />
      </div>

      {/* Metric cards skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-3 sm:p-3.5 rounded-xl border border-border/60 bg-card space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-16 bg-muted" />
              <Skeleton className="size-4 rounded-full bg-muted/60" />
            </div>
            <Skeleton className="h-7 w-10 bg-muted" />
          </div>
        ))}
      </div>

      {/* Toolbar skeleton */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        <Skeleton className="h-9 flex-1 rounded-md bg-muted" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-md bg-muted" />
          <Skeleton className="h-9 w-24 rounded-md bg-muted" />
        </div>
      </div>

      {/* List skeleton */}
      <div className="border rounded-xl divide-y divide-border/60 bg-card overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-5 rounded-full bg-muted" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-40 bg-muted" />
                <Skeleton className="h-3 w-60 bg-muted/60" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-20 rounded-md bg-muted" />
              <Skeleton className="h-7 w-16 rounded-md bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
