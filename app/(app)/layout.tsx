import { Suspense } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { CoinLoader } from "@/components/shared/coin-loader";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <Suspense fallback={<CoinLoader fullPage label="Loading…" />}>
        {children}
      </Suspense>
    </AppShell>
  );
}
