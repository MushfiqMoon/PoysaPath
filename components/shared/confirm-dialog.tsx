"use client";

import { CancelButton, DeleteDangerButton } from "@/components/ui/action-buttons";
import { Card } from "@/components/ui/card";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  loading,
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-[2px] sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <Card elevated padding="md" className="w-full max-w-sm">
        <h2 id="confirm-title" className="text-lg font-semibold tracking-tight text-text">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">{message}</p>
        {children}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:[&>button]:flex-1">
          <CancelButton
            type="button"
            fullWidth
            size="default"
            onClick={onCancel}
            disabled={loading}
          />
          <DeleteDangerButton
            type="button"
            fullWidth
            size="default"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </DeleteDangerButton>
        </div>
      </Card>
    </div>
  );
}
