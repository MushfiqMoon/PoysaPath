import { SettingsMenuSection } from "@/components/settings/settings-menu-section";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { getIsSuperAdmin } from "@/lib/auth/admin";

export default async function SettingsPage() {
  const isSuperAdmin = await getIsSuperAdmin();

  return (
    <div className="space-y-4">
      <SettingsMenuSection showAdminLink={isSuperAdmin} />
      <SettingsPanel />
    </div>
  );
}
