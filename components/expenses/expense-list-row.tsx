"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";

import { deleteExpense } from "@/app/(app)/actions/expenses";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Card } from "@/components/ui/card";
import { formatPaymentMethod } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import type { Expense } from "@/lib/types";

const SWIPE_WIDTH = 120;

const actionButtonClass =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-md shadow-black/15 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2";

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

  const snapOpen = offset === -SWIPE_WIDTH;

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
      <li className="relative overflow-hidden rounded-[var(--radius-card)]">
        <div
          className={[
            "absolute inset-y-0 right-0 flex w-[7.5rem] items-center justify-end gap-2 pr-3",
            offset < 0 ? "pointer-events-auto" : "pointer-events-none",
          ].join(" ")}
          aria-hidden={offset === 0}
        >
          <Link
            href={`/expenses/${expense.id}/edit`}
            aria-label="Edit expense"
            className={[actionButtonClass, "bg-accent focus-visible:outline-accent"].join(
              " ",
            )}
            tabIndex={snapOpen ? 0 : -1}
          >
            <FiEdit className="h-5 w-5" aria-hidden />
          </Link>
          <button
            type="button"
            aria-label="Delete expense"
            className={[actionButtonClass, "bg-danger focus-visible:outline-danger"].join(
              " ",
            )}
            tabIndex={snapOpen ? 0 : -1}
            onClick={() => setConfirmDelete(true)}
          >
            <FiTrash2 className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div
          className={[
            "relative transition-transform",
            reducedMotion ? "" : "duration-200 ease-out",
          ].join(" ")}
          style={{ transform: `translateX(${offset}px)` }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <Link href={`/expenses/${expense.id}/edit`} className="block">
            <Card
              padding="md"
              className="flex items-center justify-between transition-[border-color] duration-[var(--dur-short)] hover:border-accent/40"
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
            </Card>
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
