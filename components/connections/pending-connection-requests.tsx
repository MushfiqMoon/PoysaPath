"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  acceptConnectionRequestAction,
  cancelConnectionRequestAction,
  declineConnectionRequestAction,
} from "@/app/(app)/actions/connections";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { connectionDisplayName } from "@/lib/connections/labels";
import type { ConnectionRequest } from "@/lib/types";

type PendingConnectionRequestsProps = {
  incoming: ConnectionRequest[];
  outgoing: ConnectionRequest[];
};

export function PendingConnectionRequests({
  incoming,
  outgoing,
}: PendingConnectionRequestsProps) {
  const router = useRouter();
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (incoming.length === 0 && outgoing.length === 0) {
    return null;
  }

  async function handleConnectionAction(
    id: string,
    action: "accept" | "decline" | "cancel",
  ) {
    setActionId(id);
    setError(null);
    try {
      if (action === "accept") await acceptConnectionRequestAction(id);
      if (action === "decline") await declineConnectionRequestAction(id);
      if (action === "cancel") await cancelConnectionRequestAction(id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setActionId(null);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="font-semibold text-text">Pending requests</h2>
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
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
  );
}
