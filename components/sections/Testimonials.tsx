"use client";

import { Quote, Star } from "lucide-react";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { testimonials } from "@/lib/site";

const AVATAR_GRADIENTS = [
  "from-well-400 to-well-600",
  "from-navy-500 to-navy-700",
  "from-gold-400 to-gold-600",
];

export default function Testimonials() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24 lg:py-28">
      {/* Glass needs something rich to sit on */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-8 bottom-8 bg-[linear-gradient(125deg,#14402a_0%,#0a4d9d_48%,#083c79_78%,#553d0b_100%)] sm:inset-x-4 sm:rounded-[3rem]" />
        <div className="absolute inset-x-0 top-8 bottom-8 opacity-40 sm:inset-x-4 sm:rounded-[3rem] [background-image:radial-gradient(circle_at_20%_20%,rgba(101,183,65,0.5),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(244,197,66,0.42),transparent_45%)]" />
      </div>

      <div className="container-page py-6 sm:py-10">
        <SectionHeading
          eyebrow="Testimonials"
          title="Real people,"
          highlight="real change"
          tone="dark"
          description="A few words from members of the Wellthyfy community."
        />

        <StaggerGroup className="mt-14 grid gap-6 lg:mt-16 lg:grid-cols-3 lg:gap-7">
          {testimonials.map((t, i) => (
            <StaggerItem key={t.name} className="h-full">
              <figure className="group relative flex h-full flex-col rounded-3xl glass-card p-7 transition-all duration-500 hover:-translate-y-2 hover:border-white/40 hover:bg-white/[0.16] sm:p-8">
                {/* Sheen */}
                <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

                <Quote
                  className="size-9 shrink-0 text-gold-300/80"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />

                <blockquote className="mt-5 flex-1 text-[0.98rem] leading-relaxed text-white/85">
                  {t.quote}
                </blockquote>

                <div className="mt-6 flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: t.rating }).map((_, s) => (
                    <Star
                      key={s}
                      className="size-4 fill-gold-300 text-gold-300"
                      aria-hidden="true"
                    />
                  ))}
                </div>

                <figcaption className="mt-5 flex items-center gap-3.5 border-t border-white/15 pt-5">
                  <span
                    className={`grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br ${
                      AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]
                    } text-sm font-bold text-white ring-2 ring-white/25`}
                    aria-hidden="true"
                  >
                    {t.initials}
                  </span>
                  <span className="leading-tight">
                    <span className="block font-semibold text-white">{t.name}</span>
                    <span className="mt-0.5 block text-xs text-white/60">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
