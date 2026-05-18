import Link from "next/link";
import type { Metadata } from "next";

import { Logo } from "@/components/logo";
import { GEMINI_CONTACT } from "@/lib/gemini/disabled-message";

const title = "Terms of use — PoysaPath";
const description =
  "Terms for using PoysaPath — personal expense tracking in BDT, optional AI features, and your responsibilities as a user.";

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
    <div className="min-h-full bg-bg px-4 py-10">
      <article className="mx-auto max-w-2xl space-y-6 text-text">
        <Logo href="/" size={40} showWordmark />
        <h1 className="text-2xl font-semibold">Terms of use</h1>
        <p className="text-sm text-text-muted">Last updated: May 18, 2026</p>

        <section className="space-y-3 text-sm leading-relaxed text-text-muted">
          <p>
            By using PoysaPath (including this website and a registered account)
            you agree to these terms. If you do not agree, do not use the
            service.
          </p>

          <h2 className="text-base font-medium text-text">Service</h2>
          <p>
            PoysaPath is provided as-is for personal expense tracking in BDT.
            Features may change; we aim to give reasonable notice for important
            breaking changes, including via in-app announcements where
            practical.
          </p>

          <h2 className="text-base font-medium text-text">AI features</h2>
          <p>
            AI features (Quick entry parsing and weekly insights) are optional.
            They are disabled until you add your own Google Gemini API key in
            Settings → AI. You are responsible for obtaining and complying with
            Google&apos;s terms, quotas, and billing for that key. PoysaPath does
            not provide a shared paid AI quota for all users.
          </p>
          <p>
            AI output may be wrong. You must review parsed amounts, categories,
            and dates before saving an expense. AI suggestions are helpers, not
            financial, tax, or legal advice.
          </p>

          <h2 className="text-base font-medium text-text">Your responsibility</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Keep your login and API key secure</li>
            <li>You are responsible for the accuracy of amounts and categories you enter</li>
            <li>Do not share your account or API key with others</li>
          </ul>

          <h2 className="text-base font-medium text-text">Acceptable use</h2>
          <p>
            Do not abuse the service or APIs, attempt to access other users&apos;
            data, scrape the app, or use PoysaPath for unlawful purposes.
          </p>

          <h2 className="text-base font-medium text-text">In-app announcements</h2>
          <p>
            We may show product updates inside the app. These are informational
            only and do not change these terms unless we publish an updated
            version with a new date.
          </p>

          <h2 className="text-base font-medium text-text">Limitation of liability</h2>
          <p>
            To the extent permitted by law, we are not liable for indirect
            damages, loss of profits, or data loss. You are responsible for
            keeping your own records. A data export API may be available; backup
            important records yourself where export is offered.
          </p>

          <h2 className="text-base font-medium text-text">Contact</h2>
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

        <Link href="/" className="text-sm text-accent hover:underline">
          ← Back to home
        </Link>
      </article>
    </div>
  );
}
