"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const REFRESH_KEY = "poysapath-insight-refresh-at";
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

type InsightCardProps = {
  initialInsight: string | null;
};

function msUntilRefreshAllowed(): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(REFRESH_KEY);
  if (!raw) return 0;
  const next = Number(raw);
  if (Number.isNaN(next)) return 0;
  return Math.max(0, next - Date.now());
}

function markRefresh() {
  localStorage.setItem(REFRESH_KEY, String(Date.now() + COOLDOWN_MS));
}

export function InsightCard({ initialInsight }: InsightCardProps) {
  const [insight, setInsight] = useState<string | null>(initialInsight);
  const [loading, setLoading] = useState(!initialInsight);
  const [error, setError] = useState<string | null>(null);
  const [cooldownMs, setCooldownMs] = useState(0);

  useEffect(() => {
    setCooldownMs(msUntilRefreshAllowed());
  }, []);

  const fetchInsight = useCallback(async (refresh = false) => {
    if (refresh && msUntilRefreshAllowed() > 0) {
      setCooldownMs(msUntilRefreshAllowed());
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const url = refresh
        ? "/api/gemini/weekly-insight?refresh=1"
        : "/api/gemini/weekly-insight";
      const res = await fetch(url, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        if (data.insight) setInsight(data.insight);
        if (data.retryAfterSeconds) {
          const until = Date.now() + data.retryAfterSeconds * 1000;
          localStorage.setItem(REFRESH_KEY, String(until));
          setCooldownMs(until - Date.now());
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
  }, []);

  useEffect(() => {
    if (!initialInsight) {
      fetchInsight(false);
    }
  }, [initialInsight, fetchInsight]);

  const refreshDisabled = cooldownMs > 0;
  const cooldownHours = Math.ceil(cooldownMs / (60 * 60 * 1000));

  if (loading) {
    return (
      <section className="rounded-xl border border-border bg-surface p-4 animate-pulse">
        <p className="text-sm text-text-muted">Loading weekly insight…</p>
      </section>
    );
  }

  if (error && !insight) {
    return null;
  }

  if (!insight) {
    return null;
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm font-medium text-text-muted">Weekly insight</h2>
        <Button
          type="button"
          variant="ghost"
          className="min-h-8 px-2 py-1 text-xs"
          disabled={refreshDisabled}
          onClick={() => fetchInsight(true)}
          aria-label={
            refreshDisabled
              ? `Refresh available in about ${cooldownHours} hours`
              : "Refresh weekly insight"
          }
        >
          {refreshDisabled ? `Refresh in ~${cooldownHours}h` : "Refresh"}
        </Button>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-text">{insight}</p>
    </section>
  );
}
