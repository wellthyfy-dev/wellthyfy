/** Google tag IDs and conversion helpers. */

export const GA_MEASUREMENT_ID = "G-P5HSPELBTT";

/** Google Ads account tag. */
export const GOOGLE_ADS_ID = "AW-18476470426";

/** "Submit lead form (1)" conversion action. */
export const LEAD_CONVERSION_SEND_TO = `${GOOGLE_ADS_ID}/IrkkCNvKuIYdEJqhoupE`;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Report a lead-form conversion to Google Ads.
 *
 * Google hands this snippet out as an "event snippet" for a conversion *page*,
 * i.e. a thank-you URL. This site has no thank-you page — the form swaps to an
 * inline success state — so firing it on page load would count every visitor as
 * a conversion. Call it only after the enquiry has actually been accepted.
 *
 * No-ops when gtag is absent (development, or a blocked tag).
 */
export function trackLeadConversion() {
  window.gtag?.("event", "conversion", {
    send_to: LEAD_CONVERSION_SEND_TO,
    value: 1.0,
    currency: "INR",
  });
}
