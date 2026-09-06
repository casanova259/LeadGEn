import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header skeleton */}
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48 bg-muted" />
          <Skeleton className="h-4 w-72 bg-muted/60" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-28 rounded-md bg-muted" />
          <Skeleton className="h-8 w-24 rounded-md bg-muted" />
        </div>
      </div>

      {/* 4 KPI cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28 bg-muted" />
              <Skeleton className="h-4 w-4 bg-muted" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-16 bg-muted" />
              <Skeleton className="h-5 w-20 rounded-full bg-muted/70" />
            </div>
            <Skeleton className="h-3 w-36 bg-muted/60" />
          </div>
        ))}
      </div>

      {/* Action center split grid skeleton */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-7 rounded-xl border border-border bg-card p-5 space-y-4">
          <Skeleton className="h-5 w-36 bg-muted" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/60">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32 bg-muted" />
                  <Skeleton className="h-3 w-24 bg-muted/60" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20 rounded-md bg-muted" />
                  <Skeleton className="h-8 w-16 rounded-md bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-5 rounded-xl border border-border bg-card p-5 space-y-4">
          <Skeleton className="h-5 w-36 bg-muted" />
          <Skeleton className="h-14 w-full rounded-lg bg-muted/40" />
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/60">
                <Skeleton className="h-4 w-28 bg-muted" />
                <Skeleton className="h-7 w-16 rounded-md bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline flow chart skeleton */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-44 bg-muted" />
          <Skeleton className="h-8 w-32 rounded-md bg-muted" />
        </div>
        <Skeleton className="h-64 w-full rounded-lg bg-muted/30" />
      </div>

      {/* Recent opportunities table skeleton */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <Skeleton className="h-5 w-48 bg-muted" />
        <Skeleton className="h-40 w-full rounded-lg bg-muted/30" />
      </div>
    </div>
  );
}
