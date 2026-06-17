import { PageHeader } from "@/components/layout/page-header";
import { AiSettingsPanel } from "@/components/settings/ai-settings-panel";
import { getAuthUser } from "@/lib/auth/session";
import { getGeminiKeyStatus } from "@/lib/data/gemini-credentials";
import { AI_LABELS } from "@/lib/gemini/labels";

export default async function SettingsAiPage() {
  const user = await getAuthUser();
  const geminiStatus = user
    ? await getGeminiKeyStatus(user.id)
    : { hasKey: false, keyHint: null };

  return (
    <div className="space-y-4">
      <PageHeader
        title={AI_LABELS.settingsSection}
        backHref="/settings"
        backLabel="Settings"
      />
      <AiSettingsPanel
        hasGeminiKey={geminiStatus.hasKey}
        keyHint={geminiStatus.keyHint}
      />
    </div>
  );
}
