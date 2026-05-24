import { BackLink } from "@/components/back-link";

type PageHeaderProps = {
  title: string;
  backHref?: string;
  backLabel?: string;
  action?: React.ReactNode;
};

export function PageHeader({
  title,
  backHref = "/settings",
  backLabel = "Back",
  action,
}: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3">
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
      </div>
      {action}
    </div>
  );
}
