import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";

import { MarketingHomePage } from "@/components/marketing/marketing-home-page";
import { buildFeaturesPageMetadata } from "@/lib/seo/features-page";

export const metadata: Metadata = buildFeaturesPageMetadata();

export default function HomePage() {
  return (
    <>
      <MarketingHomePage />
      <Analytics />
    </>
  );
}
