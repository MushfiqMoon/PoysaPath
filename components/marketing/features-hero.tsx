import Link from "next/link";

import { FeaturesPreviewCard } from "@/components/marketing/features-preview-card";
import { Logo } from "@/components/shared/logo";
import { MarketingHeadline } from "@/components/marketing/marketing-headline";
import { Button } from "@/components/ui/button";

const MARQUEE_ITEMS = [
  "INCOME",
  "EXPENSES",
  "SAVED",
  "HISTORY",
  "LOG",
  "GOALS",
  "MONEY COACH",
  "REPORTS",
  "REMINDERS",
  "CATEGORIES",
  "QUICK ENTRY",
  "BDT",
  "DHAKA",
];

export function FeaturesHero() {
  const marqueeTrack = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <section className="features-hero" aria-labelledby="features-hero-title">
      <div className="mx-auto min-w-0 max-w-6xl px-4 md:px-10">
        <div className="features-hero__top">
          <Logo href="/" size={44} showWordmark />
          <Link
            href="/login"
            className="text-sm font-medium text-accent transition-colors hover:text-accent-hover"
          >
            Log in
          </Link>
        </div>

        <div className="features-hero__live">
          <span className="features-hero__live-dot" aria-hidden />
          <span>BDT · Asia/Dhaka</span>
        </div>

        <div className="features-hero__layout">
          <div>
            <h1 id="features-hero-title" className="features-hero__title">
              <MarketingHeadline
                title="Track every taka. Understand every"
                titleEm="habit"
              />
            </h1>
            <p className="features-hero__sub">
              Log income and expenses in BDT, see what you saved this month, and
              use optional Gemini AI for quick entry, Money Coach, and monthly
              reports.
            </p>
            <div className="features-hero__ctas">
              <Link href="/signup" className="features-hero__cta">
                <Button fullWidth>Sign up free</Button>
              </Link>
              <Link href="/login" className="features-hero__cta">
                <Button variant="secondary" fullWidth>
                  Log in
                </Button>
              </Link>
            </div>
            <div className="features-hero__fineprint">
              <span>income + expenses</span>
              <span>built for BDT</span>
              <span>optional AI coach</span>
            </div>
          </div>

          <FeaturesPreviewCard />
        </div>

        <div className="features-hero__marquee" aria-hidden>
          <div className="features-hero__marquee-track">
            {marqueeTrack.map((item, index) => (
              <span key={`${item}-${index}`}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
