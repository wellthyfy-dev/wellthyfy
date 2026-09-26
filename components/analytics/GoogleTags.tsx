import Script from "next/script";
import { GA_MEASUREMENT_ID, GOOGLE_ADS_ID } from "@/lib/gtag";

/**
 * Google tags: GA4 analytics + the Google Ads account tag.
 *
 * Both run on the same gtag.js library, so it is loaded once and each property
 * gets its own `config` call — pasting Google's two snippets verbatim would
 * pull the script down twice.
 *
 * Loaded with `afterInteractive` so it never blocks first paint, and skipped
 * outside production so local development does not pollute reports or count
 * fake conversions. Drop the NODE_ENV guard to test with GA4 DebugView or the
 * Google Tag Assistant.
 *
 * The Ads *conversion* event is not fired here — see `trackLeadConversion()`
 * in `lib/gtag.ts`, which runs after a successful enquiry.
 */
export default function GoogleTags() {
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-tags-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
          gtag('config', '${GOOGLE_ADS_ID}');
        `}
      </Script>
    </>
  );
}
