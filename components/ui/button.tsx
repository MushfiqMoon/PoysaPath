import { type ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
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
};

export function Button({
  variant = "primary",
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
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-base font-medium transition-[color,background-color,transform,opacity] duration-[var(--dur-short)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        variants[variant],
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
