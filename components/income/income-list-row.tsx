"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";

import { deleteIncome } from "@/app/(app)/actions/incomes";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { IncomeAmount } from "@/components/income/income-amount";
import { Card } from "@/components/ui/card";
import { formatPaymentMethod } from "@/lib/constants";
import type { Income } from "@/lib/types";

const SWIPE_WIDTH = 120;

const actionButtonClass =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-md shadow-black/15 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2";

type IncomeListRowProps = {
  income: Income;
  categoryName: string;
  title: string;
};

export function IncomeListRow({
  income,
  categoryName,
  title,
}: IncomeListRowProps) {
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

  const meta = [categoryName, formatPaymentMethod(income.payment_method)]
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
      await deleteIncome(income.id);
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
            href={`/incomes/${income.id}/edit`}
            aria-label="Edit income"
            className={[actionButtonClass, "bg-accent focus-visible:outline-accent"].join(
              " ",
            )}
            tabIndex={snapOpen ? 0 : -1}
          >
            <FiEdit className="h-5 w-5" aria-hidden />
          </Link>
          <button
            type="button"
            aria-label="Delete income"
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
          <Link href={`/incomes/${income.id}/edit`} className="block">
            <Card
              padding="md"
              className="flex items-center justify-between transition-[border-color] duration-[var(--dur-short)] hover:border-accent/40"
            >
              <div className="min-w-0 flex-1 pr-3">
                <p className="font-medium text-text">
                  {income.categories?.icon && (
                    <span className="mr-1" aria-hidden>
                      {income.categories.icon}
                    </span>
                  )}
                  {title}
                </p>
                {meta && (
                  <p className="mt-0.5 truncate text-sm text-text-muted">{meta}</p>
                )}
              </div>
              <IncomeAmount amount={Number(income.amount)} />
            </Card>
          </Link>
        </div>
      </li>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete income?"
        message="This cannot be undone."
        loading={loading}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
