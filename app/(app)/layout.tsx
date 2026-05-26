import { Suspense } from "react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { CoinLoader } from "@/components/shared/coin-loader";
import { getAuthUser } from "@/lib/auth/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell>
      <Suspense fallback={<CoinLoader fullPage label="Loading…" />}>
        {children}
      </Suspense>
    </AppShell>
  );
}
