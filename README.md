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
  login/ signup/    student auth
  become-a-faculty/ public landing + /apply application form
  faculty/          HIDDEN: login, join (invite-only), restricted
  admin/            admin panel: applications, payments, courses
  onboarding/       student profile completion (contact details + Aadhaar images)
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

1. **Social profiles** — placeholder links in `components/layout/SocialLinks.tsx`.
2. **Course photography** — real photos are in `public/courses/`; rebuild them from
   `assets/brand/` if the sources change.
3. **Testimonials** — dummy content, as specified.

## The header logo

`components/ui/Logo.tsx` renders the full horizontal logo as one image:
`public/logo-full.webp` (1200x331, transparent, trimmed from the supplied
`public/wellthyfy -logo.webp`). Header height steps 48 -> 64 -> 68px (about 174 -> 247px
wide) so it clears the menu button on phones and the centred nav links on desktop; the footer
uses 80px (about 290px wide).

`public/logo-full.png` (the stacked 900x882 lockup) is kept on purpose: it is the
Organization logo in structured data, where a square-ish mark works best.

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

## SEO and Google Knowledge Panel groundwork

**Canonical host: `https://www.wellthyfy.in`, no trailing slash.** Verified on the live
site: `http://wellthyfy.in`, `https://wellthyfy.in` and trailing-slash URLs all answer
with a permanent **308** to the `www` form. Everything below uses that host
(`siteConfig.url`, re-exported as `SITE_URL` from `lib/seo.ts`).

What is in place:

| Piece | Where | Notes |
| --- | --- | --- |
| Organization + WebSite JSON-LD | `components/seo/OrganizationJsonLd.tsx`, rendered by `app/page.tsx` only | One `@graph` script, so there is exactly one Organization (`@id` `https://www.wellthyfy.in/#organization`). Name `Wellthyfy`, legalName `Wellthyfy Lifestyle Ventures Private Limited`, logo `/logo-full.png` (900x882), description, slogan, email, phone, registered address, customer-service contactPoint. The WebSite node (`name: Wellthyfy`, `publisher` -> the Organization) is what Google uses for the site name. Serialised with `serializeJsonLd`, which escapes `<`, `>`, `&` and line separators. |
| Homepage metadata | `app/page.tsx` | Title **Wellthyfy &#124; Official Website**, company description, canonical, Open Graph + X card. |
| Every public page | `pageMetadata()` in `lib/seo.ts` | Unique title (`Page &#124; Wellthyfy`), description, self-canonical, and a *complete* Open Graph + X card. (Next replaces rather than merges a parent's `openGraph`/`twitter`, so pages used to lose the site name and share image, and their X card showed the homepage title.) |
| Share image | `public/og-image.png` | 1200x630, built from the official logo. |
| Sitemap | `app/sitemap.ts` | Homepage, `/courses`, `/become-a-faculty`, `/become-a-faculty/apply`, `/privacy-policy` and every **published** course (`lastModified` from the course's real `updated_at`). Rebuilt hourly. No fake "now" dates on static pages. |
| robots.txt | `app/robots.ts` | Allows everything public; disallows `/admin`, `/dashboard`, `/onboarding`, `/api/`, `/auth/`, `/faculty/` (crawl budget only — access control is sign-in + RLS). Sign-in pages stay crawlable so their `noindex` is seen. Assets are never blocked. |
| noindex | sign-in, sign-up, password, onboarding, dashboards, admin, hidden faculty pages, unpublished course previews | Already present; course previews added. |

Social profiles and owner input:

- **Social profiles** live in `socialProfiles` in `lib/site.ts` (Facebook
  `profile.php?id=61594346823506`, Instagram `wellthyfylifestyleventures`, YouTube
  `@WellthyfyLifestyleVentures`). The footer icons and the Organization `sameAs` both read
  from there, so they cannot drift apart. WhatsApp (`wa.me/919751945999`) is a footer contact
  link only — a chat link is not a profile, so it is not in `sameAs`. Make sure each profile
  links back to https://www.wellthyfy.in in its bio/about section; two-way links are one of
  the strongest Knowledge Panel signals.
- Optional, if you have them: company registration details (CIN), founding date and founder
  names can be added to the Organization — only with verified values.

### Manual steps after deploying (cannot be done from the codebase)

1. **Google Search Console** (https://search.google.com/search-console/) — add a **Domain
   property** for `wellthyfy.in` and verify it with the **DNS TXT record** Google gives you
   (at your domain registrar / DNS host). A Domain property covers www, non-www, http and
   https together.
2. **Submit the sitemap:** Sitemaps -> `https://www.wellthyfy.in/sitemap.xml`.
3. **URL Inspection** -> `https://www.wellthyfy.in` -> check "User-declared canonical" and
   "Google-selected canonical" both show the www URL -> **Request indexing**. Repeat for
   `/courses` and `/become-a-faculty`.
4. **Validate the structured data** on the live URL:
   Rich Results Test (https://search.google.com/test/rich-results) — should detect
   *Organization*; Schema.org validator (https://validator.schema.org/) — no errors.
5. **Monitor** Performance -> Search results, filtered by query containing "wellthyfy", and
   Pages (indexing) for errors. Expect days to weeks before changes show.

A Knowledge Panel is decided by Google and cannot be guaranteed. What helps beyond this
code: consistent name/logo/address across the web, a verified **Google Business Profile**
(if you serve customers at the Puducherry address), and official social profiles that link
to wellthyfy.in. Once a panel appears, claim it via "Claim this knowledge panel".

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

Students, faculty and admins sign in with email + password. Project `asldprpmsegjdtyvuett`
(ap-southeast-1). Schema lives in `supabase/migrations/` (`0001_init.sql`,
`0002_faculty_program.sql`, `0003_module_pdfs.sql`, `0004_course_review_status.sql`,
`0005_faculty_review_flow.sql`, `0006_drop_apply_modules_upload.sql`, `0007_pan_and_aadhaar.sql`) and is **already applied** — re-running is safe. Apply 0004
before 0005, in separate transactions (a new enum value cannot be used in the transaction that
adds it).

### Tables

| Table | Purpose |
| --- | --- |
| `profiles` | One row per auth user. Role, `is_admin`, contact details, Aadhaar paths. |
| `courses` | Courses. `status` is `draft` → `pending_review` → `published` (or `rejected` with a `review_note`, or `archived`); only `published` is public. |
| `orders` | Manual-UPI enrolments: amount, UTR, student contact, pending/verified/rejected. |
| `faculty_applications` | Applicant details, qualification, government ID paths, review state and invite token. (Course columns are legacy, null for new applications.) |
| `admin_emails` | Addresses that become admin when they **confirm** their email. Invisible to the API. |

### Security model

Everything runs on the **anon key under Row Level Security**. The service_role key is not
used anywhere in the app — if you add it later, keep it server-only.

- `profiles` is **owner-only** (admins can also read). Users can edit only their contact
  columns — **`role` and `is_admin` are not writable by anyone through the API**, enforced
  with column-level grants, and `INSERT` on profiles is revoked entirely. (An earlier
  version let a user set their own `role`; that is closed.)
- `courses` are world-readable only when `status = 'published'`; everything else is visible
  to its author (and admins) alone. A faculty member can create courses only if their
  profile is `role = 'faculty'` **and** their email is on `@wellthyfy.in`.
- **Faculty can never publish.** The `courses_review_guard` trigger lets faculty move a course
  only between `draft`, `pending_review` and `archived`; setting `published` or `rejected`
  is refused, `review_note`/`reviewed_at` are admin-only, and any content edit to a live
  course sends it back to `pending_review` (off the site) until re-approved. Admins are
  unrestricted.
- `orders`: a student can only insert a **pending** order whose amount, title and faculty
  match the published course (an earlier version let a client insert a pre-verified
  order). Only an **admin** can verify or reject — payments go to Wellthyfy's UPI account,
  so only Wellthyfy can check a UTR. Faculty get read-only access to their own students.
- **Faculty accounts are invitation-only, enforced in the database.** The `handle_new_user`
  trigger treats `role` in signup metadata as a *request*: `faculty` is granted only when
  the new account's email equals an approved application's assigned `@wellthyfy.in` id
  **and** the 192-bit invite token matches and is unused. Anything else aborts the signup.
  `admin` is never accepted from metadata.
- **Admin is granted on email confirmation**, from `admin_emails`, not on sign-up — so
  nobody can pre-register an admin address they do not own.
- Aadhaar images (students) go to a **private** `kyc` bucket at `<user-id>/aadhaar-front.*`;
  applicant IDs go to a **private** `applications` bucket at `<application-uuid>/id-front.*`.
  Only admins can read the latter, via 10-minute signed URLs. Anonymous applicants can
  *upload* there (filename pattern, mime type and 5 MB limit enforced by the bucket and
  policy) but can never read, list or overwrite anything.

### Flows

**Students**

1. Sign up at `/signup` → confirmation email → `/auth/callback` → `/onboarding` (name, phone,
   WhatsApp, address, Aadhaar front/back). Password fields have a show/hide toggle;
   `/login` links to `/forgot-password` → emailed link → `/reset-password`.
2. A student enrols from `/courses/<slug>`: scan the UPI QR, pay, submit the UTR. The order
   shows as *Awaiting verification* until an admin verifies it.

**Becoming faculty** — two separate approvals: first the person, then each course.

1. Visitor clicks **Become a Faculty** (nav, footer) → `/become-a-faculty` (landing: faculty
   advantages — @wellthyfy.in mail ID, course promotion, own dashboard, 24×7 support; a
   "How it works" video plus five steps; monthly payouts; FAQs) → **Apply** →
   `/become-a-faculty/apply`.

   The video is set in `facultyVideo` in `lib/site.ts`: put a YouTube video id in `youtubeId`,
   **or** drop a file in `public/videos/` and set `src` (optionally `poster`). While both are
   empty, a branded "coming soon" placeholder is shown.
2. The application collects name, email, phone, WhatsApp, address, **qualification**
   (required), teaching experience (optional), and **both a PAN card and an Aadhaar card
   (front and back) — all three uploads are mandatory**. Files go straight to the private
   `applications` bucket as `<id>/pan.*`, `<id>/id-front.*` and `<id>/id-back.*` (Aadhaar is
   stored in the `id_*` columns with `id_type = 'aadhaar'`; PAN in `pan_path`). There is **no
   registration fee**, and the landing and apply pages say so prominently.
3. `POST /api/faculty-apply` validates, throttles (3/hour/IP), stores a *pending* row, then
   emails the admins (`CONTACT_TO_EMAIL`) and acknowledges the applicant.
4. An admin opens **Applications**, checks the ID and qualification, and **approves** (assigns
   an `@wellthyfy.in` mail id, issues the invite token, emails the applicant the mail id and a
   private join link) or **rejects** (optional reason emailed). No course is created here.
5. The faculty member opens `/faculty/join?token=…`, sets a password and confirms the email
   Supabase sends **to their new @wellthyfy.in mailbox**. Later sign-ins: `/faculty/login`.
6. From `/dashboard/faculty` they **create a course** (category, title, description, banner,
   modules PDF, mode, fee…) and either **Save as draft** or **Submit for review**. Admins are
   emailed for every submission.
7. An admin opens **Courses** (badge = waiting count) → the course → **Approve and publish**
   (live immediately, faculty emailed) or **Request changes** with a note (shown on the
   faculty dashboard and emailed). The faculty edits and resubmits.
8. Editing a live course takes it off the site until the new version is approved. Faculty can
   also withdraw a submission or unpublish. They see enrolled students read-only.

`/faculty/login`, `/faculty/join` and the whole admin panel are **not linked from any public
page** and are `noindex`. `/login` and `/signup` are student-only.

**Admins**

`/admin` (tabs: Overview, Applications, Payments, Courses). An admin signs in through the
normal `/login` and is routed to `/admin`. Non-admins get a plain 404 there.

To make someone an admin: add their address to `admin_emails`, then have them sign up and
**confirm** their email. For `promaxx2021@gmail.com` this is already seeded, so that person
only needs to sign up at `/signup` and click the confirmation link. If you ever need to
force it by hand:

```sql
update public.profiles set is_admin = true where email = 'someone@example.com';
```

### Course modules (PDF)

Modules are uploaded as **one PDF** (max 10 MB) instead of typed text, to the **public**
`course-modules` bucket — it is curriculum, meant for prospective students.

- Anonymous uploads to this bucket are closed (`0006`); only faculty can add PDFs.
- **Faculty** upload from the course create/edit form (`ModulesPdfUpload`) into their own
  `<user-id>/` folder; the server action accepts only their own folder or the course's
  existing PDF.
- The course page shows a **Course modules (PDF)** download card; the admin review page links
  the PDF. Older rows with typed `modules` text still render as a numbered list.

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

**Faculty mailboxes must exist.** Approving assigns an `@wellthyfy.in` address, but the app
does not create the mailbox — create it in your mail host first. The faculty member's
account-confirmation email is delivered there, so an address with no working inbox leaves
them unable to finish signing up. Credentials for that mailbox are never emailed by the app.

**Set `NEXT_PUBLIC_SITE_URL`** in production (e.g. `https://www.wellthyfy.in`). Links in
approval emails are built from it; if unset they use the request host, which is right for
local testing but should be pinned in production.

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
