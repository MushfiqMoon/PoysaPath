"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { KindPillTabs } from "@/components/shared/kind-pill-tabs";
import type { CategoryKind } from "@/lib/types";

const TAB_STORAGE_KEY = "poysapath-history-tab";

type HistoryKindTabsProps = {
  activeTab: CategoryKind;
};

export function HistoryKindTabs({ activeTab }: HistoryKindTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function selectTab(next: CategoryKind) {
    if (next === activeTab) return;

    const params = new URLSearchParams(searchParams.toString());
    if (next === "expense") {
      params.delete("tab");
    } else {
      params.set("tab", "income");
    }
    params.delete("category");

    try {
      localStorage.setItem(TAB_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }

    const query = params.toString();
    router.push(query ? `/history?${query}` : "/history");
  }

  return (
    <KindPillTabs
      value={activeTab}
      onChange={selectTab}
      ariaLabel="History type"
    />
  );
}
