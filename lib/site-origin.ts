import { headers } from "next/headers";
import { siteConfig } from "./site";

/**
 * Public origin used to build absolute links in emails.
 *
 * `NEXT_PUBLIC_SITE_URL` wins when set (set it in production). Otherwise the
 * request host is used, so links built while testing locally point at localhost
 * instead of the live site.
 */
export async function siteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return siteConfig.url;
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
