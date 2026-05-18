import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { SettingsPanel } from "@/components/settings-panel";
import { getAuthUser } from "@/lib/auth/session";
import { getGeminiKeyStatus } from "@/lib/data/gemini-credentials";
import { createClient } from "@/lib/supabase/server";

const menuLinks = [
  { href: "/categories", label: "Categories", desc: "Manage expense categories" },
  { href: "/budgets", label: "Budgets", desc: "Monthly limits per category" },
];

export default async function SettingsPage() {
  const user = await getAuthUser();
  const supabase = await createClient();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  const geminiStatus = user
    ? await getGeminiKeyStatus(user.id)
    : { hasKey: false, keyHint: null };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" backHref="/dashboard" backLabel="← Home" />

      <nav className="grid gap-2">
        {menuLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-accent/40"
          >
            <p className="font-medium text-text">{item.label}</p>
            <p className="text-sm text-text-muted">{item.desc}</p>
          </Link>
        ))}
      </nav>

      <SettingsPanel
        email={user?.email ?? ""}
        displayName={profile?.display_name ?? null}
        hasGeminiKey={geminiStatus.hasKey}
        keyHint={geminiStatus.keyHint}
      />
    </div>
  );
}
