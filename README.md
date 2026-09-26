# Wellthyfy Lifestyle Ventures — Landing Page

Marketing site for **Wellthyfy Lifestyle Ventures Pvt. Ltd.** — a holistic lifestyle company
empowering health, wealth and happiness.

## Stack

| Concern    | Choice                                     |
| ---------- | ------------------------------------------ |
| Framework  | Next.js 15 (App Router) + React 19          |
| Language   | TypeScript                                  |
| Styling    | Tailwind CSS v4 (CSS-first `@theme` tokens) |
| Animation  | Framer Motion (UI) + GSAP/ScrollTrigger (scroll & counters) |
| Icons      | lucide-react                                |
| Fonts      | Fraunces (display) + Plus Jakarta Sans (UI), via `next/font` |

## Commands

```bash
npm run dev     # dev server on http://localhost:3000
npm run build   # production build
npm start       # serve the production build
npm run lint    # eslint
```

> `next dev` and `next build` both write to `.next`. Running a build while the dev server is
> up corrupts it — the dev server then returns a 500 for the document and 404s for its
> chunks. Either stop the dev server first, or build into a scratch directory:
>
> ```bash
> NEXT_DIST_DIR=.next-verify npm run build
> ```
>
> If dev ever starts 500-ing for no obvious reason, `rm -rf .next` and restart it.

## Structure

```
app/
  layout.tsx        metadata, fonts, JSON-LD, chrome (loader, nav, footer,
                    scroll-to-top, analytics)
  page.tsx          section composition
  privacy-policy/   Privacy Policy route
  globals.css       design tokens, keyframes, custom utilities
  api/contact/      Resend-backed enquiry endpoint
  sitemap.ts        robots.ts
components/
  analytics/        GoogleAnalytics (GA4 gtag.js), MetaPixel (Meta/Facebook)
  layout/           Navbar, Footer, SocialLinks
  sections/         Hero, About, Services, Courses, WhyWellthyfy,
                    WhoCanJoin, Testimonials, CTABanner, Contact, CourseCover
  ui/               Logo, Icon, Reveal, SectionHeading,
                    AnimatedBackground, LoadingScreen, ScrollToTop
lib/
  site.ts           all copy and content data
  accents.ts        green/navy/gold class maps
  gsap.ts           ScrollTrigger registration + helpers
  email-templates.ts  branded HTML for both enquiry emails
  gtag.ts             Google tag IDs + lead-conversion helper
  privacy-policy.ts   Privacy Policy copy (legal text — edit here)
assets/brand/       original full-resolution source art (not served)
```

## Brand tokens

Defined once in `app/globals.css` under `@theme`, derived from the logo:

| Role        | Base      | Light     | Tailwind prefix |
| ----------- | --------- | --------- | --------------- |
| Health      | `#2E8B57` | `#65B741` | `well-*`        |
| Wealth      | `#0A4D9D` | `#1E88E5` | `navy-*`        |
| Happiness   | `#D4A017` | `#F4C542` | `gold-*`        |

Each ships a 50–900 scale. `lib/accents.ts` maps an accent name to the full set of
static class strings (Tailwind needs complete class names, not interpolated fragments).

## Editing content

Nearly all copy lives in [`lib/site.ts`](lib/site.ts) — contact details, nav links,
pillars, services, courses, morning-club steps, audiences, testimonials and stats.
Editing that file updates the page, the JSON-LD and the contact form's course dropdown
together.

## Things still to wire up

These are deliberately stubbed:

1. **Student / Faculty login** — `href="#"` with a "Coming Soon" tooltip
   (`components/layout/Navbar.tsx`). Point at the portals when they exist.
2. **Social profiles** — placeholder links in `components/layout/SocialLinks.tsx`.
3. **Course photography** — real photos are in `public/courses/`; rebuild them from
   `assets/brand/` if the sources change.
4. **Testimonials** — dummy content, as specified.

## The About artwork

`public/balance.webp` is the trimmed, resized (1100px) WebP build of
`assets/brand/balance.png`, which already ships with a transparent background. Regenerate it
after replacing the source:

```bash
node -e "require('sharp')('assets/brand/balance.png').trim({threshold:1}).resize({width:1100}).webp({quality:90,alphaQuality:100}).toFile('public/balance.webp')"
```

## Contact form email

`POST /api/contact` sends two emails through [Resend](https://resend.com):

1. **The enquiry** → `CONTACT_TO_EMAIL`, with `replyTo` set to the visitor so a reply goes
   straight back to them. This one is required; if it fails the API returns 502 and the form
   shows an error with the phone number.
2. **A confirmation** → the visitor. Best-effort: if it fails the request still succeeds, so a
   bounced receipt never costs a lead. The failure is logged server-side.

Configure via `.env.local` (copy `.env.example`):

```
RESEND_API_KEY=re_...
CONTACT_TO_EMAIL=promaxx2021@gmail.com
CONTACT_FROM_EMAIL=Wellthyfy Lifestyle Ventures <hello@info.wellthyfy.in>
```

The sender must sit on a domain verified in Resend. **`info.wellthyfy.in` is verified**, so
confirmations reach real visitors. Change only the local part (`hello@`, `noreply@`,
`enquiries@`) unless you verify another domain first — sending from an unverified domain
makes Resend reject the message, which drops the visitor's confirmation.

Also built in: required-field and email validation, a hidden honeypot field, and a
per-IP in-process throttle (5 per 10 minutes). The throttle resets on redeploy and is
per-instance — front it with a real limiter if the form attracts bots.

## Analytics

Two tags, both loaded with `next/script` at `strategy="afterInteractive"` so neither blocks
first paint:

| Tag | ID | Component |
| --- | --- | --- |
| Google Analytics 4 | `G-P5HSPELBTT` | `components/analytics/GoogleTags.tsx` |
| Google Ads | `AW-18476470426` | `components/analytics/GoogleTags.tsx` |
| Meta Pixel | `1423221196618843` | `components/analytics/MetaPixel.tsx` |

GA4 and Google Ads share one gtag.js load with a `config` call each — pasting Google's two
snippets verbatim would download the library twice.

**The Ads lead conversion** (`AW-18476470426/IrkkCNvKuIYdEJqhoupE`, value 1.0 INR) is *not*
fired on page load. Google supplies it as an event snippet for a thank-you page; this site
has none, so it lives in `trackLeadConversion()` in `lib/gtag.ts` and runs only after
`POST /api/contact` succeeds. Firing it at page level would count every visitor as a lead.

Both are **skipped when `NODE_ENV !== "production"`**, so local development does not send hits
to the property or the pixel. You will not see either tag on `localhost:3000` — verify on the
deployed site, or delete the `NODE_ENV` guard in the relevant file to test through GA4
DebugView or the Meta Pixel Helper.

The Meta Pixel keeps its `<noscript>` tracking image for visitors without JavaScript. To fire
a conversion elsewhere in the app, call `window.fbq?.("track", "Lead")` — the `?.` matters,
since `fbq` is undefined in development.

## Privacy Policy

The page lives at `/privacy-policy`; its copy is structured data in
`lib/privacy-policy.ts`, so edit the wording there rather than in the component. Bump
`policyMeta.effectiveDate` whenever the text changes materially.

Two details in `policyMeta` deliberately differ from `siteConfig`, because the policy states
the registered office and the privacy contact rather than the marketing details:

| | Privacy Policy | Rest of the site |
| --- | --- | --- |
| Contact email | `admin@wellthyfy.in` | `info@wellthyfy.in` |
| Address | includes Vazhuthaavur Road | omits it |

If those should match, change `policyMeta` (and/or `siteConfig.address`) — they are not
derived from each other.

## Hydration and randomised decoration

The floating leaves, particles and CTA sparks are positioned from a seeded PRNG. Their
randomised values are passed as **CSS custom properties** (`--wf-size`, `--wf-rot`,
`--wf-dur`, `--wf-delay`) consumed by `.wf-leaf` / `.wf-particle` / `.wf-spark` in
`globals.css` — never as raw inline `width` / `transform` / `animation`.

This is load-bearing. The browser re-serialises inline numeric styles (`64.78328884505027`
becomes `64.7833px`) and expands the `animation` shorthand into longhands, both of which
React reads back as a hydration mismatch. Custom properties are stored verbatim, so the
server and client markup agree. Values are also rounded to fixed precision for the same
reason. If you add more randomised decoration, follow the same pattern.

## Accessibility & performance notes

- Every animation is gated on `prefers-reduced-motion`, in CSS, Framer Motion and GSAP.
- Decorative scatter (leaves, particles, sparks) uses a seeded PRNG so server and client
  markup match — no hydration mismatch.
- Semantic landmarks, one `h1`, skip-to-content link, labelled form fields, focus-visible
  rings, and `aria-hidden` on decorative SVG.
- Logo assets are pre-optimised WebP/PNG served through `next/image`; the multi-megabyte
  originals live in `assets/brand/` and are never shipped.
