"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiMaximize2, FiMinimize2 } from "react-icons/fi";

import {
  completeInvestmentProject,
  deleteInvestmentProject,
} from "@/app/(app)/actions/investments";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { InvestmentProgressBar } from "@/components/investments/investment-progress-bar";
import { PaymentForm } from "@/components/investments/payment-form";
import {
  DeleteButton,
  EditButton,
  InlineActionGroup,
} from "@/components/ui/action-buttons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatRelativeDay } from "@/lib/format";
import { getInvestmentKindLabel } from "@/lib/investments/progress";
import type { InvestmentProject } from "@/lib/types";

type InvestmentProjectCardProps = {
  project: InvestmentProject;
  showTitle?: boolean;
  redirectOnDelete?: string;
};

export function InvestmentProjectCard({
  project,
  showTitle = true,
  redirectOnDelete,
}: InvestmentProjectCardProps) {
  const router = useRouter();
  const isOneTime = project.kind === "one_time";
  const isActive = project.status === "active";
  const payment = project.payments[0];

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmComplete, setConfirmComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  const statusClass =
    project.status === "completed"
      ? "bg-accent/12 text-accent ring-accent/25"
      : "bg-accent/10 text-accent ring-accent/25";

  function handleEditProject() {
    router.push(`/settings/investments/projects/${project.id}/edit`);
  }

  function handleEditPayment(paymentId: string) {
    router.push(`/settings/investments/payments/${paymentId}/edit`);
  }

  async function handleDeleteProject() {
    setLoading(true);
    try {
      await deleteInvestmentProject(project.id);
      setConfirmDelete(false);
      if (redirectOnDelete) {
        router.push(redirectOnDelete);
      } else {
        router.refresh();
      }
    } catch {
      setConfirmDelete(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleCompleteProject() {
    setLoading(true);
    try {
      await completeInvestmentProject(project.id);
      setConfirmComplete(false);
      router.refresh();
    } catch {
      setConfirmComplete(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Card
        padding="none"
        className={[
          "overflow-hidden",
          isActive ? "border-accent/40 shadow-[0_0_24px_rgba(15,185,177,0.08)]" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {isActive ? <div className="h-1 bg-accent" aria-hidden /> : null}
        <div className="space-y-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {showTitle ? (
                <p className="truncate text-base font-semibold tracking-tight text-text">
                  {project.title}
                </p>
              ) : null}
              <div
                className={[
                  "flex flex-wrap items-center gap-2 text-xs text-text-muted",
                  showTitle ? "mt-1" : "",
                ].join(" ")}
              >
                <span className="rounded-full bg-bg/70 px-2 py-0.5">
                  {getInvestmentKindLabel(project.kind)}
                </span>
                {project.description ? (
                  <span className="line-clamp-2">{project.description}</span>
                ) : null}
              </div>
            </div>
            <span
              className={[
                "inline-flex shrink-0 items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                statusClass,
              ].join(" ")}
            >
              {isActive ? (
                <span className="features-hero__live-dot shrink-0" aria-hidden />
              ) : null}
              {project.status}
            </span>
          </div>

          {isOneTime && payment ? (
            <div className="rounded-2xl border border-border bg-bg/45 p-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-text-muted">
                  {formatRelativeDay(payment.payment_date)}
                </span>
                <span className="font-semibold tabular-nums text-text">
                  {formatCurrency(Number(payment.amount))}
                </span>
              </div>
              {payment.note ? (
                <p className="mt-2 text-sm text-text-muted">{payment.note}</p>
              ) : null}
            </div>
          ) : null}

          {!isOneTime ? <InvestmentProgressBar project={project} /> : null}

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border/60 pt-3">
            <InlineActionGroup>
              {isOneTime && payment ? (
                <EditButton
                  type="button"
                  disabled={loading}
                  onClick={() => handleEditPayment(payment.id)}
                >
                  Edit payment
                </EditButton>
              ) : null}
              <EditButton
                type="button"
                disabled={loading}
                onClick={handleEditProject}
              >
                Edit project
              </EditButton>
            </InlineActionGroup>
            {isActive && !isOneTime ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={loading}
                onClick={() => setConfirmComplete(true)}
              >
                Mark complete
              </Button>
            ) : null}
            <DeleteButton
              type="button"
              disabled={loading}
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </DeleteButton>
          </div>

          {!isOneTime && isActive ? (
            <div className="rounded-2xl border border-border/70 bg-surface/60 p-3">
              <p className="mb-3 text-sm font-semibold text-text">Add payment</p>
              <PaymentForm projectId={project.id} compact />
            </div>
          ) : null}

          {!isOneTime && project.payments.length > 0 ? (
            <section className="overflow-hidden rounded-2xl border border-border/70 bg-bg/35">
              <button
                type="button"
                aria-expanded={isHistoryOpen}
                aria-controls={`investment-payments-${project.id}`}
                onClick={() => setIsHistoryOpen((open) => !open)}
                className="group flex w-full cursor-pointer items-center justify-between gap-3 p-3 text-left transition-[background-color] duration-(--dur-short) hover:bg-accent/6 active:bg-accent/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-text">
                    Payment history
                  </span>
                  <span className="mt-0.5 block text-xs text-text-muted">
                    Individual amounts and notes
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full bg-surface px-2 py-1 text-xs text-text-muted">
                    {project.payments.length}
                  </span>
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/12 text-accent transition-colors group-hover:bg-accent/18"
                    aria-hidden
                  >
                    {isHistoryOpen ? (
                      <FiMinimize2 className="h-4 w-4" />
                    ) : (
                      <FiMaximize2 className="h-4 w-4" />
                    )}
                  </span>
                </span>
              </button>

              {isHistoryOpen ? (
                <ul
                  id={`investment-payments-${project.id}`}
                  className="divide-y divide-border/60 border-t border-border/60 px-3"
                >
                  {project.payments.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start justify-between gap-3 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold tabular-nums text-text">
                          {formatCurrency(Number(item.amount))}
                        </p>
                        <p className="text-xs text-text-muted">
                          {formatRelativeDay(item.payment_date)}
                        </p>
                        {item.note ? (
                          <p className="mt-1 text-sm text-text-muted">{item.note}</p>
                        ) : null}
                      </div>
                      <EditButton
                        type="button"
                        className="min-h-8 px-1 text-xs"
                        onClick={() => handleEditPayment(item.id)}
                      >
                        Edit
                      </EditButton>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ) : null}
        </div>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete project?"
        message="This removes the project and all of its payments. This cannot be undone."
        loading={loading}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDeleteProject}
      />

      <ConfirmDialog
        open={confirmComplete}
        title="Mark project complete?"
        message={`"${project.title}" will be marked complete. You can still view its payment history.`}
        loading={loading}
        onCancel={() => setConfirmComplete(false)}
        onConfirm={handleCompleteProject}
      />
    </>
  );
}
