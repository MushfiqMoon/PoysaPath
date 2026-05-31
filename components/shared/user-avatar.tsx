import Image from "next/image";

import { getInitials } from "@/lib/auth/initials";

type UserAvatarProps = {
  name: string;
  avatarUrl?: string | null;
  size?: number;
  className?: string;
};

export function UserAvatar({
  name,
  avatarUrl,
  size = 40,
  className = "",
}: UserAvatarProps) {
  const dimensionStyle = { width: size, height: size };

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt=""
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`.trim()}
        style={dimensionStyle}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-accent/15 font-semibold text-accent ${className}`.trim()}
      style={{ ...dimensionStyle, fontSize: Math.max(12, Math.round(size * 0.36)) }}
    >
      {getInitials(name)}
    </span>
  );
}
