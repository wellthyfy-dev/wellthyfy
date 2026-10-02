"use client";

import { ArrowRight, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { accentStyles, cn } from "@/lib/accents";
import { CATALOGUE_COUNT, coursePillars, coursesForPillar } from "@/lib/courses";

export default function Courses() {
  return (
    <section id="courses" className="relative scroll-mt-28 py-20 sm:py-24 lg:py-28">
      {/* Soft band behind the section */}
      <div className="pointer-events-none absolute inset-x-0 top-1/4 -z-10 h-3/4 bg-gradient-to-b from-well-50/70 via-white/40 to-transparent" />

      <div className="container-page">
        <SectionHeading
          eyebrow="Wellthyfy Courses"
          title="Learn. Apply. Grow."
          highlight="Thrive."
          description={`${CATALOGUE_COUNT} courses across three pillars — wellness, wealth and happiness. Start wherever you need it most.`}
        />

        <StaggerGroup className="mt-14 grid gap-7 lg:mt-16 lg:grid-cols-3">
          {coursePillars.map((pillar) => {
            const a = accentStyles[pillar.accent];
            const count = coursesForPillar(pillar.id).length;

            return (
              <StaggerItem key={pillar.id} className="h-full">
                <Link
                  href={`/courses#${pillar.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-navy-900/8 bg-white shadow-soft transition-all duration-500 hover:-translate-y-2.5 hover:shadow-lift"
                >
                  {/* Header band */}
                  <div className={cn("relative overflow-hidden px-7 py-8", a.iconTile)}>
                    <div
                      className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:16px_16px]"
                      aria-hidden="true"
                    />
                    <span className="relative grid size-14 place-items-center rounded-2xl bg-white/20 text-white backdrop-blur-sm transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                      <Icon name={pillar.icon} className="size-7" />
                    </span>
                    <h3 className="relative mt-5 font-display text-3xl font-semibold text-white">
                      {pillar.title}
                    </h3>
                    <p className="relative mt-2 text-sm font-medium text-white/85">
                      {pillar.tagline}
                    </p>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-7">
                    <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-700/60">
                      <GraduationCap className={cn("size-4", a.softText)} strokeWidth={2.2} />
                      {count} courses
                    </p>

                    <ul className="mt-4 flex flex-wrap gap-2">
                      {pillar.topics.map((topic) => (
                        <li
                          key={topic}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-xs font-medium",
                            a.softBg,
                            a.border,
                            a.text,
                          )}
                        >
                          {topic}
                        </li>
                      ))}
                    </ul>

                    <span className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-semibold text-navy-800 transition-colors group-hover:text-well-700">
                      {pillar.cta}
                      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>

                  <span
                    className={cn(
                      "h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100",
                      a.bar,
                    )}
                  />
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerGroup>

        {/* Core message */}
        <div className="mx-auto mt-14 max-w-2xl text-center">
          <p className="font-display text-xl font-medium leading-relaxed text-navy-800 sm:text-2xl">
            We do not just teach courses. We help people build{" "}
            <span className="text-gradient-brand">better habits, better knowledge</span> and better
            lives.
          </p>
          <Link
            href="/courses"
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-well-600 via-well-500 to-navy-700 px-7 py-4 text-sm font-semibold text-white shadow-glow-green transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
          >
            View all {CATALOGUE_COUNT} courses
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
