import Link from "next/link";
import type { IconType } from "react-icons";
import {
  FiBell,
  FiChevronRight,
  FiPieChart,
  FiTag,
  FiUser,
} from "react-icons/fi";

import { Card } from "@/components/ui/card";

const menuLinks: {
  href: string;
  label: string;
  desc: string;
  Icon: IconType;
}[] = [
  {
    href: "/settings/profile",
    label: "Profile",
    desc: "Name, email, and preferences",
    Icon: FiUser,
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
    href: "/settings/announcements",
    label: "Announcements",
    desc: "Updates you have already read",
    Icon: FiBell,
  },
];

export function SettingsMenu() {
  return (
    <nav aria-label="Settings sections">
      <Card padding="none" className="overflow-hidden">
        <ul className="divide-y divide-glass-border">
          {menuLinks.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group flex min-h-[4.25rem] items-center gap-3 px-4 py-3 transition-[background-color] duration-[var(--dur-short)] hover:bg-accent/6 active:bg-accent/10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent"
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
      </Card>
    </nav>
  );
}
