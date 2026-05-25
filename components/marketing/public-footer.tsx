import Link from "next/link";

export function PublicFooter() {
  return (
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
  );
}
