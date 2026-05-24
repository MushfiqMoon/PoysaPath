import Link from "next/link";
import { FaLinkedin, FaWhatsapp } from "react-icons/fa";

import {
  GEMINI_CONTACT,
  GEMINI_DISABLED_FREE_NOTE,
  GEMINI_DISABLED_HEADLINE,
  GEMINI_DISABLED_SUMMARY,
  GEMINI_HELP_URL,
  GEMINI_SETTINGS_PATH,
} from "@/lib/gemini/disabled-message";
import { AI_LABELS } from "@/lib/gemini/labels";

type AiDisabledNoticeProps = {
  compact?: boolean;
};

export function AiDisabledNotice({ compact = false }: AiDisabledNoticeProps) {
  return (
    <div
      className="rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed text-text-muted"
      role="status"
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent"
          aria-hidden
        >
          {AI_LABELS.sparkle} 
        </div>
        <div className="min-w-0">
          <p className="font-medium text-text">{GEMINI_DISABLED_HEADLINE} </p>
          <p className="mt-1">{GEMINI_DISABLED_SUMMARY}</p>
        </div>
      </div>
      {!compact && (
        <p className="mt-2">{GEMINI_DISABLED_FREE_NOTE}</p>
      )}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <a
          href={GEMINI_HELP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 font-medium text-accent transition-colors hover:bg-accent/15"
        >
        Get free API key
        </a>
        <Link
          href={GEMINI_SETTINGS_PATH}
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-bg px-3 py-2 font-medium text-text transition-[background-image,colors]"
        >
          Open {AI_LABELS.settingsPath}
        </Link>
      </div>
      <p className="mt-3 text-xs">
        Need help setting it up?
      </p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <a
          href={GEMINI_CONTACT.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-border bg-bg px-3 py-1.5 text-xs font-medium text-text transition-[background-image,colors]"
        >
          <FaLinkedin className="h-4 w-4 text-[#0A66C2]" aria-hidden />
          LinkedIn
        </a>
        <a
          href={GEMINI_CONTACT.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-border bg-bg px-3 py-1.5 text-xs font-medium text-text transition-[background-image,colors]"
        >
          <FaWhatsapp className="h-4 w-4 text-[#25D366]" aria-hidden />
          WhatsApp {GEMINI_CONTACT.whatsapp}
        </a>
      </div>
    </div>
  );
}
