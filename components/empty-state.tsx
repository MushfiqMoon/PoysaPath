import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <Card
      padding="lg"
      className="border-dashed bg-surface/60 text-center"
    >
      <p className="font-semibold text-text">{title}</p>
      {description && (
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-text-muted">
          {description}
        </p>
      )}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-5 inline-block">
          <Button>{actionLabel}</Button>
        </Link>
      )}
    </Card>
  );
}
