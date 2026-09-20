import Script from "next/script";

const PIXEL_ID = "1423221196618843";

/**
 * Meta (Facebook) Pixel.
 *
 * Loaded with `afterInteractive` so it never blocks first paint, and skipped
 * outside production so local development does not send events to the pixel.
 * Drop the NODE_ENV guard if you want to test with the Meta Pixel Helper on
 * localhost.
 *
 * To track a conversion elsewhere in the app:
 *   window.fbq?.("track", "Lead");
 */
export default function MetaPixel() {
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>

      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
