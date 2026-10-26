import {
  BRAND,
  COMPANY_DESCRIPTION,
  LEGAL_NAME,
  ORGANIZATION_ID,
  ORGANIZATION_LOGO,
  SITE_URL,
  SOCIAL_PROFILES,
  WEBSITE_ID,
  serializeJsonLd,
} from "@/lib/seo";
import { siteConfig } from "@/lib/site";

/**
 * The one Organization entity for the site, plus the WebSite that names it.
 *
 * Rendered on the homepage only, so exactly one Organization is ever emitted.
 * Every value here is shown elsewhere on the site (logo, contact details,
 * registered address); nothing is inferred.
 */
export default function OrganizationJsonLd() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
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
