"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  removeConnectionAction,
  searchConnectionByEmailAction,
  sendConnectionRequestAction,
} from "@/app/(app)/actions/connections";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { connectionDisplayName } from "@/lib/connections/labels";
import { formatDateTimeDhaka } from "@/lib/format";
import type {
  ConnectedContact,
  ConnectionSearchResult,
} from "@/lib/types";

type ConnectionsPanelProps = {
  contacts: ConnectedContact[];
};

export function ConnectionsPanel({ contacts }: ConnectionsPanelProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<ConnectionSearchResult | null>(
    null,
  );
  const [searchedEmail, setSearchedEmail] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [disconnectTarget, setDisconnectTarget] = useState<ConnectedContact | null>(
    null,
  );
  const [disconnectLoading, setDisconnectLoading] = useState(false);

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-text">Connections</h2>
        <p className="mt-1 text-sm text-text-muted">
          Invite by email. Once they accept, you can send Follow-Ups.
        </p>
      </div>

      <Card padding="md">
        <h3 className="font-semibold text-text">Find someone by email</h3>
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

      <section className="space-y-4">
        <h3 className="font-semibold text-text">Connected people</h3>
        {contacts.length === 0 ? (
          <EmptyState
            title="No connections yet"
            description="Send an invite by email. Once they accept, you can send Follow-Ups."
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

      <ConfirmDialog
        open={disconnectTarget !== null}
        title="Remove connection?"
        message="They will no longer see Follow-Ups with you. Open follow-ups between you will be cancelled."
        confirmLabel="Remove"
        loading={disconnectLoading}
        onConfirm={() => void handleDisconnect()}
        onCancel={() => setDisconnectTarget(null)}
      />
    </div>
  );
}
