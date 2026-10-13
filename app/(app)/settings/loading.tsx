import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="space-y-1.5">
        <Skeleton className="h-8 w-32 bg-muted" />
        <Skeleton className="h-4 w-72 bg-muted/60" />
      </div>

      <div className="border border-border rounded-[12px] bg-card p-6 space-y-5">
        <div className="space-y-1">
          <Skeleton className="h-5 w-36 bg-muted" />
          <Skeleton className="h-3 w-64 bg-muted/60" />
        </div>
        <div className="space-y-4 max-w-xl pt-2">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24 bg-muted/60" />
            <Skeleton className="h-9 w-full bg-muted/40" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-20 bg-muted/60" />
            <Skeleton className="h-9 w-full bg-muted/40" />
          </div>
          <Skeleton className="h-9 w-28 bg-muted mt-2" />
        </div>
      </div>

      <div className="border border-border rounded-[12px] bg-card p-6 space-y-4">
        <Skeleton className="h-5 w-44 bg-muted" />
        <Skeleton className="h-10 w-full max-w-2xl bg-muted/40" />
      </div>
    </div>
  );
}
