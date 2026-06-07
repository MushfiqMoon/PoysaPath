import type { Metadata } from "next";

import { FEATURE_SECTIONS } from "@/lib/features-catalog";
import { getSiteUrl } from "@/lib/seo/site-url";

export const FEATURES_PAGE_TITLE =
  "PoysaPath Features | BDT Cash-Flow Tracker, Income, Budgets & AI";

export const FEATURES_PAGE_DESCRIPTION =
  "Explore PoysaPath for Bangladesh: log income and expenses in BDT, see Income · Expenses · Saved on your dashboard, browse History, set budgets and goals, manage recurring reminders, and optionally use Gemini for quick entry, Money Coach, and monthly AI reports. Sign in with email or Google. Free to start.";

export const FEATURES_KEYWORDS = [
  "PoysaPath features",
  "BDT cash flow tracker",
  "Bangladesh expense app",
  "income expense tracker Bangladesh",
  "taka budget app",
  "daily expense tracker Bangladesh",
  "expense tracker with budgets",
  "expense tracker goals Bangladesh",
  "recurring bill reminder app",
  "AI expense entry Bangla",
  "Gemini expense parser",
  "Money Coach expense tracker",
  "monthly expense report AI",
  "savings rate tracker Bangladesh",
  "Google sign in expense app",
  "personal finance app Bangladesh",
  "monthly budget tracker BDT",
  "category expense tracker",
  "private expense app",
];

const FEATURES_FAQ = [
  {
    question: "What is PoysaPath?",
    answer:
      "PoysaPath is a personal cash-flow tracker built for daily use in Bangladesh. You log income and expenses in BDT, review Income · Expenses · Saved on your dashboard, browse History with filters, set budgets and financial goals, track recurring reminders, and optionally use your own Google Gemini API key for quick expense entry, Money Coach, and monthly AI reports with savings rate.",
  },
  {
    question: "Is PoysaPath free to use?",
    answer:
      "You can sign up and start tracking for free. Optional AI features require your own Gemini API key from Google AI Studio.",
  },
  {
    question: "Can I sign in with Google?",
    answer:
      "Yes. You can create an account with email and password or continue with Google. Google sign-in can also import your name and profile photo into your PoysaPath profile.",
  },
  {
    question: "Does PoysaPath support Bangladeshi Taka (BDT)?",
    answer:
      "Yes. Amounts are tracked in BDT (৳), and dates follow Asia/Dhaka so “today” and monthly totals match local daily use.",
  },
  {
    question: "Can I track income as well as expenses?",
    answer:
      "Yes. Log income on Add → Income and review it alongside expenses on History. Your dashboard shows Income, Expenses, and Saved this month. Money Coach and monthly reports include your savings rate when you log income.",
  },
  {
    question: "Do I need AI to use PoysaPath?",
    answer:
      "No. Manual income and expense entry, dashboards, History, categories, budgets, goals, and recurring reminders work without AI. Quick expense entry, Money Coach, and monthly AI reports are optional and powered by your own Gemini key if you choose to add one.",
  },
  {
    question: "Is my data private?",
    answer:
      "Each account only sees its own income, expenses, categories, budgets, goals, and reminders. Your data is not shared with other users on the platform.",
  },
] as const;

function allFeatureItems() {
  return FEATURE_SECTIONS.flatMap((section) => section.items);
}

export function buildFeaturesPageMetadata(): Metadata {
  return {
    title: FEATURES_PAGE_TITLE,
    description: FEATURES_PAGE_DESCRIPTION,
    keywords: [...FEATURES_KEYWORDS],
    alternates: {
      canonical: "/",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
      },
    },
    openGraph: {
      title: FEATURES_PAGE_TITLE,
      description: FEATURES_PAGE_DESCRIPTION,
      url: "/",
      siteName: "PoysaPath",
      locale: "en_BD",
      type: "website",
      images: [
        {
          url: "/logo.png",
          width: 512,
          height: 512,
          alt: "PoysaPath — BDT cash-flow tracker for Bangladesh",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: FEATURES_PAGE_TITLE,
      description: FEATURES_PAGE_DESCRIPTION,
      images: ["/logo.png"],
    },
  };
}

/** Schema.org graphs for the public marketing home page. */
export function buildFeaturesPageJsonLd(): Record<string, unknown>[] {
  const siteUrl = getSiteUrl();
  const pageUrl = siteUrl;
  const items = allFeatureItems();

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: FEATURES_PAGE_TITLE,
      description: FEATURES_PAGE_DESCRIPTION,
      inLanguage: "en-BD",
      isPartOf: {
        "@type": "WebSite",
        "@id": `${siteUrl}#website`,
        name: "PoysaPath",
        url: siteUrl,
        description:
          "Track every taka, every day — a BDT cash-flow tracker for Bangladesh.",
      },
      about: {
        "@type": "SoftwareApplication",
        "@id": `${siteUrl}#app`,
      },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}#app`,
      name: "PoysaPath",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "BDT",
        description: "Free to start — create an account to track income and expenses.",
      },
      description: FEATURES_PAGE_DESCRIPTION,
      url: siteUrl,
      featureList: items.map((item) => item.title),
      areaServed: {
        "@type": "Country",
        name: "Bangladesh",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: pageUrl,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "PoysaPath product features",
      description: "Capabilities available in the PoysaPath cash-flow tracker.",
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.title,
        description: item.description,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FEATURES_FAQ.map((entry) => ({
        "@type": "Question",
        name: entry.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: entry.answer,
        },
      })),
    },
  ];
}
