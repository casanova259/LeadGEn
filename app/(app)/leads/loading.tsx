import { Skeleton } from "@/components/ui/skeleton";

export default function LeadsLoading() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-36 bg-[var(--surface-raised)]" />
            <Skeleton className="h-5 w-20 rounded-full bg-[var(--surface-raised)]/60" />
          </div>
          <Skeleton className="h-3.5 w-64 bg-[var(--surface-raised)]/60" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-[8px] bg-[var(--surface-raised)]" />
          <Skeleton className="h-9 w-24 rounded-[8px] bg-[var(--surface-raised)]" />
          <Skeleton className="h-9 w-24 rounded-[8px] bg-[var(--surface-raised)]" />
        </div>
      </div>

      {/* Filter bar skeleton */}
      <div className="rounded-[12px] border border-[var(--hairline)] bg-[var(--surface)] p-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <Skeleton className="h-9 flex-1 rounded-[6px] bg-[var(--surface-raised)]" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-36 rounded-[6px] bg-[var(--surface-raised)]" />
            <Skeleton className="h-9 w-32 rounded-[6px] bg-[var(--surface-raised)]" />
          </div>
          <Skeleton className="h-9 w-16 rounded-[6px] bg-[var(--surface-raised)]" />
        </div>
      </div>

      {/* Table rows skeleton */}
      <div className="rounded-[12px] border border-[var(--hairline)] bg-[var(--surface)] overflow-hidden divide-y divide-[var(--hairline)]">
        {/* Header row skeleton */}
        <div className="px-4 py-3 bg-[var(--surface-raised)]/60 flex items-center justify-between">
          <Skeleton className="h-4 w-28 bg-[var(--surface-raised)]" />
          <Skeleton className="h-4 w-28 bg-[var(--surface-raised)]" />
          <Skeleton className="h-4 w-24 bg-[var(--surface-raised)]" />
          <Skeleton className="h-4 w-20 bg-[var(--surface-raised)]" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-full bg-[var(--surface-raised)]" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32 bg-[var(--surface-raised)]" />
                <Skeleton className="h-3 w-16 bg-[var(--surface-raised)]/50" />
              </div>
            </div>
            <Skeleton className="h-4 w-32 bg-[var(--surface-raised)]/60 hidden sm:block" />
            <Skeleton className="h-6 w-20 rounded-full bg-[var(--surface-raised)]/70" />
            <div className="flex gap-1.5">
              <Skeleton className="size-7 rounded-[6px] bg-[var(--surface-raised)]" />
              <Skeleton className="size-7 rounded-[6px] bg-[var(--surface-raised)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
