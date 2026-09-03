import { Skeleton } from "@/components/ui/skeleton";

export default function LeadsLoading() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-28 bg-muted" />
          <Skeleton className="h-3 w-56 bg-muted/60" />
        </div>
        <Skeleton className="h-9 w-24 rounded-md bg-muted" />
      </div>

      {/* Filter bar skeleton */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Skeleton className="h-9 flex-1 rounded-md bg-muted" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-40 rounded-md bg-muted" />
          <Skeleton className="h-9 w-40 rounded-md bg-muted" />
        </div>
        <Skeleton className="h-9 w-16 rounded-md bg-muted" />
      </div>

      {/* Lead rows skeleton */}
      <div className="border rounded-md divide-y bg-card overflow-hidden">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3.5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-32 bg-muted" />
                <Skeleton className="h-4 w-16 rounded-full bg-muted/70" />
              </div>
              <Skeleton className="h-3 w-48 bg-muted/50" />
            </div>
            <Skeleton className="h-7 w-14 rounded-md bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
