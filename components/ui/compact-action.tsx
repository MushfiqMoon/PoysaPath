import Link, { type LinkProps } from "next/link";
import {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

type CompactActionVariant = "ghost" | "soft";
type CompactActionSize = "xs" | "sm";

type CompactActionBaseProps = {
  children: ReactNode;
  className?: string;
  size?: CompactActionSize;
  variant?: CompactActionVariant;
};

export type CompactActionButtonProps =
  ButtonHTMLAttributes<HTMLButtonElement> & CompactActionBaseProps;

export type CompactActionLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> &
  CompactActionBaseProps;

const baseClass =
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg font-semibold text-accent transition-[color,background-color,opacity] duration-[var(--dur-short)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const variants: Record<CompactActionVariant, string> = {
  ghost: "hover:bg-accent/10 hover:text-accent-hover",
  soft: "bg-accent/10 hover:bg-accent/16 hover:text-accent-hover",
};

const sizes: Record<CompactActionSize, string> = {
  xs: "min-h-8 px-2 py-1 text-xs",
  sm: "min-h-8 px-3 py-1.5 text-sm",
};

function compactActionClassName({
  className,
  size = "sm",
  variant = "ghost",
  disabled = false,
}: {
  className?: string;
  size?: CompactActionSize;
  variant?: CompactActionVariant;
  disabled?: boolean;
}) {
  return [
    baseClass,
    variants[variant],
    sizes[size],
    disabled ? "pointer-events-none opacity-50" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function CompactActionButton({
  children,
  className = "",
  disabled,
  size = "sm",
  type = "button",
  variant = "ghost",
  ...props
}: CompactActionButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={compactActionClassName({
        className,
        disabled,
        size,
        variant,
      })}
      {...props}
    >
      {children}
    </button>
  );
}

export function CompactActionLink({
  children,
  className = "",
  size = "sm",
  variant = "ghost",
  ...props
}: CompactActionLinkProps) {
  return (
    <Link
      className={compactActionClassName({ className, size, variant })}
      {...props}
    >
      {children}
    </Link>
  );
}
