import Link from "next/link";

import { Logo } from "@/components/logo";

export const metadata = {
  title: "Terms of use — PoysaPath",
};

export default function TermsPage() {
  return (
    <div className="min-h-full bg-bg px-4 py-10">
      <article className="mx-auto max-w-2xl space-y-6 text-text">
        <Logo href="/" size={40} showWordmark />
        <h1 className="text-2xl font-semibold">Terms of use</h1>
        <p className="text-sm text-text-muted">Last updated: May 17, 2026</p>

        <section className="space-y-3 text-sm leading-relaxed text-text-muted">
          <p>
            By using PoysaPath you agree to these terms. If you do not agree,
            do not use the service.
          </p>
          <h2 className="text-base font-medium text-text">Service</h2>
          <p>
            PoysaPath is provided as-is for personal expense tracking. Features
            may change; we aim to give reasonable notice for breaking changes.
          </p>
          <h2 className="text-base font-medium text-text">Your responsibility</h2>
          <p>
            Keep your login secure. You are responsible for the accuracy of
            amounts and categories you enter. AI suggestions are helpers, not
            financial advice.
          </p>
          <h2 className="text-base font-medium text-text">Acceptable use</h2>
          <p>
            Do not abuse the API, attempt to access other users&apos; data, or
            use the app for unlawful purposes.
          </p>
          <h2 className="text-base font-medium text-text">Limitation</h2>
          <p>
            We are not liable for indirect damages or data loss beyond what
            applicable law requires. Back up important records via CSV export.
          </p>
        </section>

        <Link href="/" className="text-sm text-accent hover:underline">
          ← Back to home
        </Link>
      </article>
    </div>
  );
}
