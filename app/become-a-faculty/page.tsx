import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  CalendarClock,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  Headset,
  Layers,
  MailCheck,
  Megaphone,
  Sparkles,
} from "lucide-react";
import FacultyVideo from "@/components/sections/FacultyVideo";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { Eyebrow, SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/lib/site";

const description =
  "Teach any skill in your own module and earn with Wellthyfy. Apply, get approved, publish your course and receive monthly payouts. No registration fee.";

export const metadata: Metadata = {
  title: "Become a Faculty",
  description,
  alternates: { canonical: "/become-a-faculty" },
  openGraph: {
    title: "Become a Faculty | Wellthyfy Lifestyle Ventures",
    description,
    url: `${siteConfig.url}/become-a-faculty`,
  },
};

const steps = [
  {
    n: "01",
    icon: ClipboardList,
    title: "Apply",
    body: "Share your contact details, your qualification, and your PAN and Aadhaar cards for verification. Free — no registration fee.",
    tile: "from-well-400 to-well-600",
    glow: "shadow-glow-green",
  },
  {
    n: "02",
    icon: BadgeCheck,
    title: "Get approved",
    body: "Our team reviews your application. Once approved, you receive your own @wellthyfy.in faculty mail id.",
    tile: "from-navy-500 to-navy-800",
    glow: "shadow-glow-navy",
  },
  {
    n: "03",
    icon: LayoutDashboard,
    title: "Create your course",
    body: "Sign up with your Wellthyfy mail id and build your course from your dashboard — details, banner, modules PDF and fee.",
    tile: "from-well-400 to-navy-700",
    glow: "shadow-glow-green",
  },
  {
    n: "04",
    icon: BookOpenCheck,
    title: "Course goes live",
    body: "Submit it for review. As soon as our team approves it, your course is published on wellthyfy.in.",
    tile: "from-navy-500 to-navy-800",
    glow: "shadow-glow-navy",
  },
  {
    n: "05",
    icon: CalendarClock,
    title: "Earn monthly",
    body: "Students enrol and pay through Wellthyfy. Your earnings are paid out to you every month.",
    tile: "from-gold-400 to-gold-600",
    glow: "shadow-glow-gold",
  },
];

const advantages = [
  {
    icon: MailCheck,
    title: "Your own Wellthyfy mail ID",
    body: "Every approved faculty gets a professional @wellthyfy.in mail ID — your identity on the platform.",
    tile: "from-well-400 to-well-600",
  },
  {
    icon: Megaphone,
    title: "We promote your course",
    body: "We market your course across our website and channels to bring students to you, so you can focus on teaching.",
    tile: "from-navy-500 to-navy-800",
  },
  {
    icon: LayoutDashboard,
    title: "Your own dashboard",
    body: "Create and manage your courses, track their review status and see every student who enrols — all in one place.",
    tile: "from-well-500 to-navy-700",
  },
  {
    icon: Headset,
    title: "24×7 support",
    body: "Our team is here round the clock to help you with your course, your students and your payouts.",
    tile: "from-gold-400 to-gold-600",
  },
];

const perks = [
  {
    icon: BookOpenCheck,
    title: "Your own module",
    body: "Build the curriculum your way. Lay out your modules and teach them in your own style.",
  },
  {
    icon: Sparkles,
    title: "Any skill, any field",
    body: "Wellness, wealthiness, happiness — or choose Other for anything you are good at.",
  },
];

const topics = [
  "Yoga & meditation",
  "Nutrition & diet",
  "Fitness coaching",
  "Financial literacy",
  "Investing & trading",
  "Entrepreneurship",
  "Mindfulness",
  "Life & career coaching",
  "Relationships",
  "Creative & practical skills",
];

const faqs = [
  {
    q: "Who can apply?",
    a: "Anyone with a skill worth teaching. We ask for your qualification, PAN card and Aadhaar card so we can verify who you are.",
  },
  {
    q: "Is there a registration fee?",
    a: "No. Applying and becoming a Wellthyfy faculty is completely free — there is no registration fee.",
  },
  {
    q: "What do I need to apply?",
    a: "Your name and contact details, your qualification, your PAN card, and both sides of your Aadhaar card. You add your course later, after you are approved.",
  },
  {
    q: "What happens after I apply?",
    a: "Our team reviews your application. If it is approved, we email you your @wellthyfy.in faculty mail id and a private link to create your faculty account. From your dashboard you then create your course and submit it — every course is approved by our team before it goes live.",
  },
  {
    q: "Do I set my own fee?",
    a: "Yes. You set the fee when you create your course, and it appears on your course page once the course is approved.",
  },
  {
    q: "How do I get paid?",
    a: "Students pay through Wellthyfy and your earnings are paid out to you every month.",
  },
];

export default function BecomeFacultyPage() {
  return (
    <div className="relative">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pb-20 pt-32 md:pt-44 lg:pb-28">
        <div className="container-page">
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <Reveal>
              <Eyebrow>Become a Faculty</Eyebrow>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="mt-7 text-[2.5rem] font-semibold leading-[1.06] sm:text-6xl lg:text-7xl">
                Teach what you know.{" "}
                <span className="text-gradient-brand">Earn</span> with every student.
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-6 font-display text-xl font-medium italic text-navy-800 sm:text-2xl">
                Share your knowledge with the world — and inspire every learner you reach.
              </p>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
                Become a faculty in the Wellthyfy venture. Teach any skill, in your own module —
                we bring the platform, the students and the payments, and you bring the
                expertise.
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
                <Link
                  href="/become-a-faculty/apply"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-well-600 via-well-500 to-navy-700 px-8 py-4 text-base font-semibold text-white shadow-glow-green transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift sm:w-auto"
                >
                  Apply to become faculty
                  <ArrowRight className="size-4.5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-navy-200 bg-white/80 px-8 py-4 text-base font-semibold text-navy-800 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-navy-300 hover:bg-white hover:shadow-soft sm:w-auto"
                >
                  See how it works
                  <ChevronDown className="size-4.5" />
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.28}>
              <p className="mt-7 inline-flex items-center gap-2.5 rounded-full border-2 border-gold-400 bg-gold-50 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-gold-800 shadow-glow-gold sm:text-sm">
                <BadgeCheck className="size-5 shrink-0 text-gold-600" strokeWidth={2.2} />
                No registration fee<span className="hidden sm:inline"> · 100% free to join</span>
              </p>
            </Reveal>

            <Reveal delay={0.32}>
              <ul className="mt-8 flex flex-wrap items-center justify-center gap-3">
                {["Any skill", "Your own module", "Monthly payouts"].map((t) => (
                  <li
                    key={t}
                    className="inline-flex items-center gap-2 rounded-full border border-well-200 bg-white/80 px-4 py-2 text-sm font-medium text-navy-800 shadow-sm backdrop-blur-sm"
                  >
                    <span className="size-1.5 rounded-full bg-gold-500" aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Faculty advantages ───────────────────────────────────────────── */}
      <section id="advantages" className="relative scroll-mt-28 py-20 sm:py-24">
        <div className="container-page">
          <SectionHeading
            eyebrow="Faculty advantages"
            title="Everything you need"
            highlight="to teach and grow"
            description="When you join Wellthyfy as a faculty, you are never on your own."
          />

          <StaggerGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
            {advantages.map((item) => (
              <StaggerItem key={item.title} className="h-full">
                <article className="group h-full rounded-3xl border border-navy-900/7 bg-white/90 p-7 shadow-soft backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-lift">
                  <span
                    className={`grid size-14 place-items-center rounded-2xl bg-gradient-to-br ${item.tile} text-white transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6`}
                  >
                    <item.icon className="size-7" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-6 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2.5 text-[0.93rem] leading-relaxed text-ink-soft">{item.body}</p>
                </article>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <Reveal>
            <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-gold-300 bg-gold-50/80 px-6 py-6 text-center sm:flex-row sm:gap-5 sm:text-left">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 text-white shadow-glow-gold">
                <BadgeCheck className="size-6" strokeWidth={2} />
              </span>
              <p className="text-base text-ink-soft">
                <span className="block font-display text-xl font-semibold text-gold-800">
                  No registration fee.
                </span>
                It costs nothing to apply or to become a faculty — you only earn.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="relative scroll-mt-28 py-20 sm:py-24">
        <div className="container-page">
          <SectionHeading
            eyebrow="How it works"
            title="Five steps from"
            highlight="idea to income"
            description="Watch the walkthrough, then follow the steps — no guesswork."
          />

          <Reveal>
            <div className="mx-auto mt-12 max-w-4xl lg:mt-14">
              <FacultyVideo />
            </div>
          </Reveal>

          <StaggerGroup className="relative mt-14 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-5 lg:gap-5">
            {/* connector behind the cards on desktop */}
            <div
              className="pointer-events-none absolute left-[10%] right-[10%] top-14 hidden h-px bg-gradient-to-r from-well-400 via-navy-500 to-gold-500 lg:block"
              aria-hidden="true"
            />

            {steps.map((step) => (
              <StaggerItem key={step.n} className="h-full">
                <article className="group relative h-full rounded-3xl border border-navy-900/7 bg-white/90 p-6 shadow-soft backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-lift">
                  <div className="flex items-start justify-between">
                    <span
                      className={`relative z-10 grid size-14 place-items-center rounded-2xl bg-gradient-to-br ${step.tile} ${step.glow} text-white transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6`}
                    >
                      <step.icon className="size-7" strokeWidth={1.75} />
                    </span>
                    <span
                      className="font-display text-5xl font-semibold text-navy-900/8"
                      aria-hidden="true"
                    >
                      {step.n}
                    </span>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-3 text-[0.92rem] leading-relaxed text-ink-soft">{step.body}</p>
                </article>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ── Teach any skill ──────────────────────────────────────────────── */}
      <section className="relative py-20 sm:py-24">
        <div className="container-page">
          <SectionHeading
            eyebrow="Why teach with us"
            title="Teach any skill,"
            highlight="your way"
            description="You keep full control of what you teach. We take care of everything around it."
          />

          <StaggerGroup className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-2 lg:mt-16">
            {perks.map((perk) => (
              <StaggerItem key={perk.title} className="h-full">
                <article className="h-full rounded-3xl border border-navy-900/7 bg-white/85 p-6 shadow-soft backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lift">
                  <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-well-400 to-navy-700 text-white">
                    <perk.icon className="size-6" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{perk.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">{perk.body}</p>
                </article>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <Reveal>
            <div className="mx-auto mt-14 max-w-3xl text-center">
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-navy-700/60">
                <Layers className="size-3.5" strokeWidth={2.2} />
                A few things our faculty teach
              </p>
              <ul className="mt-5 flex flex-wrap justify-center gap-2.5">
                {topics.map((t) => (
                  <li
                    key={t}
                    className="rounded-full border border-navy-900/10 bg-white/80 px-4 py-2 text-sm text-ink-soft backdrop-blur-sm"
                  >
                    {t}
                  </li>
                ))}
                <li className="rounded-full border border-gold-200 bg-gold-50 px-4 py-2 text-sm font-medium text-gold-800">
                  …and anything you can teach
                </li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="relative py-20 sm:py-24">
        <div className="container-page">
          <SectionHeading eyebrow="Questions" title="Before you" highlight="apply" />

          <Reveal>
            <div className="mx-auto mt-12 max-w-3xl space-y-3">
              {faqs.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-2xl border border-navy-900/7 bg-white/90 shadow-soft backdrop-blur-sm open:shadow-lift"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-ink [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <ChevronDown
                      className="size-5 shrink-0 text-navy-600 transition-transform duration-300 group-open:rotate-180"
                      strokeWidth={2}
                    />
                  </summary>
                  <p className="px-6 pb-6 text-[0.95rem] leading-relaxed text-ink-soft">{f.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="relative pb-24 pt-8">
        <div className="container-page">
          <Reveal>
            <div className="relative isolate overflow-hidden rounded-[2.25rem] px-6 py-16 text-center shadow-lift sm:px-12 sm:py-20 grain">
              <div className="absolute inset-0 -z-20 bg-[linear-gradient(120deg,#14402a_0%,#2e8b57_26%,#0a4d9d_62%,#083c79_84%,#a87b12_100%)]" />
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_20%,rgba(101,183,65,0.55),transparent_48%),radial-gradient(circle_at_82%_78%,rgba(244,197,66,0.45),transparent_48%)]" />

              <h2 className="mx-auto max-w-2xl text-3xl font-semibold leading-[1.12] text-white sm:text-4xl lg:text-5xl">
                Ready to turn your skill into income?
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base text-white/85 sm:text-lg">
                It takes a few minutes to apply, and there is no registration fee. We review every
                application personally.
              </p>
              <Link
                href="/become-a-faculty/apply"
                className="group mt-9 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-navy-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-50 hover:shadow-lift"
              >
                Apply now
                <ArrowRight className="size-4.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
