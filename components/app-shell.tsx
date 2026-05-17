"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard", label: "Home" },
  { href: "/expenses", label: "Expenses" },
  { href: "/add", label: "Add" },
  { href: "/settings", label: "More" },
];

type AppShellProps = {
  children: React.ReactNode;
  title?: string;
};

export function AppShell({ children, title }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-full flex-col bg-bg">
      <header className="sticky top-0 z-10 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          {title ? (
            <h1 className="text-lg font-semibold text-text">{title}</h1>
          ) : (
            <Logo href="/dashboard" size={32} showWordmark />
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="text-sm text-text-muted hover:text-text"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-4 pb-24">
        {children}
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
        aria-label="Main"
      >
        <ul className="mx-auto grid max-w-3xl grid-cols-4">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href === "/settings" &&
                (pathname.startsWith("/settings") ||
                  pathname.startsWith("/categories") ||
                  pathname.startsWith("/budgets")));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={[
                    "flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium",
                    active ? "text-accent" : "text-text-muted",
                  ].join(" ")}
                >
                  <span aria-hidden>{item.label === "Add" ? "+" : "•"}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
