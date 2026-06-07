"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FiMaximize2, FiMinimize2 } from "react-icons/fi";

import {
  deleteMonthlyReport,
  saveGeneratedMonthlyReport,
  saveMonthlyReportLanguage,
} from "@/app/(app)/actions/monthly-reports";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { AiDisabledNotice } from "@/components/shared/ai-disabled-notice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { MonthlyReportLanguage } from "@/lib/monthly-report-language";
import { MONTHLY_REPORT_LANGUAGES } from "@/lib/monthly-report-language";
import {
  addMonthsToMonthStart,
  formatMonthStartDisplay,
  monthStartToParam,
} from "@/lib/dates";
import { isGeminiKeyRequiredResponse } from "@/lib/gemini/disabled-message";
import type {
  MonthlyReport,
  MonthlyReportCashFlowMetrics,
} from "@/lib/gemini/schemas";
import { formatCurrency } from "@/lib/format";

type MonthlyReportCardProps = {
  hasGeminiKey: boolean;
  currentMonth: string;
  initialLanguage: MonthlyReportLanguage;
  initialSavedReports: SavedMonthlyReport[];
};

type MonthlyReportApiResponse = {
  code?: string;
  report: MonthlyReport | null;
  content: string | null;
  month?: string;
  language?: MonthlyReportLanguage;
  generatedAt?: string;
  source?: "generated" | "missing";
  message?: string;
  error?: string;
  cashFlow?: {
    current: MonthlyReportCashFlowMetrics;
    previous: MonthlyReportCashFlowMetrics;
  };
};

type CashFlowPeriodMetrics = MonthlyReportCashFlowMetrics;

type SavedMonthlyReport = {
  id: string;
  reportMonth: string;
  language: MonthlyReportLanguage;
  content: string;
  generatedAt: string;
  createdAt: string;
  report: MonthlyReport | null;
};

type SavedMonthlyReportRecord = {
  id: string;
  report_month: string;
  language: MonthlyReportLanguage;
  content: string;
  generated_at: string;
  created_at: string;
};

function getReportLabels(language: MonthlyReportLanguage) {
  return language === "bn"
    ? {
        wins: "ভালো দিক",
        watchouts: "খেয়াল রাখুন",
        categoryChanges: "ক্যাটাগরি পরিবর্তন",
        nextMonthPlan: "আগামী মাসের পরিকল্পনা",
        cashFlow: "আয়–খরচ সারাংশ",
        income: "আয়",
        expenses: "খরচ",
        saved: "সঞ্চয়",
        savingsRate: "সঞ্চয় হার",
        generated: "তৈরি হয়েছে",
        savedLabel: "সংরক্ষিত",
      }
    : {
        wins: "Wins",
        watchouts: "Watchouts",
        categoryChanges: "Category changes",
        nextMonthPlan: "Next-month plan",
        cashFlow: "Cash flow",
        income: "Income",
        expenses: "Expenses",
        saved: "Saved",
        savingsRate: "Savings rate",
        generated: "Generated",
        savedLabel: "Saved",
      };
}

function getLanguageLabel(language: MonthlyReportLanguage) {
  return (
    MONTHLY_REPORT_LANGUAGES.find((option) => option.value === language)
      ?.label ?? "English"
  );
}

function formatGeneratedAt(value: string, language: MonthlyReportLanguage) {
  return new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function parseReportContent(content: string): MonthlyReport | null {
  try {
    return JSON.parse(content) as MonthlyReport;
  } catch {
    return null;
  }
}

function toSavedMonthlyReport(
  report: SavedMonthlyReportRecord,
): SavedMonthlyReport {
  return {
    id: report.id,
    reportMonth: report.report_month,
    language: report.language,
    content: report.content,
    generatedAt: report.generated_at,
    createdAt: report.created_at,
    report: parseReportContent(report.content),
  };
}

function sortSavedReports(reports: SavedMonthlyReport[]) {
  return [...reports].sort((a, b) => b.reportMonth.localeCompare(a.reportMonth));
}

function ReportSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <section className="space-y-2">
      <h4 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
        {title}
      </h4>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="flex gap-2">
            <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function formatSavingsRateDisplay(rate: number | null) {
  if (rate === null) return "—";
  return `${rate}%`;
}

function CashFlowMetricsBanner({
  metrics,
  labels,
}: {
  metrics: CashFlowPeriodMetrics;
  labels: ReturnType<typeof getReportLabels>;
}) {
  return (
    <div className="grid gap-3 rounded-2xl border border-border/70 bg-surface/50 p-4 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          {labels.income}
        </p>
        <p className="mt-1 text-lg font-semibold text-accent">
          {formatCurrency(metrics.incomeTotal)}
        </p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          {labels.expenses}
        </p>
        <p className="mt-1 text-lg font-semibold text-text">
          {formatCurrency(metrics.expenseTotal)}
        </p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          {labels.saved}
        </p>
        <p
          className={[
            "mt-1 text-lg font-semibold",
            metrics.saved >= 0 ? "text-accent" : "text-danger",
          ].join(" ")}
        >
          {formatCurrency(metrics.saved)}
        </p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          {labels.savingsRate}
        </p>
        <p className="mt-1 text-lg font-semibold text-text">
          {formatSavingsRateDisplay(metrics.savingsRatePercent)}
        </p>
      </div>
    </div>
  );
}

export function MonthlyReportCard({
  hasGeminiKey,
  currentMonth,
  initialLanguage,
  initialSavedReports,
}: MonthlyReportCardProps) {
  const router = useRouter();
  const [month, setMonth] = useState(currentMonth);
  const [language, setLanguage] =
    useState<MonthlyReportLanguage>(initialLanguage);
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [cashFlow, setCashFlow] = useState<
    MonthlyReportApiResponse["cashFlow"] | null
  >(null);
  const [savedReports, setSavedReports] =
    useState<SavedMonthlyReport[]>(initialSavedReports);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingReport, setSavingReport] = useState(false);
  const [savingPreference, setSavingPreference] = useState(false);
  const [deleteMonth, setDeleteMonth] = useState<string | null>(null);
  const [deletingReport, setDeletingReport] = useState(false);
  const [expandedReportIds, setExpandedReportIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [keyRequired, setKeyRequired] = useState(!hasGeminiKey);

  const monthOptions = useMemo(
    () => Array.from({ length: 12 }, (_, index) => addMonthsToMonthStart(currentMonth, -index)),
    [currentMonth],
  );
  const savedReportMonths = useMemo(
    () => new Set(savedReports.map((savedReport) => savedReport.reportMonth)),
    [savedReports],
  );
  const selectedMonthSaved = savedReportMonths.has(month);
  const reportLabels = getReportLabels(language);

  function clearLoadedReport() {
    setReport(null);
    setContent(null);
    setGeneratedAt(null);
    setCashFlow(null);
    setMessage(null);
    setError(null);
  }

  function applyResponse(data: MonthlyReportApiResponse) {
    setReport(data.report ?? null);
    setContent(data.content ?? null);
    setGeneratedAt(data.generatedAt ?? null);
    setCashFlow(data.cashFlow ?? null);
    setMessage(
      data.message ??
        (data.source === "generated"
          ? "Report generated. Save it to keep it."
          : null),
    );
  }

  async function requestReport({
    refresh = false,
  }: {
    refresh?: boolean;
  }) {
    setLoading(true);
    setError(null);
    setMessage(null);
    setKeyRequired(false);
    try {
      const res = await fetch("/api/gemini/monthly-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: monthStartToParam(month),
          language,
          refresh,
        }),
      });
      const data = (await res.json()) as MonthlyReportApiResponse;
      if (!res.ok) {
        if (isGeminiKeyRequiredResponse(data)) {
          setKeyRequired(true);
          return;
        }
        setError(data.error ?? "Could not generate monthly report.");
        return;
      }
      applyResponse(data);
    } catch {
      setError("Network error. Try again later.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLanguageChange(value: MonthlyReportLanguage) {
    setLanguage(value);
    clearLoadedReport();
    setSavingPreference(true);
    try {
      await saveMonthlyReportLanguage(value);
      setMessage("Report language preference saved.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save language preference.",
      );
    } finally {
      setSavingPreference(false);
    }
  }

  async function handleSaveReport() {
    if (!report || !content) return;

    if (selectedMonthSaved) {
      setError(
        `${formatMonthStartDisplay(month)} already has a saved report. Delete it before saving another.`,
      );
      return;
    }

    setSavingReport(true);
    setError(null);
    setMessage(null);
    try {
      const savedReport = await saveGeneratedMonthlyReport({
        reportMonth: month,
        language,
        content,
        generatedAt,
      });
      setSavedReports((current) =>
        sortSavedReports([...current, toSavedMonthlyReport(savedReport)]),
      );
      setExpandedReportIds((current) => new Set(current).add(savedReport.id));
      setMessage("Report saved.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save report.");
    } finally {
      setSavingReport(false);
    }
  }

  async function handleDeleteReport() {
    if (!deleteMonth) return;

    setDeletingReport(true);
    setError(null);
    setMessage(null);
    try {
      await deleteMonthlyReport(deleteMonth);
      setSavedReports((current) =>
        current.filter((savedReport) => savedReport.reportMonth !== deleteMonth),
      );
      setExpandedReportIds((current) => {
        const next = new Set(current);
        const deletedReport = savedReports.find(
          (savedReport) => savedReport.reportMonth === deleteMonth,
        );
        if (deletedReport) next.delete(deletedReport.id);
        return next;
      });
      setMessage("Saved report deleted.");
      setDeleteMonth(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete report.");
    } finally {
      setDeletingReport(false);
    }
  }

  function toggleSavedReport(reportId: string) {
    setExpandedReportIds((current) => {
      const next = new Set(current);
      if (next.has(reportId)) {
        next.delete(reportId);
      } else {
        next.add(reportId);
      }
      return next;
    });
  }

  return (
    <>
      <Card elevated padding="md" className="space-y-5">
      <div>
        <h2 className="font-semibold tracking-tight text-text">Monthly AI report</h2>
        <p className="mt-1 text-sm leading-relaxed text-text-muted">
          Save month-wise AI reports with income, spending, savings rate, wins,
          problem areas, category changes, and a next-month plan in English or
          Bangla.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="report-month">Report month</Label>
          <select
            id="report-month"
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              clearLoadedReport();
            }}
            className="min-h-11 w-full rounded-xl border border-border bg-surface px-3 py-2 text-base text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {monthOptions.map((option) => (
              <option key={option} value={option}>
                {formatMonthStartDisplay(option)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="report-language">Report language</Label>
          <select
            id="report-language"
            value={language}
            disabled={savingPreference}
            onChange={(e) =>
              void handleLanguageChange(e.target.value as MonthlyReportLanguage)
            }
            className="min-h-11 w-full rounded-xl border border-border bg-surface px-3 py-2 text-base text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {MONTHLY_REPORT_LANGUAGES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="secondary"
          onClick={() => void handleSaveReport()}
          loading={savingReport}
          disabled={!report || !content || selectedMonthSaved}
        >
          Save this report
        </Button>
        <Button
          type="button"
          onClick={() => void requestReport({ refresh: false })}
          loading={loading && !report}
          disabled={!hasGeminiKey}
        >
          Generate report
        </Button>
        {report || content ? (
          <Button
            type="button"
            variant="accentOutline"
            onClick={() => void requestReport({ refresh: true })}
            loading={loading}
            disabled={!hasGeminiKey}
          >
            Regenerate
          </Button>
        ) : null}
      </div>

      {selectedMonthSaved ? (
        <p className="text-sm text-text-muted">
          {formatMonthStartDisplay(month)} already has a saved report. Delete it before
          saving another.
        </p>
      ) : null}

      {keyRequired || !hasGeminiKey ? (
        <div>
          <AiDisabledNotice compact />
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      {message ? <p className="text-sm text-text-muted">{message}</p> : null}

      {report ? (
        <article
          className={[
            "space-y-5 rounded-3xl bg-bg px-5 py-5 text-base text-text shadow-inner",
            language === "bn" ? "leading-8" : "leading-7",
          ].join(" ")}
        >
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">
              {formatMonthStartDisplay(month)}
            </p>
            <h3 className="text-xl font-semibold tracking-tight text-text">
              {report.title}
            </h3>
            <p className="text-text-muted">{report.overview}</p>
            {generatedAt ? (
              <p className="text-xs text-text-muted">
                {reportLabels.generated} {formatGeneratedAt(generatedAt, language)}
              </p>
            ) : null}
          </div>

          {cashFlow?.current ? (
            <CashFlowMetricsBanner
              metrics={cashFlow.current}
              labels={reportLabels}
            />
          ) : null}

          {report.cashFlowSummary ? (
            <p className="rounded-2xl border border-border/60 bg-surface/40 px-4 py-3 text-sm leading-relaxed text-text">
              <span className="font-semibold text-text">
                {reportLabels.cashFlow}:{" "}
              </span>
              {report.cashFlowSummary}
            </p>
          ) : null}

          <ReportSection title={reportLabels.wins} items={report.wins} />
          <ReportSection title={reportLabels.watchouts} items={report.watchouts} />
          <ReportSection
            title={reportLabels.categoryChanges}
            items={report.categoryChanges}
          />
          <ReportSection
            title={reportLabels.nextMonthPlan}
            items={report.nextMonthPlan}
          />
        </article>
      ) : content ? (
        <div className="whitespace-pre-line rounded-3xl bg-bg px-5 py-5 text-base leading-7 text-text shadow-inner">
          {content}
        </div>
      ) : null}
    </Card>

      <section className="mt-4 space-y-3">
        <div>
          <h3 className="font-semibold tracking-tight text-text">Saved reports</h3>
          <p className="mt-1 text-sm text-text-muted">
            Each month can have one saved report. Delete a month if you want to
            save a new version.
          </p>
        </div>

        {savedReports.length > 0 ? (
          <div className="space-y-3">
            {savedReports.map((savedReport) => {
              const savedLabels = getReportLabels(savedReport.language);
              const isExpanded = expandedReportIds.has(savedReport.id);
              const contentId = `saved-report-${savedReport.id}`;

              return (
                <Card
                  key={savedReport.id}
                  padding="none"
                  className="overflow-hidden"
                >
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={contentId}
                    onClick={() => toggleSavedReport(savedReport.id)}
                    className="group flex w-full cursor-pointer items-center justify-between gap-3 p-4 text-left transition-[background-color] duration-(--dur-short) hover:bg-accent/6 active:bg-accent/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
                  >
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold uppercase tracking-wide text-accent">
                        {formatMonthStartDisplay(savedReport.reportMonth)} -{" "}
                        {getLanguageLabel(savedReport.language)}
                      </span>
                      {savedReport.report ? (
                        <>
                          <span className="mt-1 block truncate text-base font-semibold tracking-tight text-text">
                            {savedReport.report.title}
                          </span>
                          <span className="mt-0.5 line-clamp-2 block text-sm leading-relaxed text-text-muted">
                            {savedReport.report.overview}
                          </span>
                        </>
                      ) : (
                        <span className="mt-1 block text-sm leading-relaxed text-text-muted">
                          Saved report content is available.
                        </span>
                      )}
                      <span className="mt-1 block text-xs text-text-muted">
                        {savedLabels.savedLabel}{" "}
                        {formatGeneratedAt(
                          savedReport.generatedAt,
                          savedReport.language,
                        )}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center pl-2">
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/12 text-accent transition-colors group-hover:bg-accent/18"
                        aria-hidden
                      >
                        {isExpanded ? (
                          <FiMinimize2 className="h-4 w-4" />
                        ) : (
                          <FiMaximize2 className="h-4 w-4" />
                        )}
                      </span>
                    </span>
                  </button>

                  {isExpanded && savedReport.report ? (
                    <section
                      id={contentId}
                      className="space-y-4 border-t border-border/60 p-4"
                    >
                      <div
                        className={[
                          "space-y-4 rounded-2xl border border-border/70 bg-bg/35 p-3 text-sm text-text",
                          savedReport.language === "bn" ? "leading-7" : "leading-6",
                        ].join(" ")}
                      >
                        {savedReport.report.cashFlowSummary ? (
                          <p className="rounded-xl border border-border/60 bg-bg/50 px-3 py-2 text-sm leading-relaxed text-text">
                            <span className="font-semibold">
                              {savedLabels.cashFlow}:{" "}
                            </span>
                            {savedReport.report.cashFlowSummary}
                          </p>
                        ) : null}
                        <ReportSection
                          title={savedLabels.wins}
                          items={savedReport.report.wins}
                        />
                        <ReportSection
                          title={savedLabels.watchouts}
                          items={savedReport.report.watchouts}
                        />
                        <ReportSection
                          title={savedLabels.categoryChanges}
                          items={savedReport.report.categoryChanges}
                        />
                        <ReportSection
                          title={savedLabels.nextMonthPlan}
                          items={savedReport.report.nextMonthPlan}
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="dangerOutline"
                          size="sm"
                          onClick={() => setDeleteMonth(savedReport.reportMonth)}
                        >
                          Delete
                        </Button>
                      </div>
                    </section>
                  ) : isExpanded ? (
                    <section
                      id={contentId}
                      className="space-y-4 border-t border-border/60 p-4"
                    >
                      <p className="whitespace-pre-line rounded-2xl border border-border/70 bg-bg/35 p-3 text-sm leading-relaxed text-text">
                        {savedReport.content}
                      </p>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="dangerOutline"
                          size="sm"
                          onClick={() => setDeleteMonth(savedReport.reportMonth)}
                        >
                          Delete
                        </Button>
                      </div>
                    </section>
                  ) : null}
                </Card>
              );
            })}
          </div>
        ) : (
          <p className="rounded-2xl bg-bg px-4 py-4 text-sm text-text-muted">
            No saved reports yet. Generate a report, then save it here.
          </p>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(deleteMonth)}
        title="Delete saved report?"
        message={`Delete the saved report for ${
          deleteMonth ? formatMonthStartDisplay(deleteMonth) : "this month"
        }? This cannot be undone.`}
        loading={deletingReport}
        onCancel={() => setDeleteMonth(null)}
        onConfirm={handleDeleteReport}
      />
    </>
  );
}
