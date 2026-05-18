import Link from "next/link";

import { Logo } from "@/components/logo";

export const metadata = {
  title: "Privacy policy — PoysaPath",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-full bg-bg px-4 py-10">
      <article className="mx-auto max-w-2xl space-y-6 text-text">
        <Logo href="/" size={40} showWordmark />
        <h1 className="text-2xl font-semibold">Privacy policy</h1>
        <p className="text-sm text-text-muted">Last updated: May 18, 2026</p>

        <section className="space-y-3 text-sm leading-relaxed text-text-muted">
          <p>
            PoysaPath helps you track personal expenses in BDT. This policy
            describes what we store and how we use it.
          </p>
          <h2 className="text-base font-medium text-text">What we collect</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Account email and display name (Supabase Auth)</li>
            <li>Expenses, categories, budgets, and optional AI insight text</li>
            <li>
              Your Google Gemini API key, stored encrypted (if you enable AI in
              Settings)
            </li>
            <li>Technical logs from hosting (e.g. Vercel) for reliability</li>
          </ul>
          <h2 className="text-base font-medium text-text">How we use data</h2>
          <p>
            Your data powers the app for you only. Row-level security in our
            database ensures each user sees only their own records. If you add a
            Gemini API key, AI requests use your key and are sent to Google under
            your account; we store only an encrypted copy of the key.
          </p>
          <h2 className="text-base font-medium text-text">Your choices</h2>
          <p>
            Data export may be offered in a future update. To request a copy of
            your data or delete your account, contact the app operator or use a
            future in-app delete flow.
          </p>
          <h2 className="text-base font-medium text-text">Contact</h2>
          <p>
            Questions about privacy? Use the support channel listed on your
            deployment or project README.
          </p>
        </section>

        <Link href="/" className="text-sm text-accent hover:underline">
          ← Back to home
        </Link>
      </article>
    </div>
  );
}
