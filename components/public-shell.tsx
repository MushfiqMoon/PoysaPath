import Link from "next/link";

import { Logo } from "@/components/logo";
import { Card } from "@/components/ui/card";
import { AI_LABELS } from "@/lib/gemini/labels";

const features = [
  {
    title: "Built for BDT",
    description: "Log spending in taka with familiar categories and formats.",
  },
  {
    title: AI_LABELS.quickEntry,
    description: "Describe an expense in plain language on the Add screen.",
  },
  {
    title: AI_LABELS.weeklyInsights,
    description: "See where your money went with a short dashboard summary.",
  },
];

type PublicShellProps = {
  variant?: "landing" | "auth";
  children: React.ReactNode;
};

export function PublicShell({ variant = "landing", children }: PublicShellProps) {
  return (
    <div className="relative grid min-h-dvh grid-rows-[1fr_auto]">
      <div className="public-mesh pointer-events-none" aria-hidden />

      <div className="relative z-10 flex min-h-0 flex-col md:flex-row">
        <aside className="hidden md:flex md:w-[44%] md:flex-col md:justify-between md:p-10 lg:p-14 xl:w-[42%]">
          <div>
            <Logo href="/" size={52} showWordmark />
            <h1
              className="mt-10 max-w-sm text-[length:var(--text-display)] font-semibold leading-tight tracking-tight text-text"
              style={{ letterSpacing: "-0.02em" }}
            >
              Track every taka, every day.
            </h1>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-text-muted">
              {variant === "auth"
                ? "Your private expense tracker — simple, fast, and made for daily use in Bangladesh."
                : "PoysaPath helps you understand daily spending without spreadsheets or hassle."}
            </p>
          </div>

          <ul className="mt-12 space-y-3">
            {features.map((feature) => (
              <li key={feature.title}>
                <Card padding="sm" className="flex gap-3 border-accent/10 bg-surface/80">
                  <span
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/12 text-accent"
                    aria-hidden
                  >
                    <span className="h-2 w-2 rounded-full bg-accent" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-text">{feature.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-text-muted">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </aside>

        <main className="flex min-h-0 flex-1 flex-col justify-center px-4 py-8 md:w-[56%] md:px-10 md:py-12 lg:px-14 xl:w-[58%]">
          <div className="mx-auto w-full max-w-md">
            {variant === "landing" && (
              <div className="mb-6 md:hidden">
                <Logo href="/" size={40} showWordmark />
              </div>
            )}
            {children}
          </div>
        </main>
      </div>

      <footer className="relative z-10 shrink-0 border-t border-border-soft [--border-inner:transparent] px-4 py-4 text-center text-xs text-text-muted backdrop-blur-sm md:px-10">
        <Link href="/privacy" className="transition-colors hover:text-text">
          Privacy
        </Link>
        <span className="mx-2" aria-hidden>
          ·
        </span>
        <Link href="/terms" className="transition-colors hover:text-text">
          Terms
        </Link>
      </footer>
    </div>
  );
}
