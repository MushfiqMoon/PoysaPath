import { AI_LABELS } from "@/lib/gemini/labels";
import type { FeatureIconKey } from "@/lib/features-icons";

export type FeatureItem = {
  id: string;
  title: string;
  description: string;
  icon: FeatureIconKey;
};

export type FeatureSection = {
  eyebrow: string;
  title: string;
  titleEm: string;
  description: string;
  items: FeatureItem[];
};

/** Full product feature list for the public marketing home page. */
export const FEATURE_SECTIONS: FeatureSection[] = [
  {
    eyebrow: "◇ track",
    title: "See spending at a",
    titleEm: "glance",
    description:
      "Your dashboard and expense list are built for daily checks in BDT — today, this month, and by category.",
    items: [
      {
        id: "dashboard",
        title: "Home dashboard",
        description:
          "Today’s spend, month-to-date total, recent expenses, and category breakdown on one screen.",
        icon: "dashboard",
      },
      {
        id: "expenses",
        title: "Expense history",
        description:
          "Browse expenses grouped by day. Filter by month, category, or payment method.",
        icon: "expenses",
      },
      {
        id: "edit",
        title: "Edit & delete",
        description:
          "Update any entry or remove mistakes. Swipe on mobile for quick edit and delete.",
        icon: "edit",
      },
    ],
  },
  {
    eyebrow: "◇ add",
    title: "Log expenses in",
    titleEm: "seconds",
    description:
      "Manual form when you want control, or plain-language quick entry when you’re in a hurry.",
    items: [
      {
        id: "manual",
        title: "Manual entry",
        description:
          "Amount in ৳, category, date, note, and optional payment method — defaults to today in Dhaka time.",
        icon: "manual",
      },
      {
        id: "quick",
        title: AI_LABELS.quickEntry,
        description:
          "Type something like “120 lunch hotel” in English, Bangla, or Banglish — AI fills the form for you to review.",
        icon: "quick",
      },
      {
        id: "categories-required",
        title: "Category picker",
        description:
          "Pick from your own categories with emoji icons. Expenses always stay organized.",
        icon: "categories-required",
      },
    ],
  },
  {
    eyebrow: "◇ understand",
    title: "Know where your",
    titleEm: "money goes",
    description:
      "Summaries and budgets help you spot patterns without spreadsheets.",
    items: [
      {
        id: "weekly-insight",
        title: AI_LABELS.weeklyInsight,
        description:
          "A short AI summary of your last seven days on the dashboard. Refresh manually with a cooldown between updates.",
        icon: "weekly-insight",
      },
      {
        id: "category-breakdown",
        title: "Spending by category",
        description:
          "Bar breakdown for the current month. Tap a category to open filtered expenses.",
        icon: "category-breakdown",
      },
      {
        id: "budgets",
        title: "Monthly budgets",
        description:
          "Set a BDT limit per category for the current month. Progress rings on the dashboard show spent vs limit.",
        icon: "budgets",
      },
    ],
  },
  {
    eyebrow: "◇ settings",
    title: "Your account,",
    titleEm: "your rules",
    description:
      "Manage profile, categories, budgets, and optional AI — all under Settings.",
    items: [
      {
        id: "profile",
        title: "Profile & theme",
        description:
          "Edit your display name. Switch light, dark, or system theme — saved on this device.",
        icon: "profile",
      },
      {
        id: "categories-crud",
        title: "Categories",
        description:
          "Add, rename, or remove categories. Deleting one with expenses lets you reassign them first.",
        icon: "categories-crud",
      },
      {
        id: "budgets-settings",
        title: "Budget limits",
        description:
          "Set or remove monthly limits per category from the dedicated budgets screen.",
        icon: "budgets-settings",
      },
      {
        id: "gemini-key",
        title: AI_LABELS.settingsSection,
        description:
          "Bring your own Google Gemini API key (encrypted). Powers quick entry and weekly insight — optional.",
        icon: "gemini-key",
      },
      {
        id: "announcements",
        title: "Announcements",
        description:
          "In-app messages from PoysaPath. Unread items appear in the bell; read history lives in Settings.",
        icon: "announcements",
      },
    ],
  },
  {
    eyebrow: "◇ trust",
    title: "Private by",
    titleEm: "design",
    description:
      "Built for personal use in Bangladesh — your data stays tied to your account.",
    items: [
      {
        id: "auth",
        title: "Secure sign-in",
        description:
          "Email and password accounts via Supabase. Protected routes keep expenses behind login.",
        icon: "auth",
      },
      {
        id: "isolation",
        title: "Account isolation",
        description:
          "Each user only sees their own expenses, categories, and budgets. No shared household view.",
        icon: "isolation",
      },
      {
        id: "pwa",
        title: "Install as an app",
        description:
          "Add PoysaPath to your home screen for a standalone, app-like experience (PWA).",
        icon: "pwa",
      },
    ],
  },
];
