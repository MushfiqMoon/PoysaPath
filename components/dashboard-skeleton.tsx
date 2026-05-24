import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-40 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24 rounded-[var(--radius-card)]" />
        <Skeleton className="h-24 rounded-[var(--radius-card)]" />
      </div>
      <Skeleton className="h-28 rounded-[var(--radius-card)]" />
      <Skeleton className="h-40 rounded-[var(--radius-card)]" />
      <div className="space-y-2">
        <Skeleton className="h-16 rounded-[var(--radius-card)]" />
        <Skeleton className="h-16 rounded-[var(--radius-card)]" />
        <Skeleton className="h-16 rounded-[var(--radius-card)]" />
      </div>
    </div>
  );
}
