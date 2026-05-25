import Link from "next/link";

import { FeaturesHero } from "@/components/marketing/features-hero";
import { FeaturesMarketing } from "@/components/marketing/features-marketing";
import { PublicFooter } from "@/components/marketing/public-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FEATURE_SECTIONS } from "@/lib/features-catalog";
import { buildFeaturesPageJsonLd } from "@/lib/seo/features-page";

export function MarketingHomePage() {
  const jsonLd = buildFeaturesPageJsonLd();

  return (
    <>
      {jsonLd.map((graph) => (
        <JsonLd key={String(graph["@type"])} data={graph} />
      ))}

      <div className="marketing-home relative grid min-h-dvh w-full min-w-0 grid-rows-[1fr_auto] overflow-x-clip">
        <div className="public-mesh pointer-events-none fixed inset-0" aria-hidden />
        <div className="public-grid-bg" aria-hidden />

        <main className="relative z-10 min-w-0" id="main-content">
          <FeaturesHero />

          <div className="mx-auto min-w-0 w-full max-w-6xl px-4 pb-10 md:px-10 md:pb-12">
            <FeaturesMarketing sections={FEATURE_SECTIONS} />

            <Card elevated padding="lg" className="mt-12 text-center md:text-left">
              <p className="text-sm text-text-muted">
                Ready to track every taka, every day?
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
                <Link href="/signup" className="sm:flex-1 md:flex-none">
                  <Button fullWidth className="sm:min-w-[10rem]">
                    Sign up free
                  </Button>
                </Link>
                <Link href="/login" className="sm:flex-1 md:flex-none">
                  <Button variant="secondary" fullWidth className="sm:min-w-[10rem]">
                    Log in
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </main>

        <PublicFooter />
      </div>
    </>
  );
}
