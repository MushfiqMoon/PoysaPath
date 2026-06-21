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
    title: "Track every taka at a",
    titleEm: "glance",
    description:
      "Your dashboard shows income, expenses, saved this month, goals, and upcoming reminders.",
    items: [
      {
        id: "dashboard",
        title: "Home dashboard",
        description:
          "Income, expenses, and saved this month — plus recent expenses, budgets, and category breakdown.",
        icon: "dashboard",
      },
      {
        id: "history",
        title: "History",
        description:
          "Browse expenses and income in one place. Switch tabs, filter by month, category, or payment method.",
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
    title: "Log money in",
    titleEm: "seconds",
    description:
      "Add expenses with manual or AI quick entry, or log income on the Income tab.",
    items: [
      {
        id: "income-manual",
        title: "Income entry",
        description:
          "Record salary, freelance pay, or other inflows with category, date, and optional payment method.",
        icon: "manual",
      },
      {
        id: "manual",
        title: "Manual expense entry",
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
    title: "Understand every",
    titleEm: "habit",
    description:
      "Goals, recurring reminders, and AI coaching help turn spending history into practical next steps.",
    items: [
      {
        id: "weekly-insight",
        title: "AI Money Coach",
        description:
          "A practical dashboard card compares recent spending, checks budget context, and suggests one next action.",
        icon: "weekly-insight",
      },
      {
        id: "goals",
        title: "Goals with history",
        description:
          "Add savings or debt payments over time, review contribution history, and remove mistakes safely.",
        icon: "goals",
      },
      {
        id: "spend-less-challenges",
        title: "Spend-less challenges",
        description:
          "Set a monthly category target, like Food under ৳6,000, and let expenses update progress automatically.",
        icon: "category-breakdown",
      },
      {
        id: "recurring",
        title: "Recurring payments",
        description:
          "Remember rent, subscriptions, internet, tuition, DPS installments, and record payments as expenses.",
        icon: "recurring",
      },
      {
        id: "category-breakdown",
        title: "Spending by category",
        description:
          "Bar breakdown for the current month. Tap a category to open filtered history.",
        icon: "category-breakdown",
      },
      {
        id: "monthly-report",
        title: "Monthly AI report",
        description:
          "Generate a friendly monthly summary with income totals, savings rate, wins, problem areas, category changes, and a next-month plan.",
        icon: "monthly-report",
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
          "Edit your display name and show your Google profile photo when you sign in with Google. Switch light, dark, or system theme — saved on this device.",
        icon: "profile",
      },
      {
        id: "categories-crud",
        title: "Categories",
        description:
          "Add, rename, or remove expense and income categories. Deleting one with entries lets you reassign them first.",
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
        id: "goals-settings",
        title: "Goals & reminders",
        description:
          "Manage financial goals, contribution history, spend-less challenges, and recurring money reminders from Settings.",
        icon: "goals",
      },
      {
        id: "gemini-key",
        title: AI_LABELS.settingsSection,
        description:
          `Bring your own Google Gemini API key (encrypted). Powers quick entry, ${AI_LABELS.weeklyInsight}, and monthly AI reports — optional.`,
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
          "Email and password or Google sign-in via Supabase Auth. Protected routes keep expenses behind login.",
        icon: "auth",
      },
      {
        id: "isolation",
        title: "Account isolation",
        description:
          "Each user only sees their own income, expenses, categories, budgets, and goals. Optional Connections share money reminders only — not financial records.",
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
