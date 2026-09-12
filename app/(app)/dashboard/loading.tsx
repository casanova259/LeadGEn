import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen space-y-6 p-6 max-w-7xl mx-auto bg-[var(--bg)] text-[var(--ink)]">
      {/* Header skeleton */}
      <div className="flex items-baseline justify-between pb-4 border-b border-[var(--hairline)]">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48 bg-[var(--surface-raised)]" />
          <Skeleton className="h-4 w-72 bg-[var(--surface-raised)]/60" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-28 rounded-[8px] bg-[var(--surface-raised)]" />
          <Skeleton className="h-8 w-24 rounded-[8px] bg-[var(--surface-raised)]" />
        </div>
      </div>

      {/* Status Rail skeleton: 1 single container with 3 columns */}
      <div className="rounded-[12px] border border-[var(--hairline)] bg-[var(--surface)] grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--hairline)] overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-5 pl-6 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24 bg-[var(--surface-raised)]" />
              <Skeleton className="h-3 w-16 bg-[var(--surface-raised)]/60" />
            </div>
            <Skeleton className="h-9 w-20 bg-[var(--surface-raised)]" />
            <Skeleton className="h-3 w-40 bg-[var(--surface-raised)]/60" />
          </div>
        ))}
      </div>

      {/* Dispatch Chart skeleton */}
      <div className="rounded-[12px] border border-[var(--hairline)] bg-[var(--surface)] p-6 space-y-4">
        <div className="flex items-baseline justify-between">
          <div className="space-y-1">
            <Skeleton className="h-5 w-32 bg-[var(--surface-raised)]" />
            <Skeleton className="h-3.5 w-64 bg-[var(--surface-raised)]/60" />
          </div>
          <Skeleton className="h-5 w-20 bg-[var(--surface-raised)]" />
        </div>
        <Skeleton className="h-64 w-full rounded-[8px] bg-[var(--surface-raised)]/30" />
      </div>

      {/* Action center split grid skeleton */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-7 rounded-[12px] border border-[var(--hairline)] bg-[var(--surface)] p-6 space-y-4">
          <Skeleton className="h-5 w-36 bg-[var(--surface-raised)]" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3.5 rounded-[8px] border border-[var(--hairline)]"
              >
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36 bg-[var(--surface-raised)]" />
                  <Skeleton className="h-3 w-28 bg-[var(--surface-raised)]/60" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-7 w-20 rounded-[6px] bg-[var(--surface-raised)]" />
                  <Skeleton className="h-7 w-16 rounded-[6px] bg-[var(--surface-raised)]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-5 rounded-[12px] border border-[var(--hairline)] bg-[var(--surface)] p-6 space-y-4">
          <Skeleton className="h-5 w-36 bg-[var(--surface-raised)]" />
          <Skeleton className="h-16 w-full rounded-[8px] bg-[var(--surface-raised)]/40" />
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-[8px] border border-[var(--hairline)]"
              >
                <Skeleton className="h-4 w-28 bg-[var(--surface-raised)]" />
                <Skeleton className="h-7 w-16 rounded-[6px] bg-[var(--surface-raised)]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent opportunities table skeleton */}
      <div className="rounded-[12px] border border-[var(--hairline)] bg-[var(--surface)] p-6 space-y-4">
        <Skeleton className="h-5 w-44 bg-[var(--surface-raised)]" />
        <Skeleton className="h-40 w-full rounded-[8px] bg-[var(--surface-raised)]/30" />
      </div>
    </div>
  );
}
