import Link from "next/link";
import type { Metadata } from "next";

import { BackLink } from "@/components/back-link";
import { NavPath } from "@/components/forward-link";
import { Logo } from "@/components/logo";
import { Card } from "@/components/ui/card";
import { GEMINI_CONTACT } from "@/lib/gemini/disabled-message";

const title = "Privacy policy — PoysaPath";
const description =
  "How PoysaPath collects, stores, and protects your data — including expenses, optional AI (Gemini), and in-app announcements.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title,
    description,
    url: "/privacy",
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

export default function PrivacyPage() {
  return (
    <div className="relative min-h-dvh">
      <div className="public-mesh pointer-events-none fixed inset-0" aria-hidden />

      <article className="relative z-10 mx-auto max-w-2xl space-y-6 px-4 py-10 text-text">
        <Logo href="/" size={40} showWordmark />
        <Card elevated padding="lg" className="space-y-6">
          <div>
            <h1
              className="text-2xl font-semibold tracking-tight text-text"
              style={{ letterSpacing: "-0.02em" }}
            >
              Privacy policy
            </h1>
            <p className="mt-2 text-sm text-text-muted">Last updated: May 18, 2026</p>
          </div>

          <section className="space-y-3 text-sm leading-relaxed text-text-muted">
          <p>
            PoysaPath helps you track personal expenses in BDT. This policy
            describes what we collect and how we use it when you visit our
            website or use an account. The public home and sign-in pages do not
            collect expense data until you register.
          </p>

          <h2 className="text-base font-semibold text-text">What we collect</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Account email and display name (Supabase Auth)</li>
            <li>Expenses, categories, budgets, and optional weekly AI insight text</li>
            <li>
              In-app product announcements and whether you have marked them read
            </li>
            <li>
              Your Google Gemini API key, stored encrypted, if you enable AI in{" "}
              <NavPath parts={["Settings", "AI"]} /> (optional)
            </li>
            <li>Technical logs from hosting (e.g. Vercel) for reliability and security</li>
          </ul>

          <h2 className="text-base font-semibold text-text">How we use data</h2>
          <p>
            Your data powers the app for you only. Row-level security in our
            database (Supabase) ensures each user sees only their own records.
          </p>
          <p>
            <strong className="font-medium text-text">AI features (optional).</strong>{" "}
            AI is off until you add your own free Gemini API key in Settings. If
            you enable AI, Quick entry sends the expense text you type to Google
            for parsing; weekly insights send category totals for the current
            week. Those requests use your key under your Google account. We
            store only an encrypted copy of your key so the app can run AI on
            your behalf; we do not use a shared app-wide API key for your data.
          </p>
          <p>
            <strong className="font-medium text-text">Announcements.</strong>{" "}
            We may publish broadcast messages in the app (for example, feature
            updates). We store which messages you have marked as read.
          </p>

          <h2 className="text-base font-semibold text-text">Third-party services</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="font-medium text-text">Supabase</strong> —
              authentication and database hosting
            </li>
            <li>
              <strong className="font-medium text-text">Vercel</strong> — app
              hosting
            </li>
            <li>
              <strong className="font-medium text-text">Google (Gemini)</strong>{" "}
              — only if you add an API key and use AI features; governed by
              Google&apos;s terms and privacy policy as well
            </li>
          </ul>

          <h2 className="text-base font-semibold text-text">Your choices</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Remove your Gemini API key anytime in <NavPath parts={["Settings", "AI"]} />
            </li>
            <li>Mark in-app announcements as read; view past ones in Settings</li>
            <li>
              Request a copy of your data or account deletion by contacting us
              (see below)
            </li>
          </ul>
          <p>
            Broader data export may be offered in a future update. An export API
            may exist before it appears in the Settings UI.
          </p>

          <h2 className="text-base font-semibold text-text">Contact</h2>
          <p>
            Questions about privacy? Contact {GEMINI_CONTACT.name}:{" "}
            <a
              href={GEMINI_CONTACT.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              LinkedIn
            </a>
            {" or "}
            <a
              href={GEMINI_CONTACT.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              WhatsApp {GEMINI_CONTACT.whatsapp}
            </a>
            .
          </p>
        </section>

          <BackLink href="/" className="text-accent hover:underline">
            Back to home
          </BackLink>
        </Card>
      </article>
    </div>
  );
}
