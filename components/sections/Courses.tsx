"use client";

import { ArrowRight, Check, Clock, Sparkles } from "lucide-react";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { accentStyles, cn } from "@/lib/accents";
import { courses } from "@/lib/site";
import CourseCover from "./CourseCover";

export default function Courses() {
  return (
    <section id="courses" className="relative scroll-mt-28 py-20 sm:py-24 lg:py-28">
      {/* Soft band behind the section */}
      <div className="pointer-events-none absolute inset-x-0 top-1/4 -z-10 h-3/4 bg-gradient-to-b from-well-50/70 via-white/40 to-transparent" />

      <div className="container-page">
        <SectionHeading
          eyebrow="Featured Courses"
          title="Featured"
          highlight="Courses"
          description="Learn New Skills. Build Confidence. Create Opportunities."
        />

        <StaggerGroup className="mt-14 grid gap-7 lg:mt-16 lg:grid-cols-3">
          {courses.map((course) => {
            const a = accentStyles[course.accent];
            const isPrimary = course.cta === "Enroll Now";

            return (
              <StaggerItem key={course.id} className="h-full">
                <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-navy-900/8 bg-white shadow-soft transition-all duration-500 hover:-translate-y-2.5 hover:shadow-lift">
                  {/* Cover */}
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

                  {/* Body */}
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
                      <a
                        href="#contact"
                        className={cn(
                          "group/cta inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-all duration-300",
                          isPrimary
                            ? "bg-gradient-to-r from-gold-500 to-gold-600 text-white shadow-glow-gold hover:-translate-y-0.5 hover:shadow-lift"
                            : cn(
                                "border bg-white text-navy-800 hover:-translate-y-0.5 hover:shadow-soft",
                                a.border,
                              ),
                        )}
                      >
                        {course.cta}
                        <ArrowRight className="size-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
                      </a>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100",
                      a.bar,
                    )}
                  />
                </article>
              </StaggerItem>
            );
          })}
        </StaggerGroup>

        <p className="mt-12 text-center text-sm text-ink-soft">
          Not sure which course fits you?{" "}
          <a
            href="#contact"
            className="font-semibold text-navy-800 underline decoration-gold-400 decoration-2 underline-offset-4 transition-colors hover:text-well-700"
          >
            Talk to our team
          </a>{" "}
          — we will help you choose.
        </p>
      </div>
    </section>
  );
}
