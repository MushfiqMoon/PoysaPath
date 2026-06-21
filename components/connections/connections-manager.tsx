"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiMaximize2, FiMinimize2 } from "react-icons/fi";

import {
  acceptConnectionRequestAction,
  cancelConnectionRequestAction,
  declineConnectionRequestAction,
  removeConnectionAction,
  searchConnectionByEmailAction,
  sendConnectionRequestAction,
} from "@/app/(app)/actions/connections";
import {
  completeSharedReminderAction,
  createSharedReminderAction,
} from "@/app/(app)/actions/shared-reminders";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { connectionDisplayName } from "@/lib/connections/labels";
import { formatDateTimeDhaka, formatRelativeDay } from "@/lib/format";
import type {
  ConnectedContact,
  ConnectionRequest,
  ConnectionSearchResult,
  SharedReminder,
} from "@/lib/types";

type ConnectionsManagerProps = {
  currentUserId: string;
  incoming: ConnectionRequest[];
  outgoing: ConnectionRequest[];
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

export function ConnectionsManager({
  currentUserId,
  incoming,
  outgoing,
  contacts,
  reminders,
}: ConnectionsManagerProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<ConnectionSearchResult | null>(
    null,
  );
  const [searchedEmail, setSearchedEmail] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [disconnectTarget, setDisconnectTarget] = useState<ConnectedContact | null>(
    null,
  );
  const [disconnectLoading, setDisconnectLoading] = useState(false);

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

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchLoading(true);
    setInviteError(null);
    setSearchResult(null);
    setSearchedEmail(null);
    try {
      const result = await searchConnectionByEmailAction(email);
      setSearchedEmail(email.trim().toLowerCase());
      setSearchResult(result);
      if (!result) {
        setInviteError("No PoysaPath account found with that email.");
      }
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Could not search");
    } finally {
      setSearchLoading(false);
    }
  }

  async function handleSendRequest() {
    if (!searchResult?.canInvite) return;
    setInviteLoading(true);
    setInviteError(null);
    try {
      await sendConnectionRequestAction(searchResult.user.id);
      setEmail("");
      setSearchResult(null);
      setSearchedEmail(null);
      router.refresh();
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Could not send request");
    } finally {
      setInviteLoading(false);
    }
  }

  function handleEmailChange(value: string) {
    setEmail(value);
    if (searchedEmail && value.trim().toLowerCase() !== searchedEmail) {
      setSearchResult(null);
      setSearchedEmail(null);
      setInviteError(null);
    }
  }

  async function handleConnectionAction(
    id: string,
    action: "accept" | "decline" | "cancel",
  ) {
    setActionId(id);
    setInviteError(null);
    try {
      if (action === "accept") await acceptConnectionRequestAction(id);
      if (action === "decline") await declineConnectionRequestAction(id);
      if (action === "cancel") await cancelConnectionRequestAction(id);
      router.refresh();
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setActionId(null);
    }
  }

  async function handleDisconnect() {
    if (!disconnectTarget) return;
    setDisconnectLoading(true);
    try {
      await removeConnectionAction(disconnectTarget.user.id);
      setDisconnectTarget(null);
      router.refresh();
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Could not remove connection");
    } finally {
      setDisconnectLoading(false);
    }
  }

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
      <Card padding="md">
        <h2 className="font-semibold text-text">Find someone by email</h2>
        <p className="mt-1 text-sm text-text-muted">
          Search for the exact email they use on PoysaPath. If they have an account,
          you can send a connection request after you confirm their name.
        </p>
        <form onSubmit={handleSearch} className="mt-4 space-y-3">
          <div>
            <Label htmlFor="connection-email">Email address</Label>
            <Input
              id="connection-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="friend@example.com"
              required
            />
          </div>
          {inviteError ? (
            <p className="text-sm text-danger" role="alert">
              {inviteError}
            </p>
          ) : null}
          <Button type="submit" fullWidth loading={searchLoading}>
            Search
          </Button>
        </form>

        {searchResult ? (
          <div className="mt-4 space-y-3 border-t border-border pt-4">
            <div className="flex items-center gap-3">
              <UserAvatar
                name={connectionDisplayName(searchResult.user)}
                avatarUrl={searchResult.user.avatar_url}
                size={40}
              />
              <div className="min-w-0">
                <p className="font-medium text-text">
                  {connectionDisplayName(searchResult.user)}
                </p>
                <p className="text-sm text-text-muted">{searchedEmail}</p>
              </div>
            </div>
            {searchResult.statusMessage ? (
              <p className="text-sm text-text-muted">{searchResult.statusMessage}</p>
            ) : null}
            <Button
              type="button"
              fullWidth
              loading={inviteLoading}
              disabled={!searchResult.canInvite}
              onClick={() => void handleSendRequest()}
            >
              Send connection request
            </Button>
          </div>
        ) : null}
      </Card>

      {(incoming.length > 0 || outgoing.length > 0) && (
        <section className="space-y-4">
          <h2 className="font-semibold text-text">Pending requests</h2>
          {incoming.map((request) => {
            const name = connectionDisplayName(request.other_user);
            return (
              <Card key={request.id} padding="sm" className="space-y-3">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    name={name}
                    avatarUrl={request.other_user.avatar_url}
                    size={36}
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-text">{name}</p>
                    <p className="text-sm text-text-muted">Wants to connect with you</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    fullWidth
                    loading={actionId === request.id}
                    onClick={() => void handleConnectionAction(request.id, "accept")}
                  >
                    Accept
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    fullWidth
                    disabled={actionId === request.id}
                    onClick={() => void handleConnectionAction(request.id, "decline")}
                  >
                    Decline
                  </Button>
                </div>
              </Card>
            );
          })}
          {outgoing.map((request) => {
            const name = connectionDisplayName(request.other_user);
            return (
              <Card key={request.id} padding="sm" className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <UserAvatar
                    name={name}
                    avatarUrl={request.other_user.avatar_url}
                    size={36}
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-text">{name}</p>
                    <p className="text-sm text-text-muted">Waiting for them to accept</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  loading={actionId === request.id}
                  onClick={() => void handleConnectionAction(request.id, "cancel")}
                >
                  Cancel
                </Button>
              </Card>
            );
          })}
        </section>
      )}

      <section className="space-y-4">
        <h2 className="font-semibold text-text">Connected people</h2>
        {contacts.length === 0 ? (
          <EmptyState
            title="No connections yet"
            description="Send an invite by email. Once they accept, you can share money reminders here."
          />
        ) : (
          contacts.map((contact) => {
            const name = connectionDisplayName(contact.user);
            return (
              <Card
                key={contact.connection_id}
                padding="sm"
                className="flex items-center justify-between gap-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <UserAvatar
                    name={name}
                    avatarUrl={contact.user.avatar_url}
                    size={36}
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-text">{name}</p>
                    <p className="text-sm text-text-muted">
                      Connected {formatDateTimeDhaka(contact.connected_at)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setDisconnectTarget(contact)}
                >
                  Remove
                </Button>
              </Card>
            );
          })
        )}
      </section>

      {contacts.length > 0 && (
        <>
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
                <span className="block font-semibold text-text">New shared reminder</span>
                <span className="mt-0.5 block text-sm text-text-muted">
                  Assign a money task to someone you are connected with.
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

          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold text-text">Open reminders</h2>
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
                title="No open reminders"
                description="Create a reminder for a connected person — they will see it here and in their bell."
              />
            ) : filteredReminders.length === 0 ? (
              <p className="text-sm text-text-muted">No reminders in this view.</p>
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
        </>
      )}

      <ConfirmDialog
        open={disconnectTarget !== null}
        title="Remove connection?"
        message="They will no longer see shared reminders with you. Open reminders between you will be cancelled."
        confirmLabel="Remove"
        loading={disconnectLoading}
        onConfirm={() => void handleDisconnect()}
        onCancel={() => setDisconnectTarget(null)}
      />
    </div>
  );
}
