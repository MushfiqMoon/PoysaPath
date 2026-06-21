"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";

import { ForwardLink } from "@/components/shared/forward-link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatNotificationDate } from "@/lib/notifications/format";
import type { BellNotification } from "@/lib/types";

type NotificationsPanelProps = {
  open: boolean;
  onClose: () => void;
  items: BellNotification[];
  loading: boolean;
  markingId: string | null;
  error: string | null;
  onMarkRead: (id: string) => void;
};

function reminderCardClass(kind: string, source: BellNotification["source"]) {
  if (source === "shared_reminder" || source === "connection") {
    return "border-accent/35 bg-accent/8 ring-1 ring-accent/15";
  }
  if (kind === "recurring_missed") {
    return "border-danger/35 bg-danger/8 ring-1 ring-danger/15";
  }
  if (kind === "recurring_due_soon") {
    return "border-accent/35 bg-accent/8 ring-1 ring-accent/15";
  }
  return "bg-bg/50";
}

function NotificationCard({
  item,
  markingId,
  onMarkRead,
  onClose,
}: {
  item: BellNotification;
  markingId: string | null;
  onMarkRead: (id: string) => void;
  onClose: () => void;
}) {
  const isRecurring = item.source === "recurring";
  const isSharedReminder = item.source === "shared_reminder";
  const isConnection = item.source === "connection";
  const isLinked = (isRecurring || isSharedReminder || isConnection) && item.href;

  const isCompactInbox = isSharedReminder || isConnection;
  const inboxMessage = isCompactInbox ? item.body : null;

  return (
    <Card padding="sm" className={reminderCardClass(item.kind, item.source)}>
      {isLinked ? (
        <Link
          href={item.href!}
          onClick={onClose}
          className="block rounded-lg transition-opacity hover:opacity-90"
        >
          {inboxMessage ? (
            <p className="break-words text-sm leading-relaxed text-text">
              {inboxMessage}
            </p>
          ) : (
            <>
              <p className="break-words font-medium text-text">{item.title}</p>
              <p className="mt-1 break-words text-sm leading-relaxed text-text-muted">
                {item.body}
              </p>
            </>
          )}
        </Link>
      ) : (
        <>
          {inboxMessage ? (
            <p className="break-words text-sm leading-relaxed text-text">
              {inboxMessage}
            </p>
          ) : (
            <>
              <p className="break-words font-medium text-text">{item.title}</p>
              <p className="mt-1 break-words text-sm leading-relaxed text-text-muted">
                {item.body}
              </p>
            </>
          )}
        </>
      )}
      {!isCompactInbox ? (
        <p className="mt-2 text-xs text-text-muted">
          {isRecurring
            ? "Payment reminder"
            : formatNotificationDate(item.created_at)}
        </p>
      ) : null}
      {isRecurring && item.href ? (
        <ForwardLink href={item.href} onClick={onClose} className="mt-2 text-xs">
          View recurring payments
        </ForwardLink>
      ) : null}
      {!isSharedReminder && isConnection && item.href ? (
        <ForwardLink href={item.href} onClick={onClose} className="mt-2 text-xs">
          Review connection request
        </ForwardLink>
      ) : null}
      <Button
        type="button"
        variant="secondary"
        className="mt-3 min-h-11 w-full text-sm"
        disabled={markingId === item.id}
        onClick={() => void onMarkRead(item.id)}
      >
        {markingId === item.id ? "Saving…" : "Mark as read"}
      </Button>
    </Card>
  );
}

function NotificationSection({
  title,
  items,
  markingId,
  onMarkRead,
  onClose,
}: {
  title: string;
  items: BellNotification[];
  markingId: string | null;
  onMarkRead: (id: string) => void;
  onClose: () => void;
}) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
        {title}
      </h3>
      <ul className="space-y-3">
        {items.map((n) => (
          <li key={n.id}>
            <NotificationCard
              item={n}
              markingId={markingId}
              onMarkRead={onMarkRead}
              onClose={onClose}
            />
          </li>
        ))}
      </ul>
    </section>
  );
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

  const { paymentReminders, connectionItems, sharedReminders, announcements } =
    useMemo(() => {
    const paymentReminders: BellNotification[] = [];
    const connectionItems: BellNotification[] = [];
    const sharedReminders: BellNotification[] = [];
    const announcements: BellNotification[] = [];
    for (const item of items) {
      if (item.source === "recurring") paymentReminders.push(item);
      else if (item.source === "connection") connectionItems.push(item);
      else if (item.source === "shared_reminder") sharedReminders.push(item);
      else announcements.push(item);
    }
    return { paymentReminders, connectionItems, sharedReminders, announcements };
  }, [items]);

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
              <p className="py-8 text-center text-sm text-text-muted">Loading…</p>
            )}

            {!loading && items.length === 0 && (
              <div className="py-8 text-center text-sm text-text-muted">
                <p>No new notifications.</p>
                <ForwardLink
                  href="/settings/announcements"
                  onClick={onClose}
                  className="mt-3 hover:underline"
                >
                  See past announcements
                </ForwardLink>
              </div>
            )}

            {error && (
              <p className="mb-3 text-sm text-danger" role="alert">
                {error}
              </p>
            )}

            <div className="space-y-5">
              <NotificationSection
                title="Connection requests"
                items={connectionItems}
                markingId={markingId}
                onMarkRead={onMarkRead}
                onClose={onClose}
              />
              <NotificationSection
                title="Follow-Ups"
                items={sharedReminders}
                markingId={markingId}
                onMarkRead={onMarkRead}
                onClose={onClose}
              />
              <NotificationSection
                title="Payment reminders"
                items={paymentReminders}
                markingId={markingId}
                onMarkRead={onMarkRead}
                onClose={onClose}
              />
              <NotificationSection
                title="Announcements"
                items={announcements}
                markingId={markingId}
                onMarkRead={onMarkRead}
                onClose={onClose}
              />
            </div>

            {!loading && items.length > 0 && announcements.length === 0 ? (
              <ForwardLink
                href="/settings/announcements"
                onClick={onClose}
                className="mt-5 block text-center text-xs text-text-muted hover:underline"
              >
                See past announcements
              </ForwardLink>
            ) : null}
          </div>
        </Card>
      </div>
    </div>,
    document.body,
  );
}
