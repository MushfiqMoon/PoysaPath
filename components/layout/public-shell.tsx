import { Logo } from "@/components/shared/logo";
import { MarketingHeadline } from "@/components/marketing/marketing-headline";
import { PublicFooter } from "@/components/marketing/public-footer";
import { Card } from "@/components/ui/card";
import { FEATURE_SECTIONS } from "@/lib/features-catalog";

const sidebarSections = FEATURE_SECTIONS.slice(0, 3);

type PublicShellProps = {
  variant?: "landing" | "auth";
  children: React.ReactNode;
};

export function PublicShell({ variant = "landing", children }: PublicShellProps) {
  return (
    <div className="relative grid min-h-dvh grid-rows-[1fr_auto]">
      <div className="public-mesh pointer-events-none" aria-hidden />
      <div className="public-grid-bg" aria-hidden />

      <div className="relative z-10 flex min-h-0 flex-col md:flex-row">
        <aside className="hidden md:flex md:w-[44%] md:flex-col md:justify-between md:p-10 lg:p-14 xl:w-[42%]">
          <div>
            <Logo href="/" size={52} showWordmark />
            <h1
              className="mt-10 max-w-sm text-[length:var(--text-display)] font-semibold leading-tight tracking-tight text-text"
              style={{ letterSpacing: "-0.02em" }}
            >
              Track every <em className="marketing-em">taka</em>, every day.
            </h1>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-text-muted">
              {variant === "auth"
                ? "Your private expense tracker — simple, fast, and made for daily use in Bangladesh."
                : "PoysaPath helps you understand daily spending without spreadsheets or hassle."}
            </p>
          </div>

          <ul className="landing-feature-list mt-12 space-y-3">
            {sidebarSections.map((section) => (
              <li key={section.eyebrow}>
                <Card padding="sm" className="marketing-stat-card flex gap-3 bg-surface/80">
                  <span
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/12 text-accent"
                    aria-hidden
                  >
                    <span className="h-2 w-2 rounded-full bg-accent" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-text">
                      <MarketingHeadline
                        title={section.title}
                        titleEm={section.titleEm}
                      />
                    </p>
                    <p className="mt-0.5 text-sm leading-relaxed text-text-muted">
                      {section.description}
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

      <PublicFooter />
    </div>
  );
}
