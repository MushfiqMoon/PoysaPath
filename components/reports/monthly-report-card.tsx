"use client";

import { useState } from "react";

import { AiDisabledNotice } from "@/components/shared/ai-disabled-notice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { isGeminiKeyRequiredResponse } from "@/lib/gemini/disabled-message";

type MonthlyReportCardProps = {
  hasGeminiKey: boolean;
};

export function MonthlyReportCard({ hasGeminiKey }: MonthlyReportCardProps) {
  const [report, setReport] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [keyRequired, setKeyRequired] = useState(!hasGeminiKey);

  async function generateReport() {
    if (!hasGeminiKey) {
      setKeyRequired(true);
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    setKeyRequired(false);
    try {
      const res = await fetch("/api/gemini/monthly-report", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        if (isGeminiKeyRequiredResponse(data)) {
          setKeyRequired(true);
          setReport(null);
          return;
        }
        setError(data.error ?? "Could not generate monthly report.");
        return;
      }
      setReport(data.report ?? null);
      setMessage(data.message ?? null);
    } catch {
      setError("Network error. Try again later.");
    } finally {
      setLoading(false);
    }
  }

  if (keyRequired) {
    return <AiDisabledNotice />;
  }

  return (
    <Card elevated padding="md" className="space-y-4">
      <div>
        <h2 className="font-semibold tracking-tight text-text">Monthly AI report</h2>
        <p className="mt-1 text-sm leading-relaxed text-text-muted">
          Generate a short report with wins, problem areas, category changes,
          and a next-month plan.
        </p>
      </div>

      <Button type="button" onClick={() => void generateReport()} loading={loading}>
        Generate report
      </Button>

      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      {message ? <p className="text-sm text-text-muted">{message}</p> : null}

      {report ? (
        <div className="whitespace-pre-line rounded-2xl bg-bg px-4 py-3 text-sm leading-relaxed text-text">
          {report}
        </div>
      ) : null}
    </Card>
  );
}
