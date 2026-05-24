import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { SettingsPanel } from "@/components/settings-panel";
import { Card } from "@/components/ui/card";
import { getAuthUser } from "@/lib/auth/session";
import { getGeminiKeyStatus } from "@/lib/data/gemini-credentials";
import { createClient } from "@/lib/supabase/server";

const menuLinks = [
  {
    href: "/settings/categories",
    label: "Categories",
    desc: "Manage expense categories",
  },
  {
    href: "/settings/budget",
    label: "Budgets",
    desc: "Monthly limits per category",
  },
  {
    href: "/settings/notification-history",
    label: "Announcements",
    desc: "Updates you have already read",
  },
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
      <PageHeader title="Settings" backHref="/dashboard" backLabel="Home" />

      <nav className="grid gap-2">
        {menuLinks.map((item) => (
          <Link key={item.href} href={item.href} className="block">
            <Card
              padding="md"
              className="transition-[border-color,box-shadow] duration-[var(--dur-short)] hover:border-accent/40 hover:shadow-sm"
            >
              <p className="font-semibold text-text">{item.label}</p>
              <p className="mt-0.5 text-sm text-text-muted">{item.desc}</p>
            </Card>
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
