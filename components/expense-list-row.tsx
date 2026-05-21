"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { deleteExpense } from "@/app/(app)/actions/expenses";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { formatPaymentMethod } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import type { Expense } from "@/lib/types";

const SWIPE_WIDTH = 128;

type ExpenseListRowProps = {
  expense: Expense;
  categoryName: string;
  title: string;
};

export function ExpenseListRow({
  expense,
  categoryName,
  title,
}: ExpenseListRowProps) {
  const router = useRouter();
  const [offset, setOffset] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const startX = useRef(0);
  const dragging = useRef(false);
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const meta = [
    categoryName,
    formatPaymentMethod(expense.payment_method),
  ]
    .filter(Boolean)
    .join(" · ");

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
    dragging.current = true;
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!dragging.current) return;
    const dx = e.touches[0].clientX - startX.current;
    if (dx < 0) {
      setOffset(Math.max(-SWIPE_WIDTH, dx));
    } else if (offset < 0) {
      setOffset(Math.min(0, offset + dx));
    }
  }

  function onTouchEnd() {
    dragging.current = false;
    setOffset(offset < -SWIPE_WIDTH / 2 ? -SWIPE_WIDTH : 0);
  }

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteExpense(expense.id);
      router.refresh();
    } catch {
      setConfirmDelete(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <li className="relative overflow-hidden rounded-xl">
        <div
          className="absolute inset-y-0 right-0 flex w-32 items-stretch"
          aria-hidden={offset === 0}
        >
          <Link
            href={`/expenses/${expense.id}/edit`}
            className="flex flex-1 items-center justify-center bg-accent text-sm font-medium text-white"
            tabIndex={offset === 0 ? -1 : 0}
          >
            Edit
          </Link>
          <button
            type="button"
            className="flex flex-1 items-center justify-center bg-danger text-sm font-medium text-white"
            tabIndex={offset === 0 ? -1 : 0}
            onClick={() => setConfirmDelete(true)}
          >
            Delete
          </button>
        </div>

        <div
          className={[
            "relative bg-surface transition-transform",
            reducedMotion ? "" : "duration-200 ease-out",
          ].join(" ")}
          style={{ transform: `translateX(${offset}px)` }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <Link
            href={`/expenses/${expense.id}/edit`}
            className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/40"
          >
            <div className="min-w-0 flex-1 pr-3">
              <p className="font-medium text-text">
                {expense.categories?.icon && (
                  <span className="mr-1" aria-hidden>
                    {expense.categories.icon}
                  </span>
                )}
                {title}
              </p>
              {meta && (
                <p className="mt-0.5 truncate text-sm text-text-muted">{meta}</p>
              )}
            </div>
            <p className="shrink-0 font-semibold tabular-nums text-text">
              {formatCurrency(Number(expense.amount))}
            </p>
          </Link>
        </div>
      </li>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete expense?"
        message="This cannot be undone."
        loading={loading}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
