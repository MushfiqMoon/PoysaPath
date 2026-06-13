import { SettingsMenuSection } from "@/components/settings/settings-menu-section";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { getIsSuperAdmin } from "@/lib/auth/admin";
import { getAuthUser } from "@/lib/auth/session";
import { getGeminiKeyStatus } from "@/lib/data/gemini-credentials";

export default async function SettingsPage() {
  const user = await getAuthUser();

  const [geminiStatus, isSuperAdmin] = await Promise.all([
    user
      ? getGeminiKeyStatus(user.id)
      : Promise.resolve({ hasKey: false, keyHint: null }),
    getIsSuperAdmin(),
  ]);

  return (
    <div className="space-y-4">
      <SettingsMenuSection showAdminLink={isSuperAdmin} />

      <SettingsPanel
        hasGeminiKey={geminiStatus.hasKey}
        keyHint={geminiStatus.keyHint}
      />
    </div>
  );
}
