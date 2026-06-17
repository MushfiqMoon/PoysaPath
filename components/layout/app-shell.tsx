"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { IconType } from "react-icons";
import {
  FiEdit,
  FiHome,
  FiList,
  FiLogOut,
  FiSettings,
} from "react-icons/fi";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Logo } from "@/components/shared/logo";
import { NotificationsBellButton } from "@/components/notifications/notifications-bell-button";
import { NotificationsPanel } from "@/components/notifications/notifications-panel";
import { AI_LABELS } from "@/lib/gemini/labels";
import { useNotifications } from "@/lib/notifications/use-notifications";
import { createClient } from "@/lib/supabase/client";

const mainNav: {
  href: string;
  label: string;
  Icon: IconType;
  IconActive: IconType;
}[] = [
  {
    href: "/dashboard",
    label: "Home",
    Icon: FiHome,
    IconActive: FiHome,
  },
  {
    href: "/history",
    label: "History",
    Icon: FiList,
    IconActive: FiList,
  },
  {
    href: "/add",
    label: "Add",
    Icon: FiEdit,
    IconActive: FiEdit,
  },
  {
    href: "/settings",
    label: "More",
    Icon: FiSettings,
    IconActive: FiSettings,
  },
];

const settingsSubNav = [
  { href: "/settings/profile", label: "Profile" },
  { href: "/settings/ai", label: AI_LABELS.settingsSection },
  { href: "/settings/categories", label: "Categories" },
  { href: "/settings/budgets", label: "Budgets" },
  { href: "/settings/goals", label: "Goals" },
  { href: "/settings/investments", label: "Investments" },
  { href: "/settings/recurring", label: "Recurring" },
  { href: "/settings/reports", label: "Reports" },
  { href: "/settings/announcements", label: "Announcements" },
] as const;

const headerIconClass =
  "flex min-h-11 min-w-11 items-center justify-center rounded-xl text-accent transition-[color,background-color,transform] duration-[var(--dur-short)] hover:bg-accent/12 hover:text-accent active:scale-[0.97]";

function isActive(pathname: string, href: string) {
  if (href === "/settings") return pathname === "/settings";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isSettingsSectionActive(pathname: string) {
  return pathname.startsWith("/settings");
}

function isMobileNavActive(pathname: string, href: string) {
  if (href === "/settings") return isSettingsSectionActive(pathname);
  return isActive(pathname, href);
}

type AppShellProps = {
  children: React.ReactNode;
  title?: string;
};

export function AppShell({ children, title }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifications = useNotifications();

  function openNotifications() {
    setNotificationsOpen(true);
    void notifications.load();
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const mobileActiveIndex = useMemo(
    () => mainNav.findIndex((item) => isMobileNavActive(pathname, item.href)),
    [pathname],
  );

  const isDashboard = pathname === "/dashboard";
  const desktopContentWidth = isDashboard ? "md:max-w-6xl" : "";

  function renderNavLink(item: (typeof mainNav)[number], mobile = false) {
    const isSettings = item.href === "/settings";
    const active = mobile
      ? isMobileNavActive(pathname, item.href)
      : isSettings
        ? isActive(pathname, item.href)
        : isActive(pathname, item.href);
    const settingsSectionOpen =
      !mobile && isSettings && isSettingsSectionActive(pathname);
    const highlighted = active || settingsSectionOpen;
    const Icon = highlighted ? item.IconActive : item.Icon;

    return (
      <Link
        key={item.href}
        href={item.href}
        prefetch
        aria-current={active ? "page" : undefined}
        className={[
          mobile
            ? [
                "relative z-10 flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors duration-300 active:scale-[0.98] motion-reduce:transition-none",
                active ? "text-white" : "text-text-muted",
              ].join(" ")
            : "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-[color,background-color] duration-[var(--dur-short)]",
          !mobile && (highlighted ? "text-accent" : "text-text-muted hover:text-text"),
          !mobile && active ? "bg-accent/12 font-semibold" : "",
          !mobile && settingsSectionOpen && !active ? "bg-accent/6" : "",
        ].join(" ")}
      >
        <Icon
          className={[
            mobile ? "h-6 w-6" : "h-5 w-5 shrink-0",
            mobile && active ? "motion-safe:scale-105" : "",
          ].join(" ")}
          aria-hidden
        />
        <span className={mobile && active ? "font-semibold" : ""}>
          {item.label}
        </span>
      </Link>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <aside className="glass-panel fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r md:flex">
        <div className="border-b border-glass-border px-5 py-[13px]">
          <Logo href="/dashboard" size={36} showWordmark />
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-3" aria-label="Main">
          {mainNav.slice(0, 3).map((item) => renderNavLink(item))}
          {renderNavLink(mainNav[3])}
          <div
            className={[
              "mt-2 ml-3 border-l pl-3",
              isSettingsSectionActive(pathname)
                ? "border-accent/40"
                : "border-glass-border",
            ].join(" ")}
            role="group"
            aria-label="Settings pages"
          >
            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-text-muted/70">
              Settings
            </p>
            <ul className="space-y-0.5">
              {settingsSubNav.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      prefetch
                      aria-current={active ? "page" : undefined}
                      className={[
                        "block rounded-lg px-2.5 py-2 text-sm transition-colors duration-[var(--dur-short)]",
                        active
                          ? "bg-accent/12 font-semibold text-accent"
                          : "text-text-muted hover:bg-surface/50 hover:text-text",
                      ].join(" ")}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </aside>

      <div className="flex min-h-dvh flex-1 flex-col md:pl-60">
        <header className="glass-panel-light sticky top-0 z-10 hidden border-b px-5 py-3 md:block">
          <div
            className={[
              "mx-auto flex max-w-3xl items-center justify-end gap-1",
              desktopContentWidth,
            ].join(" ")}
          >
            <NotificationsBellButton
              buttonClassName={headerIconClass}
              unreadCount={notifications.unreadCount}
              onClick={openNotifications}
            />
            <button
              type="button"
              onClick={() => setConfirmSignOut(true)}
              className={headerIconClass}
              aria-label="Sign out"
            >
              <FiLogOut className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </header>

        <header className="glass-panel-light sticky top-0 z-10 border-b px-4 py-3 md:hidden">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
            {title ? (
              <h1 className="text-lg font-semibold tracking-tight text-text">{title}</h1>
            ) : (
              <Logo href="/dashboard" size={32} showWordmark />
            )}
            <div className="flex items-center gap-0.5">
              <NotificationsBellButton
                buttonClassName={headerIconClass}
                unreadCount={notifications.unreadCount}
                onClick={openNotifications}
              />
              <button
                type="button"
                onClick={() => setConfirmSignOut(true)}
                className={headerIconClass}
                aria-label="Sign out"
              >
                <FiLogOut className="h-5 w-5" aria-hidden />
              </button>
            </div>
          </div>
        </header>

        <main
          className={[
            "mx-auto w-full max-w-3xl flex-1 px-4 py-5 pb-28 md:px-5 md:pb-8",
            desktopContentWidth,
          ].join(" ")}
        >
          {children}
        </main>

        <nav
          className="glass-panel-light fixed inset-x-3 bottom-3 z-10 rounded-2xl border p-1.5 shadow-[0_-10px_28px_-14px_rgba(0,0,0,0.14)] md:hidden"
          aria-label="Main"
          style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
        >
          <div className="relative">
            <div
              className="pointer-events-none absolute inset-y-0 left-0 rounded-xl bg-accent transition-[transform,width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"
              style={{
                width: "25%",
                transform: `translate3d(${Math.max(mobileActiveIndex, 0) * 100}%, 0, 0)`,
              }}
              aria-hidden
            />
            <ul className="relative z-10 grid grid-cols-4">
              {mainNav.map((item) => (
                <li key={item.href}>{renderNavLink(item, true)}</li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      <NotificationsPanel
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        items={notifications.items}
        loading={notifications.loading}
        markingId={notifications.markingId}
        error={notifications.error}
        onMarkRead={(id) => void notifications.markRead(id)}
      />

      <ConfirmDialog
        open={confirmSignOut}
        title="Sign out?"
        message="You will need to log in again to access your expenses."
        confirmLabel="Sign out"
        onCancel={() => setConfirmSignOut(false)}
        onConfirm={handleSignOut}
      />
    </div>
  );
}
