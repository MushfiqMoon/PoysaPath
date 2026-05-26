import { Fragment, type ReactNode } from "react";
import { FiArrowRight, FiChevronRight } from "react-icons/fi";

import { CompactActionLink } from "@/components/ui/compact-action";

type ForwardLinkProps = {
  href: string;
  children: ReactNode;
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
    <CompactActionLink
      href={href}
      onClick={onClick}
      className={className}
    >
      {children}
      <FiArrowRight className="h-4 w-4 shrink-0" aria-hidden />
    </CompactActionLink>
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
