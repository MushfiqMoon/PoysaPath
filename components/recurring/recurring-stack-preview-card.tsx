import { StackPeekStrip } from "@/components/shared/stack-peek-strip";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatRelativeDay } from "@/lib/format";
import type { RecurringItem } from "@/lib/types";

type RecurringStackPreviewCardProps = {
  item: RecurringItem;
  variant: "peek" | "front";
  showHint?: boolean;
  tapHint?: string;
};

function statusLabel(item: RecurringItem) {
  if (!item.is_active) return "Paused";
  if (item.status === "missed") return "Missed";
  if (item.status === "due_soon") return "Due soon";
  return "Upcoming";
}

function statusBadgeClass(item: RecurringItem) {
  if (item.status === "missed") return "bg-danger/10 text-danger";
  if (item.status === "due_soon") return "bg-accent/12 text-accent";
  return "bg-bg/70 text-text-muted";
}

export function RecurringStackPreviewCard({
  item,
  variant,
  showHint = false,
  tapHint = "Swipe to browse",
}: RecurringStackPreviewCardProps) {
  const accentBar =
    item.status === "missed"
      ? false
      : item.status === "due_soon" || item.is_active;

  if (variant === "peek") {
    return (
      <StackPeekStrip
        title={item.title}
        meta={statusLabel(item)}
        accent={accentBar}
      />
    );
  }

  return (
    <Card padding="none" className="pointer-events-none w-full overflow-hidden shadow-[0_8px_28px_rgba(0,0,0,0.08)]">
      <div
        className={[
          "h-1",
          item.status === "missed"
            ? "bg-danger"
            : item.status === "due_soon"
              ? "bg-accent"
              : "bg-border",
        ].join(" ")}
        aria-hidden
      />
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold tracking-tight text-text">
              {item.title}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {formatCurrency(item.amount)} ·{" "}
              {item.category?.name ?? "Recurring payment"}
            </p>
          </div>
          <span
            className={[
              "shrink-0 rounded-full px-2 py-1 text-xs font-semibold",
              statusBadgeClass(item),
            ].join(" ")}
          >
            {statusLabel(item)}
          </span>
        </div>

        <div className="rounded-xl border border-border/70 bg-bg/45 px-3 py-2 text-sm">
          <span className="text-text-muted">Next due </span>
          <span className="font-semibold text-text">
            {formatRelativeDay(item.next_due_date)}
          </span>
        </div>

        {showHint ? (
          <p className="text-center text-xs text-text-muted">{tapHint}</p>
        ) : null}
      </div>
    </Card>
  );
}
