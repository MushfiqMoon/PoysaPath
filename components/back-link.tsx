import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

type BackLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function BackLink({ href, children, className = "" }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex min-h-8 items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-accent",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <FiArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
      {children}
    </Link>
  );
}
