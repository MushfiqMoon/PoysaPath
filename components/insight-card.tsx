"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { AiDisabledNotice } from "@/components/ai-disabled-notice";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { INSIGHT_REFRESH_COOLDOWN_MS } from "@/lib/constants";
import { isGeminiKeyRequiredResponse } from "@/lib/gemini/disabled-message";
import { AI_LABELS } from "@/lib/gemini/labels";

/** Bumped when cooldown changed 24h → 4h so old localStorage entries are ignored. */
const REFRESH_KEY = "poysapath-insight-refresh-at-v2";

type InsightCardProps = {
  hasGeminiKey: boolean;
  initialInsight: string | null;
};

function msUntilRefreshAllowed(): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(REFRESH_KEY);
  if (!raw) return 0;
  const next = Number(raw);
  if (Number.isNaN(next)) {
    localStorage.removeItem(REFRESH_KEY);
    return 0;
  }
  const remaining = Math.max(0, next - Date.now());
  if (remaining > INSIGHT_REFRESH_COOLDOWN_MS) {
    localStorage.removeItem(REFRESH_KEY);
    return 0;
  }
  return remaining;
}

function markRefresh() {
  localStorage.setItem(
    REFRESH_KEY,
    String(Date.now() + INSIGHT_REFRESH_COOLDOWN_MS),
  );
}

export function InsightCard({ hasGeminiKey, initialInsight }: InsightCardProps) {
  const [insight, setInsight] = useState<string | null>(initialInsight);
  const [loading, setLoading] = useState(hasGeminiKey && !initialInsight);
  const [keyRequired, setKeyRequired] = useState(!hasGeminiKey);
  const [error, setError] = useState<string | null>(null);
  const [cooldownMs, setCooldownMs] = useState(() => msUntilRefreshAllowed());

  const fetchInsight = useCallback(async (refresh = false) => {
    if (!hasGeminiKey) {
      setKeyRequired(true);
      setLoading(false);
      return;
    }

    if (refresh && msUntilRefreshAllowed() > 0) {
      setCooldownMs(msUntilRefreshAllowed());
      return;
    }

    setLoading(true);
    setError(null);
    setKeyRequired(false);
    try {
      const url = refresh
        ? "/api/gemini/weekly-insight?refresh=1"
        : "/api/gemini/weekly-insight";
      const res = await fetch(url, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        if (isGeminiKeyRequiredResponse(data)) {
          setKeyRequired(true);
          setInsight(null);
          return;
        }
        if (data.insight) setInsight(data.insight);
        if (data.retryAfterSeconds) {
          const waitMs = Math.min(
            data.retryAfterSeconds * 1000,
            INSIGHT_REFRESH_COOLDOWN_MS,
          );
          const until = Date.now() + waitMs;
          localStorage.setItem(REFRESH_KEY, String(until));
          setCooldownMs(waitMs);
        }
        setError(data.error ?? "Insight unavailable");
        return;
      }

      if (data.insight) {
        setInsight(data.insight);
        if (refresh) markRefresh();
        setCooldownMs(msUntilRefreshAllowed());
      } else {
        setInsight(null);
        setError(data.message ?? null);
      }
    } catch {
      setError("Could not load insight");
    } finally {
      setLoading(false);
    }
  }, [hasGeminiKey]);

  const initialFetchDone = useRef(false);

  useEffect(() => {
    setCooldownMs(msUntilRefreshAllowed());
  }, []);

  useEffect(() => {
    if (!hasGeminiKey || initialInsight || initialFetchDone.current) return;
    initialFetchDone.current = true;
    const id = window.setTimeout(() => {
      void fetchInsight(false);
    }, 0);
    return () => window.clearTimeout(id);
  }, [hasGeminiKey, initialInsight, fetchInsight]);

  const refreshDisabled = cooldownMs > 0;
  const cooldownHours = Math.max(
    1,
    Math.ceil(cooldownMs / (60 * 60 * 1000)),
  );

  if (keyRequired) {
    return (
      <section className="space-y-2">
        <h2 className="text-sm font-medium text-text-muted">
          {AI_LABELS.weeklyInsight}
        </h2>
        <AiDisabledNotice compact />
      </section>
    );
  }

  if (loading) {
    return <InsightCardSkeleton />;
  }

  if (error && !insight) {
    return (
      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="text-sm font-medium text-text-muted">
          {AI_LABELS.weeklyInsight}
        </h2>
        <p className="mt-2 text-sm text-text-muted">{error}</p>
      </section>
    );
  }

  if (!insight) {
    return null;
  }

  return (
    <section
      className="min-h-[7rem] rounded-xl border border-border bg-surface p-4"
      aria-labelledby="weekly-insight-heading"
    >
      <div className="flex items-start justify-between gap-3">
        <h2
          id="weekly-insight-heading"
          className="text-sm font-medium text-text-muted"
        >
          {AI_LABELS.weeklyInsight}
        </h2>
        <Button
          type="button"
          variant="ghost"
          className="min-h-8 px-2 py-1 text-xs"
          disabled={refreshDisabled}
          onClick={() => void fetchInsight(true)}
          aria-label={
            refreshDisabled
              ? `Refresh available in about ${cooldownHours} hours`
              : AI_LABELS.refreshInsight
          }
        >
          <span aria-hidden>
            {refreshDisabled ? `Refresh in ~${cooldownHours}h` : "Refresh"}
          </span>
          <span className="sr-only">{AI_LABELS.refreshInsight}</span>
        </Button>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-text">{insight}</p>
    </section>
  );
}

export function InsightCardSkeleton() {
  return (
    <section
      className="min-h-[7rem] rounded-xl border border-border bg-surface p-4"
      aria-busy="true"
      aria-label={AI_LABELS.loadingInsight}
    >
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>
      <div className="mt-3 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-[92%]" />
        <Skeleton className="h-3 w-[75%]" />
      </div>
    </section>
  );
}
