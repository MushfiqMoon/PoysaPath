import { Card } from "@/components/ui/card";
import { formatDateTimeDhaka } from "@/lib/format";
import type { AdminStats, AdminUserRow } from "@/lib/auth/admin";

type AdminOverviewProps = {
  stats: AdminStats;
  users: AdminUserRow[];
};

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card padding="md">
      <p className="text-sm text-text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-text">{value}</p>
      {hint ? (
        <p className="mt-2 text-sm leading-snug text-text-muted">{hint}</p>
      ) : null}
    </Card>
  );
}

const listRowClass =
  "grid grid-cols-2 gap-3 px-4 py-3 text-sm";

export function AdminOverview({ stats, users }: AdminOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard
          label="Registered users"
          value={String(stats.totalUsers)}
          hint="All accounts with a profile"
        />
        <StatCard
          label="Users who have signed in"
          value={String(stats.usersLoggedIn)}
          hint="At least one recorded visit"
        />
      </div>

      <Card padding="none" className="overflow-hidden">
        <div
          className={`${listRowClass} border-b border-glass-border bg-surface/60 text-text-muted`}
        >
          <span>Email</span>
          <span>Last visit</span>
        </div>
        <ul className="divide-y divide-glass-border">
          {users.map((user) => (
            <li key={user.email} className={listRowClass}>
              <span className="min-w-0 truncate font-medium text-text">
                {user.email}
              </span>
              <span className="text-text-muted">
                {user.lastSeenAt ? (
                  formatDateTimeDhaka(user.lastSeenAt)
                ) : (
                  <span className="text-amber-600 dark:text-amber-400">
                    Never visited
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
