import Link from "next/link";

import { Logo } from "@/components/logo";
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
        <aside className="hidden md:flex md:w-[45%] md:flex-col md:justify-between md:p-10 lg:p-14">
          <div>
            <Logo href="/" size={56} showWordmark />
            <h1 className="mt-10 max-w-sm text-3xl font-semibold leading-tight tracking-tight text-text lg:text-4xl">
              Track every taka, every day.
            </h1>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-text-muted">
              {variant === "auth"
                ? "Your private expense tracker — simple, fast, and made for daily use in Bangladesh."
                : "PoysaPath helps you understand daily spending without spreadsheets or hassle."}
            </p>
          </div>

          <ul className="mt-12 space-y-4">
            {features.map((feature) => (
              <li key={feature.title} className="flex gap-3">
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent"
                  aria-hidden
                />
                <div>
                  <p className="font-medium text-text">{feature.title}</p>
                  <p className="mt-0.5 text-sm text-text-muted">
                    {feature.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        <main className="flex min-h-0 flex-1 flex-col justify-center px-4 py-8 md:w-[55%] md:px-10 md:py-10 lg:px-14">
          <div className="mx-auto w-full max-w-md">{children}</div>
        </main>
      </div>

      <footer className="relative z-10 shrink-0 px-4 py-4 text-center text-xs text-text-muted md:px-10">
        <Link href="/privacy" className="hover:text-text">
          Privacy
        </Link>
        <span className="mx-2" aria-hidden>
          ·
        </span>
        <Link href="/terms" className="hover:text-text">
          Terms
        </Link>
      </footer>
    </div>
  );
}
