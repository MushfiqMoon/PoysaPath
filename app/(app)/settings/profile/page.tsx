import { ConnectionsPanel } from "@/components/connections/connections-panel";
import { PendingConnectionRequests } from "@/components/connections/pending-connection-requests";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { getAuthUser, getUserProfile } from "@/lib/auth/session";
import {
  getConnectedContacts,
  getPendingIncomingRequests,
  getPendingOutgoingRequests,
} from "@/lib/data/connections";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsProfilePage() {
  const [user, userProfile, incoming, outgoing, contacts] = await Promise.all([
    getAuthUser(),
    getUserProfile(),
    getPendingIncomingRequests(),
    getPendingOutgoingRequests(),
    getConnectedContacts(),
  ]);
  const supabase = await createClient();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Profile"
        backHref="/settings"
        backLabel="Settings"
      />
      <PendingConnectionRequests incoming={incoming} outgoing={outgoing} />
      <ProfileSettings
        email={user?.email ?? ""}
        displayName={profile?.display_name ?? null}
        avatarUrl={profile?.avatar_url ?? userProfile?.avatarUrl ?? null}
      />
      <ConnectionsPanel contacts={contacts} />
    </div>
  );
}
