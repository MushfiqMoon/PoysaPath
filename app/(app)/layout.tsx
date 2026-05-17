import { Suspense } from "react";

import { AppShell } from "@/components/app-shell";
import { CoinLoader } from "@/components/coin-loader";

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
