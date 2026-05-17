"use client";

import { Button } from "@/components/ui/button";

type InfoDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onClose: () => void;
};

export function InfoDialog({
  open,
  title,
  message,
  confirmLabel = "OK",
  onClose,
}: InfoDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-dialog-title"
    >
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-5 shadow-lg">
        <h2 id="info-dialog-title" className="text-lg font-semibold text-text">
          {title}
        </h2>
        <p className="mt-2 text-sm text-text-muted">{message}</p>
        <div className="mt-5">
          <Button fullWidth onClick={onClose}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
