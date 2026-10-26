import type { Metadata } from "next";
import { siteConfig, socialProfiles } from "./site";

/**
 * Search / social metadata in one place.
 *
 * Canonical host: https://www.wellthyfy.in (no trailing slash). Verified on the
 * live site — http://, https://wellthyfy.in and trailing-slash URLs all answer
 * with a permanent 308 redirect to the www form.
 */
export const SITE_URL = siteConfig.url;

/** The brand people search for. */
export const BRAND = "Wellthyfy";

/** Registered company name (schema `legalName`). */
export const LEGAL_NAME = "Wellthyfy Lifestyle Ventures Private Limited";

/** Stable identifier for the Organization entity, referenced by other schema. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/**
 * Official logo used for the Organization (square-ish, transparent PNG,
 * 900×882, publicly served — Google needs at least 112×112).
 */
export const ORGANIZATION_LOGO = {
  url: `${SITE_URL}/logo-full.png`,
  width: 900,
  height: 882,
};

/** 1200×630 social share card built from the official logo. */
export const DEFAULT_OG_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "Wellthyfy Lifestyle Ventures — Empowering Health, Wealth & Happiness",
};

/**
 * What the company does, taken from the site's own About content. Used for
 * the homepage description and the Organization schema.
 */
export const COMPANY_DESCRIPTION =
  "Wellthyfy is a holistic lifestyle company in Puducherry, India, empowering individuals through wellness programs, financial education, skill development, community growth and professional courses.";

/**
 * Official social profiles for `sameAs` (from `socialProfiles` in lib/site.ts).
 * Add new accounts there; only list profiles Wellthyfy actually owns.
 */
export const SOCIAL_PROFILES: string[] = Object.values(socialProfiles);

/**
 * Complete metadata for a public page: title, description, canonical URL and
 * matching Open Graph / X card tags.
 *
 * Next.js replaces (does not merge) a parent's `openGraph` / `twitter` objects
 * when a page sets its own, so every page builds them in full here — otherwise
 * pages lose the site name and share image, and their X card shows the
 * homepage title.
 */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  image,
  noindex = false,
}: {
  /** Page title. Gets " | Wellthyfy" appended unless `absoluteTitle`. */
  title: string;
  description: string;
  /** Path from the site root, e.g. "/courses". "/" for the homepage. */
  path: string;
  absoluteTitle?: boolean;
  image?: { url: string; width?: number; height?: number; alt?: string };
  noindex?: boolean;
}): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${BRAND}`;
  const url = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
  const img = image ?? DEFAULT_OG_IMAGE;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path === "/" ? "/" : path },
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: BRAND,
      url,
      title: fullTitle,
      description,
      images: [img],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [img.url],
    },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

/**
 * Serialise JSON-LD for a <script> tag. JSON.stringify alone does not escape
 * "<", so a value containing "</script>" could break out of the tag.
 */
export function serializeJsonLd(data: unknown) {
  // <, >, & and the two JS line separators, written as unicode escapes.
  const unsafe = new Set([0x3c, 0x3e, 0x26, 0x2028, 0x2029]);
  const backslash = String.fromCharCode(92);
  let out = "";
  for (const ch of JSON.stringify(data)) {
    const code = ch.charCodeAt(0);
    out += unsafe.has(code) ? `${backslash}u${code.toString(16).padStart(4, "0")}` : ch;
  }
  return out;
}
