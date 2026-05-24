import { forwardRef, type InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  state?: "default" | "error" | "success";
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ className = "", state = "default", ...props }, ref) {
    return (
      <input
        ref={ref}
        data-state={state !== "default" ? state : undefined}
        className={[
          "min-h-11 w-full rounded-xl border bg-surface px-3 py-2 text-base text-text transition-[border-color,box-shadow] duration-[var(--dur-short)] placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50",
          state === "error"
            ? "border-danger/60 focus-visible:outline-danger"
            : state === "success"
              ? "border-accent/50"
              : "border-border",
          className,
        ].join(" ")}
        {...props}
      />
    );
  },
);
