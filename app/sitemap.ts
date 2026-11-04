import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { serviceSlug, services } from "@/lib/site";
import { createPublicClient } from "@/lib/supabase/public";

// Rebuilt at most hourly, so newly approved courses appear without a deploy.
export const revalidate = 3600;

const img = (path: string) => `${SITE_URL}${path}`;

/**
 * Public, indexable, canonical URLs only. Sign-in, dashboards, admin and the
 * hidden faculty pages are deliberately absent (they are also noindex).
 *
 * Each page lists its key images (image sitemap) so they can appear in image
 * search. `lastModified` is left off the static pages rather than stamped with
 * "now" on every request — a date that always changes tells crawlers nothing.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
      images: [img("/home/hero-group.webp"), img("/logo-full.png"), img("/goal.webp")],
    },
    {
      url: `${SITE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.8,
      images: [img("/about/hero.webp"), img("/about/meditation.webp")],
    },
    {
      url: `${SITE_URL}/services`,
      changeFrequency: "monthly",
      priority: 0.9,
      images: services.map((s) => img(`/core-services/${serviceSlug(s.title)}.webp`)),
    },
    {
      url: `${SITE_URL}/courses`,
      changeFrequency: "weekly",
      priority: 0.9,
      images: [img("/courses/yoga.webp"), img("/courses/beautician.webp"), img("/courses/digital-marketing.webp")],
    },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.7 },
    { url: `${SITE_URL}/become-a-faculty`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/become-a-faculty/apply`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/privacy-policy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  return [...pages, ...(await publishedCourses())];
}

/** Every live course page, dated by its last real change. */
async function publishedCourses(): Promise<MetadataRoute.Sitemap> {
  try {
    const { data, error } = await createPublicClient()
      .from("courses")
      .select("slug, updated_at, published_at, cover_url")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(1000);
    if (error || !data) return [];
    return data.map((c) => ({
      url: `${SITE_URL}/courses/${c.slug}`,
      lastModified: c.updated_at ?? c.published_at ?? undefined,
      changeFrequency: "monthly" as const,
      priority: 0.8,
      ...(c.cover_url ? { images: [c.cover_url] } : {}),
    }));
  } catch {
    // Supabase unreachable: still serve the static pages.
    return [];
  }
}
