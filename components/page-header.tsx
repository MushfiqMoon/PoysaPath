import Link from "next/link";

type PageHeaderProps = {
  title: string;
  backHref?: string;
  backLabel?: string;
  action?: React.ReactNode;
};

export function PageHeader({
  title,
  backHref = "/settings",
  backLabel = "← Back",
  action,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        {backHref && (
          <Link
            href={backHref}
            className="mb-2 inline-block text-sm text-text-muted hover:text-text"
          >
            {backLabel}
          </Link>
        )}
        <h2 className="text-lg font-semibold text-text">{title}</h2>
      </div>
      {action}
    </div>
  );
}
