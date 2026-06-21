import { PageHeader } from "@/components/layout/page-header";
import { ConnectionsManager } from "@/components/connections/connections-manager";
import { getAuthUser } from "@/lib/auth/session";
import {
  getConnectedContacts,
  getPendingIncomingRequests,
  getPendingOutgoingRequests,
} from "@/lib/data/connections";
import { getOpenSharedReminders } from "@/lib/data/shared-reminders";

export default async function ConnectionsSettingsPage() {
  const user = await getAuthUser();
  const [incoming, outgoing, contacts, reminders] = await Promise.all([
    getPendingIncomingRequests(),
    getPendingOutgoingRequests(),
    getConnectedContacts(),
    getOpenSharedReminders(),
  ]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Connections"
        backHref="/settings"
        backLabel="Settings"
        description="Invite by email and send shared money reminders to people you trust."
      />
      <ConnectionsManager
        currentUserId={user?.id ?? ""}
        incoming={incoming}
        outgoing={outgoing}
        contacts={contacts}
        reminders={reminders}
      />
    </div>
  );
}
