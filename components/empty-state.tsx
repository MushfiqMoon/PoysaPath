import Link from "next/link";

import { Button } from "@/components/ui/button";

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
    <section className="rounded-xl border border-dashed border-border bg-surface px-6 py-10 text-center">
      <p className="font-medium text-text">{title}</p>
      {description && (
        <p className="mt-2 text-sm text-text-muted">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-4 inline-block">
          <Button>{actionLabel}</Button>
        </Link>
      )}
    </section>
  );
}
