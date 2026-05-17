"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { CiCircleList } from "react-icons/ci";
import { FiEdit } from "react-icons/fi";
import {
  IoHome,
  IoHomeOutline,
  IoSettings,
  IoSettingsOutline,
} from "react-icons/io5";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/client";

const mainNav = [
  {
    href: "/dashboard",
    label: "Home",
    Icon: IoHomeOutline,
    IconActive: IoHome,
  },
  {
    href: "/expenses",
    label: "Expenses",
    Icon: CiCircleList,
    IconActive: CiCircleList,
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
    Icon: IoSettingsOutline,
    IconActive: IoSettings,
  },
] as const;

const sidebarExtra = [
  { href: "/categories", label: "Categories" },
  { href: "/budgets", label: "Budgets" },
];

function isActive(pathname: string, href: string) {
  if (href === "/settings") {
    return (
      pathname.startsWith("/settings") ||
      pathname.startsWith("/categories") ||
      pathname.startsWith("/budgets")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

type AppShellProps = {
  children: React.ReactNode;
  title?: string;
};

export function AppShell({ children, title }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function renderNavLink(item: (typeof mainNav)[number], mobile = false) {
    const active = isActive(pathname, item.href);
    const Icon = active ? item.IconActive : item.Icon;

    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={[
          mobile
            ? "flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors active:scale-[0.98]"
            : "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
          active ? "text-accent" : "text-text-muted hover:text-text",
          !mobile && active ? "bg-accent/10" : "",
        ].join(" ")}
      >
        <Icon className={mobile ? "h-6 w-6" : "h-5 w-5 shrink-0"} aria-hidden />
        <span className={mobile && active ? "font-semibold" : ""}>
          {item.label}
        </span>
      </Link>
    );
  }

  return (
    <div className="flex min-h-full flex-col md:flex-row">
      <aside className="glass-panel fixed inset-y-0 left-0 z-20 hidden w-56 flex-col border-r md:flex">
        <div className="border-b border-glass-border px-4 py-4">
          <Logo href="/dashboard" size={32} showWordmark />
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Main">
          {mainNav.map((item) => renderNavLink(item))}
          <div className="my-2 border-t border-glass-border" role="separator" />
          {sidebarExtra.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "rounded-xl px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-accent/10 font-medium text-accent"
                    : "text-text-muted hover:text-text",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-glass-border p-3">
          <button
            type="button"
            onClick={() => setConfirmSignOut(true)}
            className="w-full rounded-xl px-3 py-2 text-left text-sm text-text-muted hover:bg-surface/50 hover:text-text"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-h-full flex-1 flex-col md:pl-56">
        <header className="glass-panel-light sticky top-0 z-10 border-b px-4 py-3 md:hidden">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
            {title ? (
              <h1 className="text-lg font-semibold text-text">{title}</h1>
            ) : (
              <Logo href="/dashboard" size={32} showWordmark />
            )}
            <button
              type="button"
              onClick={() => setConfirmSignOut(true)}
              className="text-sm text-text-muted hover:text-text"
              aria-label="Sign out"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-4 pb-28 md:pb-8">
          {children}
        </main>

        <nav
          className="glass-panel-light fixed inset-x-3 bottom-3 z-10 rounded-2xl border shadow-lg shadow-black/5 md:hidden"
          aria-label="Main"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <ul className="grid grid-cols-4">
            {mainNav.map((item) => (
              <li key={item.href}>{renderNavLink(item, true)}</li>
            ))}
          </ul>
        </nav>
      </div>

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
