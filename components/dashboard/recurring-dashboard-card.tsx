import { Card } from "@/components/ui/card";
import { CompactActionLink } from "@/components/ui/compact-action";
import { formatCurrency, formatRelativeDay } from "@/lib/format";
import type { RecurringItem } from "@/lib/types";

type RecurringDashboardCardProps = {
  items: RecurringItem[];
};

export function RecurringDashboardCard({ items }: RecurringDashboardCardProps) {
  if (items.length === 0) return null;

  return (
    <Card elevated padding="md" className="space-y-3 border-accent/15">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-text-muted">
          Upcoming payments
        </h2>
        <CompactActionLink href="/settings/recurring" variant="soft">
          Manage
        </CompactActionLink>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-xl bg-bg px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text">{item.title}</p>
              <p
                className={[
                  "mt-0.5 text-xs",
                  item.status === "missed" ? "text-danger" : "text-text-muted",
                ].join(" ")}
              >
                {item.status === "missed" ? "Missed: " : "Due: "}
                {formatRelativeDay(item.next_due_date)}
                {item.linked_goal ? ` · Goal: ${item.linked_goal.title}` : ""}
              </p>
            </div>
            <p className="shrink-0 text-sm font-semibold tabular-nums text-text">
              {item.recurring_type === "income" ? "+" : ""}
              {formatCurrency(item.amount)}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
