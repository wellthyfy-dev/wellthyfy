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
  courses/          catalogue + /courses/[slug] detail & enrolment
  login/ signup/    auth entry points (?role=student|faculty)
  onboarding/       profile completion (contact details + Aadhaar images)
  dashboard/        role router -> /dashboard/faculty | /dashboard/student
  auth/             Supabase callback + signout routes
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
  courses.ts          static catalogue: 3 pillars, 22 courses
  platform.ts         DB types, categories, modes, UPI link helper
  supabase/           browser / server / public clients + auth guard
  privacy-policy.ts   Privacy Policy copy (legal text — edit here)
assets/brand/       original full-resolution source art (not served)
supabase/migrations/ SQL schema (already applied to the project)
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

## The header logo

`public/logo-full.png` is a **stacked** lockup — emblem over wordmark over tagline. At a
header height of 80px the whole stack is only ~82px wide, which renders "LIFESTYLE
VENTURES" and the tagline at four or five pixels tall.

So `components/ui/Logo.tsx` composes a **horizontal** lockup from two crops of the
full-resolution source (`assets/brand/logo-original.png`, 4366x4278 after trim):

| Asset | Crop | Shipped |
| --- | --- | --- |
| `public/logo-mark.webp` | emblem, y 0-2455 | 512x512 |
| `public/logo-wordmark.webp` | wordmark + LIFESTYLE VENTURES, y 2455-3570 | 900x230 |

Regenerate the wordmark after replacing the source:

```bash
node -e "require('sharp')('assets/brand/logo-original.png').trim({threshold:1}).extract({left:0,top:2455,width:4366,height:1115}).trim({threshold:1}).resize({width:900}).webp({quality:92,alphaQuality:100}).toFile('public/logo-wordmark.webp')"
```

The lockup is ~254px wide at full size, so the header steps the emblem down 48 -> 64 -> 80px
across breakpoints; at 390px the full lockup plus the menu button still fits.

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
CONTACT_TO_EMAIL=promaxx2021@gmail.com,info@wellthyfy.in
CONTACT_FROM_EMAIL=Wellthyfy Lifestyle Ventures <hello@info.wellthyfy.in>
```

`CONTACT_TO_EMAIL` accepts a **comma-separated list** — every address receives the enquiry,
and all of them are set as reply-to on the visitor's confirmation.

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

## Courses

The catalogue lives in `lib/courses.ts`: three pillars (Wellness/green, Wealth/navy,
Happiness/gold — the same accents as the rest of the site) and 22 courses with their modules.

It renders in two places:

- **Homepage `#courses`** — a three-card teaser, one per pillar, linking to
  `/courses#wellness` etc. Deliberately does not list all 22.
- **`/courses`** — the full catalogue, grouped by pillar, plus a *Career skill courses*
  group for the professional training (beautician, yoga instructor, digital marketing)
  that still lives in `siteConfig`-adjacent `courses` in `lib/site.ts`.

Course counts are derived (`CATALOGUE_COUNT`, `coursesForPillar`), so adding a course to
`lib/courses.ts` updates the teaser, the page, the jump links and the copy automatically.

The *Investing Awareness for Beginners* course carries a `note` field rendered as a visible
disclaimer — keep it if you keep the course.

## Platform (Supabase)

Faculty and students sign in with email + password. Project `asldprpmsegjdtyvuett`
(ap-southeast-1). Schema lives in `supabase/migrations/0001_init.sql` and is **already
applied** — re-running it is safe.

### Tables

| Table | Purpose |
| --- | --- |
| `profiles` | One row per auth user. Role, contact details, Aadhaar storage paths. |
| `courses` | Faculty-authored courses. `status` gates public visibility. |
| `orders` | Manual-UPI enrolments: amount, UTR, pending/verified/rejected. |

### Security model

Everything runs on the **anon key under Row Level Security**. The service_role key is not
used anywhere in the app — if you add it later, keep it server-only.

- `profiles` is **owner-only**. No user can read anyone else's phone, address or Aadhaar
  paths, so course cards read a denormalised `faculty_name` (kept current by trigger).
- `courses` are world-readable only when `status = 'published'`; drafts are visible to
  their author alone. Only a profile with `role = 'faculty'` can insert.
- `orders` are visible to the buyer and that course's faculty. A student **cannot** move
  their own order to `verified` — only the faculty can.
- Aadhaar images go to a **private** `kyc` bucket at `<user-id>/aadhaar-front.*`. The
  storage policy keys on that first path segment, so a user can only touch their own files.

### Flows

1. Sign up at `/signup?role=faculty|student` → confirmation email → `/auth/callback`.
   Password fields have a show/hide toggle; `/login` links to `/forgot-password`, which
   emails a recovery link that lands on `/reset-password`. Those reset emails go through
   the same Supabase sender, so they hit the rate limit too until SMTP is configured.
2. `/onboarding` collects name, phone, WhatsApp, address and both Aadhaar images, then sets
   `profile_completed`. Middleware keeps users here until it is done.
3. Faculty create courses at `/dashboard/faculty/courses/new` (category → subcategory, with
   a free-text **Other**, plus an optional banner image). Publishing makes them appear on
   the homepage and `/courses`. Each row has an **Edit** button →
   `/dashboard/faculty/courses/<id>/edit`, which reuses the same form prefilled.
   Editing never changes the slug, so links already shared keep working, and re-saving a
   live course keeps its original publish date.
4. A student enrols from `/courses/<slug>`: scan the UPI QR, pay, submit the UTR. The order
   lands in the faculty dashboard as *Awaiting verification* until the faculty confirms it
   against their bank statement.

### Course banners

`BannerUpload` sends the file **straight from the browser** to the public `course-covers`
bucket, then carries the resulting URL in a hidden `cover_url` input. It deliberately does
not route image bytes through the Server Action — those have a 1 MB body limit by default,
and banners are routinely larger.

Objects are written to `<user-id>/<timestamp>-<rand>.<ext>`; the storage policy keys on that
first path segment, so a faculty member can only write into their own folder (verified: an
upload aimed at another user's folder is rejected).

Cards fall back to the category gradient when `cover_url` is null, so courses without a
banner still look deliberate. The Supabase storage host is allowlisted under
`images.remotePatterns` in `next.config.ts` — a different project ref needs that updated.

### Before you launch

**Custom SMTP is configured** (Resend). Supabase's built-in sender is capped at roughly
2 emails per hour; past that, signups fail with `over_email_send_rate_limit`. That is no
longer in play — consecutive signups have been verified sending confirmation mail through
Resend.

For reference, the settings in *Authentication → Emails → SMTP Settings*:

| Supabase field | Value |
| --- | --- |
| Host | `smtp.resend.com` |
| Port | `587` |
| Username | `resend` |
| Password | your `RESEND_API_KEY` |
| Sender email | `hello@info.wellthyfy.in` |
| Sender name | `Wellthyfy Lifestyle Ventures` |

The sender must stay on the Resend-verified `info.wellthyfy.in` domain. If signups ever
start failing with a rate-limit error again, check *Authentication → Rate Limits →
emails per hour*.

Also add your production URL under *Authentication → URL Configuration → Redirect URLs*,
or the confirmation links will bounce back to localhost.

Set the real UPI details in `.env.local`:

```
NEXT_PUBLIC_UPI_ID=yourname@bank
NEXT_PUBLIC_UPI_PAYEE_NAME=Wellthyfy Lifestyle Ventures
```

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
