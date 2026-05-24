import type { Metadata } from "next";

import { MarketingHomePage } from "@/components/marketing-home-page";
import { buildFeaturesPageMetadata } from "@/lib/seo/features-page";

export const metadata: Metadata = buildFeaturesPageMetadata();

export default function HomePage() {
  return <MarketingHomePage />;
}
