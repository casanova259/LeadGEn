import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LeadDetailLoading() {
  return (
    <div className="p-6 max-w-6xl space-y-6">
      {/* Back button */}
      <Skeleton className="h-8 w-28 bg-muted" />

      {/* Header Profile skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-48 bg-muted" />
            <Skeleton className="h-5 w-20 rounded-full bg-muted/80" />
            <Skeleton className="h-5 w-16 rounded-full bg-muted/60" />
          </div>
          <Skeleton className="h-4 w-64 bg-muted/50" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20 rounded-md bg-muted" />
          <Skeleton className="h-9 w-24 rounded-md bg-muted" />
          <Skeleton className="h-9 w-28 rounded-md bg-muted" />
          <Skeleton className="h-9 w-9 rounded-md bg-muted" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-36 bg-muted" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-3 w-16 bg-muted/60" />
                    <Skeleton className="h-4 w-32 bg-muted" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-32 bg-muted" />
              <Skeleton className="h-3 w-48 bg-muted/60" />
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-3 space-y-2">
                <Skeleton className="h-4 w-40 bg-muted" />
                <Skeleton className="h-3 w-32 bg-muted/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card className="border-border bg-card h-full">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-32 bg-muted" />
              <Skeleton className="h-3 w-44 bg-muted/60" />
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="size-5 rounded-full bg-muted shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-28 bg-muted" />
                    <Skeleton className="h-3 w-20 bg-muted/50" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
