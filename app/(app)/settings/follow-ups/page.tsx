import { SharedRemindersManager } from "@/components/connections/shared-reminders-manager";
import { PageHeader } from "@/components/layout/page-header";
import { getAuthUser } from "@/lib/auth/session";
import { getConnectedContacts } from "@/lib/data/connections";
import { getOpenSharedReminders } from "@/lib/data/shared-reminders";

export default async function FollowUpsSettingsPage() {
  const user = await getAuthUser();
  const [contacts, reminders] = await Promise.all([
    getConnectedContacts(),
    getOpenSharedReminders(),
  ]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Follow-Ups"
        backHref="/settings"
        backLabel="Settings"
        description="Nudge people you trust about money tasks — rent shares, repayments, and the rest."
      />
      <SharedRemindersManager
        currentUserId={user?.id ?? ""}
        contacts={contacts}
        reminders={reminders}
      />
    </div>
  );
}
