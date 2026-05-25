"use client";

import { FiBell } from "react-icons/fi";

type NotificationsBellButtonProps = {
  buttonClassName: string;
  unreadCount: number;
  onClick: () => void;
};

export function NotificationsBellButton({
  buttonClassName,
  unreadCount,
  onClick,
}: NotificationsBellButtonProps) {
  const hasUnread = unreadCount > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative ${buttonClassName}`}
      aria-label={
        hasUnread
          ? `Notifications, ${unreadCount} unread`
          : "Notifications"
      }
    >
      <FiBell
        className={[
          "h-5 w-5 shrink-0 text-accent",
          hasUnread ? "notification-bell" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        strokeWidth={hasUnread ? 2.25 : 2}
        aria-hidden
      />
      {hasUnread && (
        <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-none text-white shadow-sm ring-2 ring-surface">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}
