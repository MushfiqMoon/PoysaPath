import { NotificationHistory } from "@/components/notification-history";
import { PageHeader } from "@/components/page-header";
import { getReadNotifications } from "@/lib/data/notifications";

export default async function SettingsNotificationHistoryPage() {
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
