import Link from "next/link";
import type { Metadata } from "next";

import { Logo } from "@/components/logo";
import { PublicShell } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import { AI_LABELS } from "@/lib/gemini/labels";

const title = "PoysaPath | BDT Expense Tracker for Bangladesh";
const description =
  "Track daily spending in BDT with PoysaPath, a simple expense tracker for Bangladesh with quick AI entry and weekly insights.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "BDT expense tracker",
    "Bangladesh expense tracker",
    "daily spending tracker",
    "taka expense app",
    "PoysaPath",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "PoysaPath",
    locale: "en_BD",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "PoysaPath logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: ["/logo.png"],
  },
};

const featureCards = [
  {
    title: AI_LABELS.quickEntry,
    description: "Type “120 lunch hotel” and let the app fill the form for you.",
  },
  {
    title: "Today & month totals",
    description: "See spending at a glance on your dashboard.",
  },
  {
    title: "Your data, private",
    description: "Each account is isolated — only you see your expenses.",
  },
];

export default function LandingPage() {
  return (
    <PublicShell variant="landing">
      <div className="space-y-6 md:space-y-10">
        <div className="text-center md:text-left">
          <Logo
            href="/"
            size={64}
            showWordmark
            className="mx-auto justify-center md:mx-0 md:justify-start"
          />
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-text md:text-5xl">
            Daily expense tracker for Bangladesh
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-text-muted">
            A simple BDT expense tracker for daily spending in Bangladesh.
          </p>
        </div>

        <ul className="hidden gap-3 md:grid">
          {featureCards.map((card) => (
            <li key={card.title} className="glass-panel rounded-xl border p-4">
              <p className="font-medium text-text">{card.title}</p>
              <p className="mt-1 text-sm text-text-muted">{card.description}</p>
            </li>
          ))}
        </ul>

        <div className="glass-panel rounded-2xl border p-6 shadow-sm">
          <p className="text-center text-sm text-text-muted md:text-left">
            Free to start. Create an account in under a minute.
          </p>
          <div className="mt-5 space-y-3">
            <Link href="/signup" className="block">
              <Button fullWidth>Sign up</Button>
            </Link>
            <Link href="/login" className="block">
              <Button variant="secondary" fullWidth>
                Log in
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
