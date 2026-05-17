import { Skeleton } from "@/components/ui/skeleton";

/** Compact placeholders for tab routes — avoids tall coin loader layout jumps on mobile. */
export function DashboardRouteSkeleton() {
  return (
    <div className="space-y-6" aria-busy aria-label="Loading dashboard">
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-36" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-[5.5rem] rounded-xl" />
        <Skeleton className="h-[5.5rem] rounded-xl" />
      </div>
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="h-36 w-full rounded-xl" />
    </div>
  );
}

export function ExpensesRouteSkeleton() {
  return (
    <div className="space-y-4" aria-busy aria-label="Loading expenses">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
      </div>
      <Skeleton className="h-11 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-[4.25rem] rounded-xl" />
        <Skeleton className="h-[4.25rem] rounded-xl" />
        <Skeleton className="h-[4.25rem] rounded-xl" />
      </div>
    </div>
  );
}

export function AddRouteSkeleton() {
  return (
    <div className="min-w-0 space-y-4" aria-busy aria-label="Loading add expense">
      <Skeleton className="h-7 w-36" />
      <Skeleton className="h-11 w-full rounded-lg" />
      <div className="space-y-3">
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function SettingsRouteSkeleton() {
  return (
    <div className="space-y-6" aria-busy aria-label="Loading settings">
      <Skeleton className="h-7 w-28" />
      <div className="grid gap-2">
        <Skeleton className="h-[4.5rem] rounded-xl" />
        <Skeleton className="h-[4.5rem] rounded-xl" />
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}
