import Image from "next/image";

import { getInitials } from "@/lib/auth/initials";

type UserAvatarProps = {
  name: string;
  avatarUrl?: string | null;
  size?: number;
  /** Larger ring and shadow — best for dashboard hero greeting */
  featured?: boolean;
  className?: string;
};

function framePadding(size: number, featured: boolean): number {
  if (featured) return Math.max(3, Math.round(size * 0.055));
  return Math.max(2, Math.round(size * 0.045));
}

export function UserAvatar({
  name,
  avatarUrl,
  size = 40,
  featured = false,
  className = "",
}: UserAvatarProps) {
  const pad = framePadding(size, featured);
  const outerSize = size + pad * 2;
  const initialsSize = Math.max(12, Math.round(size * 0.36));

  const outerStyle = { width: outerSize, height: outerSize, padding: pad };
  const innerStyle = { width: size, height: size };

  const frameClass = [
    "relative inline-flex shrink-0 items-center justify-center rounded-full",
    featured
      ? "shadow-[0_8px_24px_-8px_color-mix(in_oklch,var(--accent)_42%,transparent),0_4px_12px_-6px_rgba(0,0,0,0.18)]"
      : "shadow-[0_4px_14px_-6px_color-mix(in_oklch,var(--accent)_28%,transparent),0_2px_8px_-4px_rgba(0,0,0,0.12)]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const frameBackground = featured
    ? "var(--border-gradient)"
    : "var(--border-gradient-soft)";

  const innerShellClass =
    "relative overflow-hidden rounded-full bg-surface ring-1 ring-black/5 dark:ring-white/10";

  if (avatarUrl) {
    return (
      <span
        className={frameClass}
        style={{ ...outerStyle, background: frameBackground }}
        title={name}
      >
        <span className={innerShellClass} style={innerStyle}>
          <Image
            src={avatarUrl}
            alt={`${name}'s profile photo`}
            width={size}
            height={size}
            className="h-full w-full object-cover"
            sizes={`${size}px`}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full bg-linear-to-t from-black/15 via-transparent to-white/10"
          />
        </span>
      </span>
    );
  }

  return (
    <span
      className={frameClass}
      style={{ ...outerStyle, background: frameBackground }}
      title={name}
    >
      <span
        aria-hidden
        className={`${innerShellClass} inline-flex items-center justify-center bg-linear-to-br from-accent/20 via-accent/10 to-accent/5 font-semibold text-accent`}
        style={{ ...innerStyle, fontSize: initialsSize }}
      >
        {getInitials(name)}
      </span>
    </span>
  );
}
