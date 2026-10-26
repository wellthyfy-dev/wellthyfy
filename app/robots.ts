import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Crawl everything public. Private areas are disallowed only to save crawl
 * budget — they are protected by sign-in and RLS, not by this file, and their
 * pages also carry `noindex`. Sign-in pages stay crawlable so crawlers can see
 * their `noindex`. CSS, JS and images are never blocked.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard", "/onboarding", "/api/", "/auth/", "/faculty/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
