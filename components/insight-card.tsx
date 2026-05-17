"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type InsightCardProps = {
  initialInsight: string | null;
};

export function InsightCard({ initialInsight }: InsightCardProps) {
  const [insight, setInsight] = useState<string | null>(initialInsight);
  const [loading, setLoading] = useState(!initialInsight);
  const [error, setError] = useState<string | null>(null);

  const fetchInsight = useCallback(async (refresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const url = refresh
        ? "/api/gemini/weekly-insight?refresh=1"
        : "/api/gemini/weekly-insight";
      const res = await fetch(url, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Insight unavailable");
        setInsight(null);
        return;
      }

      if (data.insight) {
        setInsight(data.insight);
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
          onClick={() => fetchInsight(true)}
        >
          Refresh
        </Button>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-text">{insight}</p>
    </section>
  );
}
