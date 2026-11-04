import {
  BRAND,
  COMPANY_DESCRIPTION,
  GEO,
  GOOGLE_BUSINESS_PROFILE,
  LEGAL_NAME,
  ORGANIZATION_ID,
  ORGANIZATION_LOGO,
  SITE_URL,
  SOCIAL_PROFILES,
  WEBSITE_ID,
  serializeJsonLd,
} from "@/lib/seo";
import { services, siteConfig } from "@/lib/site";

/**
 * The one Organization entity for the site, plus the WebSite that names it.
 *
 * Rendered on the homepage only, so exactly one Organization is ever emitted.
 * It is also a LocalBusiness: Wellthyfy has a public Google Business Profile at
 * its Puducherry address, and `hasMap` / `sameAs` point at that exact listing so
 * Google can join the website and the profile into one entity.
 * Every value here is shown elsewhere on the site; nothing is inferred.
 */
export default function OrganizationJsonLd() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "LocalBusiness"],
        "@id": ORGANIZATION_ID,
        name: BRAND,
        alternateName: siteConfig.name,
        legalName: LEGAL_NAME,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: ORGANIZATION_LOGO.url,
          width: ORGANIZATION_LOGO.width,
          height: ORGANIZATION_LOGO.height,
        },
        image: ORGANIZATION_LOGO.url,
        description: COMPANY_DESCRIPTION,
        slogan: siteConfig.tagline,
        email: siteConfig.email,
        telephone: siteConfig.phoneHref.replace("tel:", ""),
        address: {
          "@type": "PostalAddress",
          streetAddress: "No.34, First Floor, Kasthuribai Nagar",
          addressLocality: "Puducherry",
          postalCode: "605009",
          addressRegion: "Puducherry",
          addressCountry: "IN",
        },
        geo: { "@type": "GeoCoordinates", latitude: GEO.latitude, longitude: GEO.longitude },
        hasMap: GOOGLE_BUSINESS_PROFILE,
        areaServed: { "@type": "Country", name: "India" },
        knowsAbout: services.map((s) => s.title),
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "customer service",
            telephone: siteConfig.phoneHref.replace("tel:", ""),
            email: siteConfig.email,
            areaServed: "IN",
          },
        ],
        ...(SOCIAL_PROFILES.length ? { sameAs: SOCIAL_PROFILES } : {}),
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: BRAND,
        alternateName: siteConfig.name,
        url: SITE_URL,
        inLanguage: "en-IN",
        publisher: { "@id": ORGANIZATION_ID },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(graph) }}
    />
  );
}
