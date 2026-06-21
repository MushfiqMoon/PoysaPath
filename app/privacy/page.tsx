import Link from "next/link";
import type { Metadata } from "next";

import { BackLink } from "@/components/shared/back-link";
import { NavPath } from "@/components/shared/forward-link";
import { Logo } from "@/components/shared/logo";
import { Card } from "@/components/ui/card";
import { GEMINI_CONTACT } from "@/lib/gemini/disabled-message";
import { AI_LABELS } from "@/lib/gemini/labels";

const title = "Privacy policy — PoysaPath";
const description =
  "How PoysaPath collects, stores, and protects your data — including expenses, goals, optional AI (Gemini), Google sign-in, and in-app announcements.";

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
            <p className="mt-2 text-sm text-text-muted">Last updated: June 1, 2026</p>
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
              <li>
                Account email, display name, and optional profile photo URL
                (email/password sign-up via Supabase Auth, or Google sign-in)
              </li>
              <li>
                Expenses, categories, budgets, financial goals, goal contribution
                history, and recurring payment reminders
              </li>
              <li>
                Cached AI text when you use optional features ({AI_LABELS.weeklyInsight}{" "}
                on the dashboard, monthly AI reports in Settings)
              </li>
              <li>
                Your monthly report language preference (English or Bangla) if
                you generate reports
              </li>
              <li>
                In-app product announcements and whether you have marked them read
              </li>
              <li>
                Optional connections (mutual accept by email) and shared money
                reminders you send or receive — not your expense or income records
              </li>
              <li>
                Your Google Gemini API key, stored encrypted, if you enable AI in{" "}
                <NavPath parts={["Settings", "AI"]} /> (optional)
              </li>
              <li>
                Session cookies needed to keep you signed in, plus optional
                device-local preferences (see below)
              </li>
              <li>
                Technical logs from hosting (e.g. Vercel) for reliability and
                security
              </li>
            </ul>

            <h2 className="text-base font-semibold text-text">How we use data</h2>
            <p>
              Your data powers the app for you only. Row-level security in our
              database (Supabase) ensures each user sees only their own financial
              records. If you use optional Connections, you and another user you
              both approve can exchange shared money reminders only — not expenses,
              income, budgets, or goals.
            </p>
            <p>
              <strong className="font-medium text-text">Sign-in.</strong> If you
              use Google sign-in, we receive your Google account email, name, and
              profile picture URL from Google to create and maintain your account.
              We store your display name and avatar URL in your profile.
            </p>
            <p>
              <strong className="font-medium text-text">AI features (optional).</strong>{" "}
              AI is off until you add your own free Gemini API key in Settings.
              If you enable AI:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong className="font-medium text-text">Quick entry</strong>{" "}
                sends the expense text you type to Google for parsing
              </li>
              <li>
                <strong className="font-medium text-text">
                  {AI_LABELS.weeklyInsight}
                </strong>{" "}
                sends category spending totals for the current and previous
                seven-day periods, plus active budget limits, to Google for a
                coaching summary
              </li>
              <li>
                <strong className="font-medium text-text">Monthly AI report</strong>{" "}
                sends category totals for the current and previous month to Google
                for a written report; we store the generated report text in your
                account
              </li>
            </ul>
            <p>
              Those requests use your key under your Google account. We store
              only an encrypted copy of your key so the app can run AI on your
              behalf; we do not use a shared app-wide API key for your data.
            </p>
            <p>
              <strong className="font-medium text-text">Announcements.</strong>{" "}
              We may publish broadcast messages in the app (for example, feature
              updates). We store which messages you have marked as read.
            </p>

            <h2 className="text-base font-semibold text-text">
              Cookies and device storage
            </h2>
            <p>
              We use essential cookies to maintain your login session (Supabase
              Auth). We do not use advertising or third-party analytics cookies.
            </p>
            <p>
              The app may save small preferences on your device (for example,
              light/dark theme and UI choices) in your browser&apos;s local
              storage. This stays on your device and is not sent to our servers.
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
                <strong className="font-medium text-text">Google</strong> — sign-in
                (OAuth) if you choose &quot;Continue with Google&quot;; Gemini AI
                only if you add an API key and use AI features. Google&apos;s
                terms and privacy policy also apply to those services
              </li>
            </ul>
            <p>
              Supabase and Vercel may process data on servers outside Bangladesh.
              We use them only to operate the service.
            </p>

            <h2 className="text-base font-semibold text-text">Data retention</h2>
            <p>
              We keep your account data while your account is active. If you
              request account deletion, we delete or anonymize your personal data
              within a reasonable time, except where we must keep limited records
              for legal or security reasons.
            </p>

            <h2 className="text-base font-semibold text-text">Your choices</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Remove your Gemini API key anytime in{" "}
                <NavPath parts={["Settings", "AI"]} />
              </li>
              <li>
                Mark in-app announcements as read; view past ones in Settings
              </li>
              <li>
                Export expenses as CSV via our API (Settings UI may not show this
                yet)
              </li>
              <li>
                Request a copy of your data or account deletion by contacting us
                (see below)
              </li>
            </ul>

            <h2 className="text-base font-semibold text-text">Children</h2>
            <p>
              PoysaPath is not directed at children under 13. We do not knowingly
              collect personal data from anyone under 13. If you believe a child
              has provided us data, contact us and we will delete it.
            </p>

            <h2 className="text-base font-semibold text-text">Changes to this policy</h2>
            <p>
              We may update this policy from time to time. When we do, we change
              the &quot;Last updated&quot; date above. For important changes, we
              may also notify you in the app. Continued use after an update means
              you accept the revised policy.
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
