import { BackLink } from "@/components/shared/back-link";

type PageHeaderProps = {
  title: string;
  backHref?: string;
  backLabel?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
};

export function PageHeader({
  title,
  backHref,
  backLabel = "Back",
  description,
  action,
}: PageHeaderProps) {
  return (
    <section className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        {backHref ? (
          <BackLink href={backHref} className="mb-2">
            {backLabel}
          </BackLink>
        ) : null}
        <h2
          className="text-xl font-semibold tracking-tight text-text"
          style={{ letterSpacing: "-0.02em" }}
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-text-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </section>
  );
}
