import { Skeleton } from "@/components/ui/skeleton";

export default function TasksLoading() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-7 w-24 bg-muted" />

      <div className="border rounded-md divide-y bg-card overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3.5">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-36 bg-muted" />
              <Skeleton className="h-3 w-52 bg-muted/60" />
            </div>
            <Skeleton className="h-8 w-20 rounded-md bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
