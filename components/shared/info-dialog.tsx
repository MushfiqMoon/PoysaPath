"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-[2px] sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-dialog-title"
    >
      <Card elevated padding="md" className="w-full max-w-sm">
        <h2 id="info-dialog-title" className="text-lg font-semibold tracking-tight text-text">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">{message}</p>
        <div className="mt-5">
          <Button fullWidth onClick={onClose}>
            {confirmLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
}
