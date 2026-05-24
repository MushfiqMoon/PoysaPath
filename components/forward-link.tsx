import Link from "next/link";
import { Fragment } from "react";
import { FiArrowRight, FiChevronRight } from "react-icons/fi";

type ForwardLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

export function ForwardLink({
  href,
  children,
  className = "",
  onClick,
}: ForwardLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        "inline-flex min-h-8 items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent-hover",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
      <FiArrowRight className="h-4 w-4 shrink-0" aria-hidden />
    </Link>
  );
}

type NavPathProps = {
  parts: string[];
};

/** Inline breadcrumb-style path, e.g. Settings › AI */
export function NavPath({ parts }: NavPathProps) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-0.5">
      {parts.map((part, index) => (
        <Fragment key={`${part}-${index}`}>
          {index > 0 ? (
            <FiChevronRight
              className="h-3.5 w-3.5 shrink-0 text-text-muted"
              aria-hidden
            />
          ) : null}
          <span>{part}</span>
        </Fragment>
      ))}
    </span>
  );
}
