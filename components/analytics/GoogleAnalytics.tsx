import Script from "next/script";

const GA_MEASUREMENT_ID = "G-P5HSPELBTT";

/**
 * GA4 via gtag.js.
 *
 * Loaded with `afterInteractive` so it never blocks first paint, and skipped
 * outside production so local development does not pollute the property's
 * reports. Drop the NODE_ENV guard if you want to verify events from localhost
 * in GA4 DebugView.
 */
export default function GoogleAnalytics() {
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
