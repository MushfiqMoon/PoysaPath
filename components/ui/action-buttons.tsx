import { Fragment, type ButtonHTMLAttributes } from "react";
import { FiSave, FiTrash2 } from "react-icons/fi";

import { Button, type ButtonProps } from "@/components/ui/button";

export type ActionButtonProps = Omit<ButtonProps, "variant"> & {
  loading?: boolean;
  showIcon?: boolean;
};

const textActionBase =
  "inline-flex min-h-9 cursor-pointer items-center justify-center rounded-md px-2 text-sm font-medium transition-colors duration-[var(--dur-short)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";

/** Primary save + optional cancel link below (Option A). */
export function FormSaveActions({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={["flex flex-col gap-2 pt-1", className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}

/** Side-by-side text Edit · Delete (Option 1). */
export function InlineActionGroup({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const nodes = Array.isArray(children)
    ? children.filter(Boolean)
    : children
      ? [children]
      : [];

  return (
    <div
      className={["flex shrink-0 items-center", className].filter(Boolean).join(" ")}
    >
      {nodes.map((child, index) => (
        <Fragment key={index}>
          {index > 0 ? (
            <span className="select-none px-0.5 text-text-muted/40" aria-hidden>
              ·
            </span>
          ) : null}
          {child}
        </Fragment>
      ))}
    </div>
  );
}

export function SaveButton({
  children,
  loading,
  showIcon = false,
  size = "sm",
  ...props
}: ActionButtonProps) {
  return (
    <Button variant="primary" size={size} loading={loading} {...props}>
      {showIcon && !loading && (
        <FiSave className="h-4 w-4 shrink-0" aria-hidden />
      )}
      {children ?? "Save"}
    </Button>
  );
}

/** Plain text cancel for inline forms (Option A). */
export function CancelLink({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={[
        textActionBase,
        "self-center text-text-muted hover:text-text",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children ?? "Cancel"}
    </button>
  );
}

/** Bordered cancel for confirm dialogs and modals. */
export function CancelButton({
  children,
  size = "default",
  ...props
}: ActionButtonProps) {
  return (
    <Button variant="secondary" size={size} {...props}>
      {children ?? "Cancel"}
    </Button>
  );
}

export function EditButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={[
        textActionBase,
        "text-text-muted hover:text-accent",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children ?? "Edit"}
    </button>
  );
}

export function DeleteButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={[textActionBase, "text-danger hover:opacity-90", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children ?? "Delete"}
    </button>
  );
}

/** Solid destructive action (confirm dialogs, delete expense). */
export function DeleteDangerButton({
  children,
  loading,
  showIcon = true,
  size = "default",
  ...props
}: ActionButtonProps) {
  return (
    <Button variant="danger" size={size} loading={loading} {...props}>
      {showIcon && !loading && (
        <FiTrash2 className="h-4 w-4 shrink-0" aria-hidden />
      )}
      {children ?? "Delete"}
    </Button>
  );
}
