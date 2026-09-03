import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen space-y-6 bg-[#0a0a0a] p-6">
      {/* Title skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-36 bg-zinc-800" />
        <Skeleton className="h-4 w-48 bg-zinc-800/60" />
      </div>

      {/* 5 stat cards skeleton */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
            <Skeleton className="h-3 w-20 bg-zinc-800" />
            <Skeleton className="h-8 w-12 bg-zinc-700" />
          </div>
        ))}
      </div>

      {/* Rescue Queue card skeleton */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32 bg-zinc-800" />
          <Skeleton className="h-6 w-28 rounded-full bg-zinc-800" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-40 bg-zinc-800" />
                <Skeleton className="h-3 w-24 bg-zinc-800/60" />
              </div>
              <Skeleton className="h-3 w-20 bg-zinc-800" />
            </div>
          ))}
        </div>
      </div>

      {/* Analytics charts skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
          <Skeleton className="h-5 w-36 bg-zinc-800" />
          <Skeleton className="h-48 w-full bg-zinc-800/40" />
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
          <Skeleton className="h-5 w-36 bg-zinc-800" />
          <Skeleton className="h-48 w-full bg-zinc-800/40" />
        </div>
      </div>
    </div>
  );
}
