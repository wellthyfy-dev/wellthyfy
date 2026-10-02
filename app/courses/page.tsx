import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Clock, GraduationCap, Info, Sparkles } from "lucide-react";
import CourseCover from "@/components/sections/CourseCover";
import { Icon } from "@/components/ui/Icon";
import { accentStyles, cn } from "@/lib/accents";
import { CATALOGUE_COUNT, coursePillars, coursesForPillar } from "@/lib/courses";
import { courses as skillCourses, siteConfig } from "@/lib/site";

const description = `All ${CATALOGUE_COUNT} Wellthyfy courses across wellness, wealth and happiness — plus our professional beautician, yoga instructor and digital marketing training.`;

export const metadata: Metadata = {
  title: "Courses",
  description,
  alternates: { canonical: "/courses" },
  openGraph: {
    title: "Courses | Wellthyfy Lifestyle Ventures",
    description,
    url: `${siteConfig.url}/courses`,
  },
};

export default function CoursesPage() {
  return (
    <div className="relative pb-24 pt-32 md:pt-40">
      <div className="container-page">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-ink-soft transition-colors hover:text-well-700"
          >
            <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Back to home
          </Link>

          <h1 className="mt-7 text-4xl font-semibold leading-[1.1] sm:text-5xl lg:text-[3.4rem]">
            Wellthyfy <span className="text-gradient-brand">Courses</span>
          </h1>

          <p className="mt-5 font-display text-xl font-medium text-navy-800 sm:text-2xl">
            Wellness • Wealth • Happiness
          </p>
          <p className="mt-3 text-base leading-relaxed text-ink-soft sm:text-lg">
            Learn. Apply. Grow. Thrive.
          </p>

          {/* Pillar jump links */}
          <nav aria-label="Course pillars" className="mt-9 flex flex-wrap justify-center gap-3">
            {coursePillars.map((pillar) => {
              const a = accentStyles[pillar.accent];
              return (
                <a
                  key={pillar.id}
                  href={`#${pillar.id}`}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border bg-white/80 px-5 py-2.5 text-sm font-semibold shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft",
                    a.border,
                    a.text,
                  )}
                >
                  <span className={cn("size-2 rounded-full", a.dot)} aria-hidden="true" />
                  {pillar.title}
                  <span className="text-ink-soft/70">{coursesForPillar(pillar.id).length}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* Pillars */}
        {coursePillars.map((pillar) => {
          const a = accentStyles[pillar.accent];
          const list = coursesForPillar(pillar.id);

          return (
            <section key={pillar.id} id={pillar.id} className="scroll-mt-32 pt-20 lg:pt-24">
              {/* Pillar banner */}
              <div
                className={cn(
                  "relative overflow-hidden rounded-[2rem] px-7 py-10 text-white sm:px-10 sm:py-12",
                  a.iconTile,
                )}
              >
                <div
                  className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:18px_18px]"
                  aria-hidden="true"
                />
                <div className="relative flex flex-wrap items-center gap-5">
                  <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/20 backdrop-blur-sm">
                    <Icon name={pillar.icon} className="size-7" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-display text-3xl font-semibold sm:text-4xl">
                      {pillar.title}
                    </h2>
                    <p className="mt-1.5 text-sm font-medium text-white/85 sm:text-base">
                      {pillar.tagline}
                    </p>
                  </div>
                  <span className="ml-auto inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                    <GraduationCap className="size-4" strokeWidth={2.2} />
                    {list.length} courses
                  </span>
                </div>
              </div>

              {/* Course cards */}
              <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((course, i) => (
                  <li key={course.title} className="h-full">
                    <article className="group flex h-full flex-col rounded-3xl border border-navy-900/7 bg-white/85 p-6 shadow-soft backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lift">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-semibold leading-snug">{course.title}</h3>
                        <span
                          className="font-display text-2xl font-semibold tabular-nums text-navy-900/10 transition-colors duration-500 group-hover:text-navy-900/20"
                          aria-hidden="true"
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>

                      <ul className="mt-5 space-y-2.5">
                        {course.modules.map((m) => (
                          <li
                            key={m}
                            className="flex items-start gap-2.5 text-[0.9rem] leading-snug text-ink-soft"
                          >
                            <span
                              className={cn(
                                "mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-full",
                                a.softBg,
                              )}
                            >
                              <Check className={cn("size-2.5", a.text)} strokeWidth={3.5} />
                            </span>
                            {m}
                          </li>
                        ))}
                      </ul>

                      {course.note && (
                        <p className="mt-5 flex items-start gap-2 rounded-xl border border-gold-200 bg-gold-50 px-3.5 py-2.5 text-xs leading-relaxed text-gold-800">
                          <Info className="mt-0.5 size-3.5 shrink-0" strokeWidth={2.4} />
                          {course.note}
                        </p>
                      )}

                      <div className="mt-auto pt-6">
                        <Link
                          href="/#contact"
                          className={cn(
                            "inline-flex w-full items-center justify-center gap-2 rounded-full border bg-white px-5 py-3 text-sm font-semibold text-navy-800 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft",
                            a.border,
                          )}
                        >
                          Enquire
                          <ArrowRight className="size-4" />
                        </Link>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        {/* Professional / vocational courses */}
        <section id="professional" className="scroll-mt-32 pt-20 lg:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-well-200/80 bg-white/80 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-well-700 shadow-sm">
              <Sparkles className="size-3.5" strokeWidth={2.4} />
              Professional Training
            </span>
            <h2 className="mt-5 text-3xl font-semibold leading-[1.14] sm:text-4xl">
              Career <span className="text-gradient-brand">skill courses</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">
              Hands-on training that turns a skill into an income.
            </p>
          </div>

          <ul className="mt-10 grid gap-7 lg:grid-cols-3">
            {skillCourses.map((course) => {
              const a = accentStyles[course.accent];
              return (
                <li key={course.id} className="h-full">
                  <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-navy-900/8 bg-white shadow-soft transition-all duration-500 hover:-translate-y-2.5 hover:shadow-lift">
                    <div className="relative overflow-hidden">
                      <div className="transition-transform duration-700 group-hover:scale-[1.06]">
                        <CourseCover id={course.id} accent={course.accent} />
                      </div>
                      <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-navy-800 shadow-sm backdrop-blur-sm">
                        <Sparkles className={cn("size-3.5", a.softText)} strokeWidth={2.6} />
                        {course.badge}
                      </span>
                      <span className="absolute bottom-5 left-5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/90">
                        <Clock className="size-3.5" strokeWidth={2.4} />
                        {course.duration}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-7">
                      <h3 className="text-[1.35rem] font-semibold leading-snug">{course.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                        {course.description}
                      </p>

                      <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-700/60">
                        What you will learn
                      </p>
                      <ul className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                        {course.highlights.map((h) => (
                          <li key={h} className="flex items-start gap-2.5 text-[0.9rem] text-ink">
                            <span
                              className={cn(
                                "mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-full",
                                a.softBg,
                              )}
                            >
                              <Check className={cn("size-2.5", a.text)} strokeWidth={3.5} />
                            </span>
                            {h}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-auto pt-8">
                        <Link
                          href="/#contact"
                          className={cn(
                            "inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5",
                            course.cta === "Enroll Now"
                              ? "bg-gradient-to-r from-gold-500 to-gold-600 text-white shadow-glow-gold hover:shadow-lift"
                              : cn("border bg-white text-navy-800 hover:shadow-soft", a.border),
                          )}
                        >
                          {course.cta}
                          <ArrowRight className="size-4" />
                        </Link>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Closing CTA */}
        <div className="mx-auto mt-20 max-w-2xl text-center">
          <p className="font-display text-xl font-medium leading-relaxed text-navy-800 sm:text-2xl">
            We do not just teach courses. We help people build{" "}
            <span className="text-gradient-brand">better habits, better knowledge</span> and better
            lives.
          </p>
          <Link
            href="/#contact"
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-well-600 via-well-500 to-navy-700 px-8 py-4 text-base font-semibold text-white shadow-glow-green transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
          >
            Talk to our team
            <ArrowRight className="size-4.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
