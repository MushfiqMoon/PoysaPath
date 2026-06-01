import { redirect } from "next/navigation";

import { AdminOverview } from "@/components/settings/admin-overview";
import { PageHeader } from "@/components/layout/page-header";
import {
  getAdminStats,
  getAdminUserList,
  getIsSuperAdmin,
} from "@/lib/auth/admin";

export default async function AdminSettingsPage() {
  const isSuperAdmin = await getIsSuperAdmin();

  if (!isSuperAdmin) {
    redirect("/settings");
  }

  const [stats, users] = await Promise.all([
    getAdminStats(),
    getAdminUserList(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin"
        backHref="/settings"
        backLabel="Settings"
      />
      <AdminOverview stats={stats} users={users} />
    </div>
  );
}
