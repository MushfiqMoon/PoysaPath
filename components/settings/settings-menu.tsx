import Link from "next/link";
import type { IconType } from "react-icons";
import {
  FiBell,
  FiChevronRight,
  FiFileText,
  FiPieChart,
  FiRefreshCw,
  FiShield,
  FiTag,
  FiTarget,
  FiTrendingUp,
  FiUser,
  FiSend,
  FiZap,
} from "react-icons/fi";

import { Card } from "@/components/ui/card";
import { AI_LABELS } from "@/lib/gemini/labels";
import type { SettingsMenuView } from "@/lib/settings-menu-view";

type MenuLink = {
  href: string;
  label: string;
  desc: string;
  Icon: IconType;
};

const menuLinks: MenuLink[] = [
  {
    href: "/settings/profile",
    label: "Profile",
    desc: "Name, email, and preferences",
    Icon: FiUser,
  },
  {
    href: "/settings/ai",
    label: AI_LABELS.settingsSection,
    desc: "Gemini API key for Quick entry and Money Coach",
    Icon: FiZap,
  },
  {
    href: "/settings/follow-ups",
    label: "Follow-Ups",
    desc: "Nudge people you trust about money tasks",
    Icon: FiSend,
  },
  {
    href: "/settings/categories",
    label: "Categories",
    desc: "Manage expense categories",
    Icon: FiTag,
  },
  {
    href: "/settings/budgets",
    label: "Budgets",
    desc: "Monthly limits per category",
    Icon: FiPieChart,
  },
  {
    href: "/settings/goals",
    label: "Goals",
    desc: "Savings, debt, and spend-less targets",
    Icon: FiTarget,
  },
  {
    href: "/settings/investments",
    label: "Investments",
    desc: "Log contributions and view history",
    Icon: FiTrendingUp,
  },
  {
    href: "/settings/recurring",
    label: "Recurring payments",
    desc: "Bills, subscriptions, DPS reminders",
    Icon: FiRefreshCw,
  },
  {
    href: "/settings/reports",
    label: "Monthly report",
    desc: "AI summary and next-month plan",
    Icon: FiFileText,
  },
  {
    href: "/settings/announcements",
    label: "Announcements",
    desc: "Updates you have already read",
    Icon: FiBell,
  },
];

const adminLink: MenuLink = {
  href: "/settings/admin",
  label: "Admin",
  desc: "User sign-in overview",
  Icon: FiShield,
};

type SettingsMenuProps = {
  showAdminLink?: boolean;
  view?: SettingsMenuView;
};

const linkFocusClass =
  "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent";

function SettingsMenuList({ links }: { links: MenuLink[] }) {
  return (
    <ul className="divide-y divide-glass-border">
      {links.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className={[
              "group flex min-h-[4.25rem] items-center gap-3 px-4 py-3 transition-[background-color] duration-[var(--dur-short)] hover:bg-accent/6 active:bg-accent/10",
              linkFocusClass,
            ].join(" ")}
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent transition-colors group-hover:bg-accent/18"
              aria-hidden
            >
              <item.Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-text">{item.label}</span>
              <span className="mt-0.5 block text-sm leading-snug text-text-muted">
                {item.desc}
              </span>
            </span>
            <FiChevronRight
              className="h-5 w-5 shrink-0 text-text-muted/70 transition-[color,transform] duration-[var(--dur-short)] group-hover:translate-x-0.5 group-hover:text-accent"
              aria-hidden
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function SettingsMenuGrid({ links }: { links: MenuLink[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4">
      {links.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className={[
              "group flex min-h-24 flex-col items-center justify-center gap-2 px-2 py-2 text-center transition-colors duration-[var(--dur-short)]",
              linkFocusClass,
            ].join(" ")}
          >
            <item.Icon
              className="h-6 w-6 shrink-0 text-accent transition-colors group-hover:text-accent/80"
              aria-hidden
            />
            <span className="line-clamp-2 text-sm font-semibold leading-snug text-text">
              {item.label}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function SettingsMenu({
  showAdminLink = false,
  view = "list",
}: SettingsMenuProps) {
  const links = showAdminLink ? [...menuLinks, adminLink] : menuLinks;

  return (
    <nav aria-label="Settings sections">
      {view === "grid" ? (
        <SettingsMenuGrid links={links} />
      ) : (
        <Card padding="none" className="overflow-hidden">
          <SettingsMenuList links={links} />
        </Card>
      )}
    </nav>
  );
}
