import Link from "next/link";
import type { Metadata } from "next";

import { BackLink } from "@/components/shared/back-link";
import { NavPath } from "@/components/shared/forward-link";
import { Logo } from "@/components/shared/logo";
import { Card } from "@/components/ui/card";
import { GEMINI_CONTACT } from "@/lib/gemini/disabled-message";
import { AI_LABELS } from "@/lib/gemini/labels";

const title = "Terms of use — PoysaPath";
const description =
  "Terms for using PoysaPath — personal expense tracking in BDT, optional AI features, Google sign-in, and your responsibilities as a user.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title,
    description,
    url: "/terms",
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

export default function TermsPage() {
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
              Terms of use
            </h1>
            <p className="mt-2 text-sm text-text-muted">Last updated: June 1, 2026</p>
          </div>

          <section className="space-y-3 text-sm leading-relaxed text-text-muted">
            <p>
              By using PoysaPath (including this website and a registered account)
              you agree to these terms. If you do not agree, do not use the
              service.
            </p>

            <h2 className="text-base font-semibold text-text">Eligibility</h2>
            <p>
              You must be at least 13 years old to use PoysaPath. By creating an
              account, you confirm that you meet this requirement.
            </p>

            <h2 className="text-base font-semibold text-text">Service</h2>
            <p>
              PoysaPath is provided as-is for personal expense tracking in BDT.
              It includes expenses, categories, budgets, financial goals, recurring
              reminders, optional AI features, and in-app announcements. Features
              may change; we aim to give reasonable notice for important breaking
              changes, including via in-app announcements where practical.
            </p>

            <h2 className="text-base font-semibold text-text">Sign-in</h2>
            <p>
              You may register with email and password or sign in with Google. If
              you use Google sign-in, you must also comply with Google&apos;s terms
              and privacy policy for that account. You are responsible for keeping
              your login credentials secure.
            </p>

            <h2 className="text-base font-semibold text-text">AI features</h2>
            <p>
              AI features (Quick entry parsing, {AI_LABELS.weeklyInsight}, and
              monthly AI reports) are optional. They are disabled until you add
              your own Google Gemini API key in{" "}
              <NavPath parts={["Settings", "AI"]} />. You are responsible for
              obtaining and complying with Google&apos;s terms, quotas, and billing
              for that key. PoysaPath does not provide a shared paid AI quota for
              all users.
            </p>
            <p>
              AI output may be wrong. You must review parsed amounts, categories,
              dates, and any coaching or report text before relying on it. AI
              suggestions are helpers, not financial, tax, or legal advice.
            </p>

            <h2 className="text-base font-semibold text-text">Your responsibility</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Keep your login and API key secure</li>
              <li>
                You are responsible for the accuracy of amounts and categories you
                enter
              </li>
              <li>Do not share your account or API key with others</li>
            </ul>

            <h2 className="text-base font-semibold text-text">Acceptable use</h2>
            <p>
              Do not abuse the service or APIs, attempt to access other users&apos;
              data, scrape the app, or use PoysaPath for unlawful purposes.
            </p>

            <h2 className="text-base font-semibold text-text">Account termination</h2>
            <p>
              You may stop using PoysaPath at any time. To delete your account and
              data, contact us (see below). We may suspend or terminate access if
              you violate these terms or abuse the service.
            </p>

            <h2 className="text-base font-semibold text-text">In-app announcements</h2>
            <p>
              We may show product updates inside the app. These are informational
              only and do not change these terms unless we publish an updated
              version with a new date.
            </p>

            <h2 className="text-base font-semibold text-text">Limitation of liability</h2>
            <p>
              To the extent permitted by law, we are not liable for indirect
              damages, loss of profits, or data loss. You are responsible for
              keeping your own records. A CSV export API is available; backup
              important records yourself.
            </p>

            <h2 className="text-base font-semibold text-text">Changes to these terms</h2>
            <p>
              We may update these terms from time to time. When we do, we change
              the &quot;Last updated&quot; date above. For important changes, we
              may also notify you in the app. Continued use after an update means
              you accept the revised terms.
            </p>

            <h2 className="text-base font-semibold text-text">Governing law</h2>
            <p>
              These terms are governed by the laws of Bangladesh, without regard
              to conflict-of-law rules. Any dispute should first be raised with us
              via the contact details below.
            </p>

            <h2 className="text-base font-semibold text-text">Contact</h2>
            <p>
              Questions about these terms? Contact {GEMINI_CONTACT.name}:{" "}
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
              . See also our{" "}
              <Link href="/privacy" className="text-accent hover:underline">
                Privacy policy
              </Link>
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
