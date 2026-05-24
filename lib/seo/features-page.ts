import type { Metadata } from "next";

import { FEATURE_SECTIONS } from "@/lib/features-catalog";
import { getSiteUrl } from "@/lib/seo/site-url";

export const FEATURES_PAGE_TITLE =
  "PoysaPath Features | BDT Expense Tracker, Budgets & AI Quick Entry";

export const FEATURES_PAGE_DESCRIPTION =
  "Explore PoysaPath features for Bangladesh: track daily spending in BDT (taka), monthly category budgets, expense history with filters, optional Gemini quick entry and weekly insights, custom categories, and private accounts. Free to start.";

export const FEATURES_KEYWORDS = [
  "PoysaPath features",
  "BDT expense tracker features",
  "Bangladesh expense app",
  "taka budget app",
  "daily expense tracker Bangladesh",
  "expense tracker with budgets",
  "AI expense entry Bangla",
  "Gemini expense parser",
  "personal finance app Bangladesh",
  "monthly budget tracker BDT",
  "category expense tracker",
  "private expense app",
];

const FEATURES_FAQ = [
  {
    question: "What is PoysaPath?",
    answer:
      "PoysaPath is a personal expense tracker built for daily spending in Bangladesh. You log amounts in BDT, review today and month totals on a dashboard, and optionally use your own Google Gemini API key for quick text entry and weekly insights.",
  },
  {
    question: "Is PoysaPath free to use?",
    answer:
      "You can sign up and start tracking for free. Optional AI features require your own Gemini API key from Google AI Studio.",
  },
  {
    question: "Does PoysaPath support Bangladeshi Taka (BDT)?",
    answer:
      "Yes. Amounts are tracked in BDT (৳), and dates follow Asia/Dhaka so “today” and monthly totals match local daily use.",
  },
  {
    question: "Do I need AI to use PoysaPath?",
    answer:
      "No. Manual expense entry, dashboards, categories, and budgets work without AI. Quick entry and weekly insight are optional and powered by your own Gemini key if you choose to add one.",
  },
  {
    question: "Is my expense data private?",
    answer:
      "Each account only sees its own expenses, categories, and budgets. Your data is not shared with other users on the platform.",
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
          alt: "PoysaPath — BDT expense tracker for Bangladesh",
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
          "Track every taka, every day — a BDT expense tracker for Bangladesh.",
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
        description: "Free to start — create an account to track expenses.",
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
      description: "Capabilities available in the PoysaPath expense tracker.",
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
