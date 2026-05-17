"use client";

import { IoNotifications, IoNotificationsOutline } from "react-icons/io5";

type NotificationsBellButtonProps = {
  buttonClassName: string;
  iconSize?: "sm" | "md";
  unreadCount: number;
  onClick: () => void;
};

export function NotificationsBellButton({
  buttonClassName,
  iconSize = "md",
  unreadCount,
  onClick,
}: NotificationsBellButtonProps) {
  const iconClass = iconSize === "sm" ? "h-5 w-5" : "h-6 w-6";
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
      <span
        className={[
          "inline-flex",
          iconClass,
          hasUnread ? "notification-bell" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden
      >
        {hasUnread ? (
          <IoNotifications className="h-full w-full" />
        ) : (
          <IoNotificationsOutline className="h-full w-full" />
        )}
      </span>
      {hasUnread && (
        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-none text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}
