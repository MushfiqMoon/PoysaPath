import { PageHeader } from "@/components/layout/page-header";
import { NotificationHistory } from "@/components/notifications/notification-history";
import { getReadNotifications } from "@/lib/data/notifications";

export default async function SettingsAnnouncementsPage() {
  const readNotifications = await getReadNotifications();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Past announcements"
        backHref="/settings"
        backLabel="Settings"
      />
      <NotificationHistory items={readNotifications} />
    </div>
  );
}
