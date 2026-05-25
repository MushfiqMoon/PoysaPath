import { PageHeader } from "@/components/layout/page-header";
import { SettingsMenu } from "@/components/settings/settings-menu";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { getAuthUser } from "@/lib/auth/session";
import { getGeminiKeyStatus } from "@/lib/data/gemini-credentials";

export default async function SettingsPage() {
  const user = await getAuthUser();

  const geminiStatus = user
    ? await getGeminiKeyStatus(user.id)
    : { hasKey: false, keyHint: null };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" backHref="/dashboard" backLabel="Home" />

      <SettingsMenu />

      <SettingsPanel
        hasGeminiKey={geminiStatus.hasKey}
        keyHint={geminiStatus.keyHint}
      />
    </div>
  );
}
