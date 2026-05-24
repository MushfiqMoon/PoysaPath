import Link from "next/link";

import { FeaturesPreviewCard } from "@/components/features-preview-card";
import { Logo } from "@/components/logo";
import { MarketingHeadline } from "@/components/marketing-headline";
import { Button } from "@/components/ui/button";

const MARQUEE_ITEMS = [
  "LOG",
  "BUDGET",
  "INSIGHT",
  "CATEGORIES",
  "QUICK ENTRY",
  "BDT",
  "DHAKA",
  "EXPENSES",
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
                title="Everything you need to track every"
                titleEm="taka"
              />
            </h1>
            <p className="features-hero__sub">
              A full look at PoysaPath — daily BDT tracking, budgets, categories, and
              optional Gemini helpers for quick entry and weekly insight.
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
              <span>free to start</span>
              <span>private account</span>
              <span>works on mobile</span>
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
