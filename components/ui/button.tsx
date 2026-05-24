import { type ButtonHTMLAttributes } from "react";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?:
    | "primary"
    | "secondary"
    | "ghost"
    | "danger"
    | "accentOutline"
    | "dangerOutline";
  size?: "default" | "sm";
  fullWidth?: boolean;
  loading?: boolean;
};

const variants = {
  primary:
    "bg-accent text-white hover:bg-accent-hover active:translate-y-px disabled:opacity-50 disabled:pointer-events-none data-[state=loading]:opacity-80",
  secondary:
    "border border-border bg-surface text-text hover:bg-bg active:translate-y-px disabled:opacity-50 disabled:pointer-events-none",
  ghost:
    "text-accent hover:bg-accent/10 active:translate-y-px disabled:opacity-50 disabled:pointer-events-none",
  danger:
    "bg-danger text-white hover:opacity-90 active:translate-y-px disabled:opacity-50 disabled:pointer-events-none",
  accentOutline:
    "border border-accent/40 bg-accent/8 text-accent hover:bg-accent/14 active:translate-y-px disabled:opacity-50 disabled:pointer-events-none",
  dangerOutline:
    "border border-danger/50 bg-danger/8 text-danger hover:bg-danger/14 active:translate-y-px disabled:opacity-50 disabled:pointer-events-none",
};

const sizes = {
  default: "min-h-11 gap-2 rounded-xl px-4 py-2.5 text-base",
  sm: "min-h-9 gap-1.5 rounded-lg px-3 py-2 text-sm",
};

export function Button({
  variant = "primary",
  size = "default",
  fullWidth,
  loading,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      data-state={loading ? "loading" : undefined}
      disabled={disabled || loading}
      className={[
        "inline-flex cursor-pointer items-center justify-center font-medium transition-[color,background-color,transform,opacity] duration-[var(--dur-short)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        variants[variant],
        sizes[size],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {loading ? (
        <>
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden
          />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
