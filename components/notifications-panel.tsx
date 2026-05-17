"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { TIMEZONE } from "@/lib/constants";
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

function formatNotificationDate(iso: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: TIMEZONE,
  }).format(new Date(iso));
}

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
      className="fixed inset-0 z-[100] flex bg-black/40"
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
        <div className="flex max-h-[min(32rem,calc(100dvh-2rem))] w-full max-w-md flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
          <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
            <h2
              id="notifications-title"
              className="text-lg font-semibold text-text"
            >
              Notifications
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-bg hover:text-text"
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
              <p className="py-8 text-center text-sm text-text-muted">
                No new notifications.
              </p>
            )}

            {error && (
              <p className="mb-3 text-sm text-danger" role="alert">
                {error}
              </p>
            )}

            <ul className="space-y-3">
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
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-3 min-h-11 w-full text-sm"
                    disabled={markingId === n.id}
                    onClick={() => void onMarkRead(n.id)}
                  >
                    {markingId === n.id ? "Saving…" : "Mark as read"}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
