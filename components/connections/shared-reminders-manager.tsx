"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiMaximize2, FiMinimize2 } from "react-icons/fi";

import {
  completeSharedReminderAction,
  createSharedReminderAction,
} from "@/app/(app)/actions/shared-reminders";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { connectionDisplayName } from "@/lib/connections/labels";
import { formatDateTimeDhaka, formatRelativeDay } from "@/lib/format";
import type { ConnectedContact, SharedReminder } from "@/lib/types";

type SharedRemindersManagerProps = {
  currentUserId: string;
  contacts: ConnectedContact[];
  reminders: SharedReminder[];
};

type ReminderTab = "all" | "sent" | "received";

function formatDueAt(dueAt: string | null) {
  if (!dueAt) return "";
  const ymd = dueAt.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
    return formatRelativeDay(ymd);
  }
  return formatDateTimeDhaka(dueAt);
}

export function SharedRemindersManager({
  currentUserId,
  contacts,
  reminders,
}: SharedRemindersManagerProps) {
  const router = useRouter();
  const [actionId, setActionId] = useState<string | null>(null);
  const [reminderTab, setReminderTab] = useState<ReminderTab>("all");
  const [assigneeId, setAssigneeId] = useState("");
  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderNote, setReminderNote] = useState("");
  const [reminderDueDate, setReminderDueDate] = useState("");
  const [reminderLoading, setReminderLoading] = useState(false);
  const [reminderError, setReminderError] = useState<string | null>(null);
  const [isReminderFormOpen, setIsReminderFormOpen] = useState(false);

  const selectedAssigneeId =
    assigneeId && contacts.some((c) => c.user.id === assigneeId)
      ? assigneeId
      : (contacts[0]?.user.id ?? "");

  const filteredReminders = reminders.filter((r) => {
    if (reminderTab === "all") return true;
    if (reminderTab === "sent") return r.creator_id === currentUserId;
    return r.assignee_id === currentUserId;
  });

  async function handleCreateReminder(e: React.FormEvent) {
    e.preventDefault();
    setReminderLoading(true);
    setReminderError(null);
    try {
      await createSharedReminderAction({
        assignee_id: selectedAssigneeId,
        title: reminderTitle,
        note: reminderNote || null,
        due_at: reminderDueDate || null,
      });
      setReminderTitle("");
      setReminderNote("");
      setReminderDueDate("");
      setIsReminderFormOpen(false);
      router.refresh();
    } catch (err) {
      setReminderError(err instanceof Error ? err.message : "Could not create reminder");
    } finally {
      setReminderLoading(false);
    }
  }

  async function handleCompleteReminder(id: string) {
    setActionId(id);
    setReminderError(null);
    try {
      await completeSharedReminderAction(id);
      router.refresh();
    } catch (err) {
      setReminderError(err instanceof Error ? err.message : "Could not complete reminder");
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="space-y-6">
      {contacts.length === 0 ? (
        <EmptyState
          title="Connect with someone first"
          description="Add a connection in Profile before you can send Follow-Ups."
          actionLabel="Go to Profile"
          actionHref="/settings/profile"
        />
      ) : (
        <Card padding="none" className="overflow-hidden">
          <button
            type="button"
            aria-expanded={isReminderFormOpen}
            aria-controls="shared-reminder-form"
            disabled={reminderLoading}
            onClick={() => {
              setReminderError(null);
              setIsReminderFormOpen((open) => !open);
            }}
            className="group flex w-full cursor-pointer items-center justify-between gap-3 p-4 text-left transition-[background-color] duration-(--dur-short) hover:bg-accent/6 active:bg-accent/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="min-w-0">
              <span className="block font-semibold text-text">Send a reminder 📌</span>
              <span className="mt-0.5 block text-sm text-text-muted">
                For the things people swear they won&apos;t forget.
              </span>
            </span>
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-lg font-semibold text-accent transition-colors group-hover:bg-accent/18"
              aria-hidden
            >
              {isReminderFormOpen ? (
                <FiMinimize2 className="h-4 w-4" />
              ) : (
                <FiMaximize2 className="h-4 w-4" />
              )}
            </span>
          </button>
          {isReminderFormOpen && (
            <form
              id="shared-reminder-form"
              onSubmit={handleCreateReminder}
              className="space-y-3 border-t border-border p-4"
            >
              <div>
                <Label htmlFor="reminder-assignee">Send to</Label>
                <select
                  id="reminder-assignee"
                  value={selectedAssigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-text"
                  required
                >
                  {contacts.map((c) => (
                    <option key={c.user.id} value={c.user.id}>
                      {connectionDisplayName(c.user)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="reminder-title">Title</Label>
                <Input
                  id="reminder-title"
                  value={reminderTitle}
                  onChange={(e) => setReminderTitle(e.target.value)}
                  placeholder="Pay rent share by the 5th"
                  required
                />
              </div>
              <div>
                <Label htmlFor="reminder-note">Note (optional)</Label>
                <Input
                  id="reminder-note"
                  value={reminderNote}
                  onChange={(e) => setReminderNote(e.target.value)}
                  placeholder="Send via bKash"
                />
              </div>
              <div>
                <Label htmlFor="reminder-due">Due date (optional)</Label>
                <Input
                  id="reminder-due"
                  type="date"
                  value={reminderDueDate}
                  onChange={(e) => setReminderDueDate(e.target.value)}
                />
              </div>
              {reminderError ? (
                <p className="text-sm text-danger" role="alert">
                  {reminderError}
                </p>
              ) : null}
              <Button type="submit" fullWidth loading={reminderLoading}>
                Create reminder
              </Button>
            </form>
          )}
        </Card>
      )}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold text-text">Open follow-ups</h2>
          <div className="flex gap-1 rounded-xl bg-surface p-1 ring-1 ring-border">
            {(["all", "sent", "received"] as ReminderTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setReminderTab(tab)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  reminderTab === tab
                    ? "bg-accent text-white"
                    : "text-text-muted hover:text-text"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        {reminders.length === 0 ? (
          <EmptyState
            title="No open follow-ups"
            description="Create a follow-up for a connected person — they will see it here and in their bell."
          />
        ) : filteredReminders.length === 0 ? (
          <p className="text-sm text-text-muted">No follow-ups in this view.</p>
        ) : (
          <ul className="space-y-3">
            {filteredReminders.map((reminder) => {
              const fromName = connectionDisplayName(reminder.creator);
              const toName = connectionDisplayName(reminder.assignee);

              return (
                <li key={reminder.id}>
                  <Card padding="sm" className="space-y-2">
                    <p className="font-medium text-text">{reminder.title}</p>
                    {reminder.note ? (
                      <p className="text-sm text-text-muted">{reminder.note}</p>
                    ) : null}
                    <p className="text-xs text-text-muted">
                      From {fromName} → {toName}
                      {reminder.due_at
                        ? ` · Due ${formatDueAt(reminder.due_at)}`
                        : ""}
                    </p>
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full"
                      loading={actionId === reminder.id}
                      onClick={() => void handleCompleteReminder(reminder.id)}
                    >
                      Mark done
                    </Button>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
