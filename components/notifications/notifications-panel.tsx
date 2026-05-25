"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

import { ForwardLink } from "@/components/shared/forward-link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatNotificationDate } from "@/lib/notifications/format";
import type { Notification } from "@/lib/types";

type NotificationsPanelProps = {
  open: boolean;
  onClose: () => void;
  items: Notification[];
  loading: boolean;
  markingId: string | null;
  error: string | null;
  onMarkRead: (id: string) => void;
};

export function NotificationsPanel({
  open,
  onClose,
  items,
  loading,
  markingId,
  error,
  onMarkRead,
}: NotificationsPanelProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex bg-black/50 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notifications-title"
      onClick={onClose}
    >
      {/* Desktop: offset sidebar so panel centers in main content */}
      <div className="hidden w-56 shrink-0 md:block" aria-hidden />
      <div
        className="flex min-h-0 flex-1 items-center justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]"
        onClick={(e) => e.stopPropagation()}
      >
        <Card
          elevated
          padding="none"
          className="flex max-h-[min(32rem,calc(100dvh-2rem))] w-full max-w-md flex-col overflow-hidden"
        >
          <div className="glass-panel-light flex shrink-0 items-center justify-between border-b border-glass-border px-4 py-3">
            <h2
              id="notifications-title"
              className="text-lg font-semibold tracking-tight text-text"
            >
              Notifications
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 rounded-[var(--radius-input)] px-3 py-2 text-sm font-medium text-text-muted transition-[color,background-color] duration-[var(--dur-short)] hover:bg-surface/80 hover:text-text"
            >
              Close
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
            {loading && items.length === 0 && (
              <p className="py-8 text-center text-sm text-text-muted">
                Loading…
              </p>
            )}

            {!loading && items.length === 0 && (
              <div className="py-8 text-center text-sm text-text-muted">
                <p>No new notifications.</p>
                <ForwardLink
                  href="/settings/notification-history"
                  onClick={onClose}
                  className="mt-3 hover:underline"
                >
                  See previous notifications
                </ForwardLink>
              </div>
            )}

            {error && (
              <p className="mb-3 text-sm text-danger" role="alert">
                {error}
              </p>
            )}

            <ul className="space-y-3">
              {items.map((n) => (
                <li key={n.id}>
                  <Card padding="sm" className="bg-bg/50">
                    <p className="break-words font-medium text-text">{n.title}</p>
                    <p className="mt-1 break-words text-sm leading-relaxed text-text-muted">
                      {n.body}
                    </p>
                    <p className="mt-2 text-xs text-text-muted">
                      {formatNotificationDate(n.created_at)}
                    </p>
                    <Button
                      type="button"
                      variant="secondary"
                      className="mt-3 min-h-11 w-full text-sm"
                      disabled={markingId === n.id}
                      onClick={() => void onMarkRead(n.id)}
                    >
                      {markingId === n.id ? "Saving…" : "Mark as read"}
                    </Button>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </div>,
    document.body,
  );
}
