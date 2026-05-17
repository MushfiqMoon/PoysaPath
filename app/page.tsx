import Link from "next/link";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <Logo size={72} showWordmark className="mx-auto justify-center" />
          <h1 className="mt-6 text-3xl font-semibold text-text">
            Track daily spending
          </h1>
          <p className="mt-3 text-lg text-text-muted">
            in ৳ — fast &amp; simple
          </p>
        </div>

        <p className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-muted">
          ✨ AI quick entry — describe expenses in plain language
        </p>

        <div className="space-y-3">
          <Link href="/signup" className="block">
            <Button fullWidth>Sign up</Button>
          </Link>
          <Link href="/login" className="block">
            <Button variant="secondary" fullWidth>
              Log in
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
