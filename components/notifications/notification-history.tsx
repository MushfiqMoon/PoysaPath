import { formatNotificationDate } from "@/lib/notifications/format";
import type { ReadNotification } from "@/lib/types";

type NotificationHistoryProps = {
  items: ReadNotification[];
};

export function NotificationHistory({ items }: NotificationHistoryProps) {
  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-text-muted">
          No past announcements yet. New updates appear in the bell until you
          mark them read.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((n) => (
            <li
              key={n.id}
              className="rounded-xl border border-border bg-bg/50 p-3"
            >
              <p className="break-words font-medium text-text">{n.title}</p>
              <p className="mt-1 break-words text-sm text-text-muted">
                {n.body}
              </p>
              <p className="mt-2 text-xs text-text-muted">
                {formatNotificationDate(n.created_at)}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Marked read · {formatNotificationDate(n.read_at)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
