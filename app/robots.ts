import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/seo/site-url";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/privacy",
        "/terms",
        "/login",
        "/signup",
        "/forgot-password",
      ],
      disallow: [
        "/api/",
        "/dashboard",
        "/history",
        "/add",
        "/settings",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
