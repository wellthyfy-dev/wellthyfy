"use client";

import { Icon } from "@/components/ui/Icon";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { accentStyles, cn } from "@/lib/accents";
import { audiences } from "@/lib/site";

export default function WhoCanJoin() {
  return (
    <section className="relative py-20 sm:py-24 lg:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Who Can Join"
          title="Built for every stage of"
          highlight="life"
          description="Wellthyfy was designed to be genuinely inclusive — the programme meets you where you are, whatever your age or schedule."
        />

        <StaggerGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {audiences.map((audience) => {
            const a = accentStyles[audience.accent];
            return (
              <StaggerItem key={audience.title} className="h-full">
                <article className="group relative flex h-full flex-col items-center overflow-hidden rounded-3xl border border-navy-900/7 bg-white/85 p-8 text-center shadow-soft backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-lift ring-brand-hover">
                  {/* Decorative arc backdrop */}
                  <svg
                    className={cn(
                      "pointer-events-none absolute -top-10 left-1/2 h-40 w-64 -translate-x-1/2 opacity-40 transition-opacity duration-500 group-hover:opacity-70",
                      a.text,
                    )}
                    viewBox="0 0 256 160"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle cx="128" cy="72" r="62" stroke="currentColor" strokeOpacity="0.16" />
                    <circle cx="128" cy="72" r="46" stroke="currentColor" strokeOpacity="0.22" />
                    <circle cx="128" cy="72" r="30" stroke="currentColor" strokeOpacity="0.28" />
                  </svg>

                  {/* Illustration badge */}
                  <div className="relative mt-2">
                    <span
                      className={cn(
                        "absolute inset-0 rounded-full opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-70",
                        a.softBg,
                      )}
                    />
                    <span
                      className={cn(
                        "relative grid size-20 place-items-center rounded-full text-white transition-transform duration-500 group-hover:scale-110",
                        a.iconTile,
                        a.glow,
                      )}
                    >
                      <Icon name={audience.icon} className="size-9" strokeWidth={1.6} />
                    </span>
                    {/* Orbiting accent dot */}
                    <span
                      className={cn(
                        "absolute -right-1 top-1 size-3.5 rounded-full ring-4 ring-white transition-transform duration-500 group-hover:scale-125",
                        a.dot,
                      )}
                      aria-hidden="true"
                    />
                  </div>

                  <h3 className="relative mt-6 text-lg font-semibold leading-snug sm:text-xl">
                    {audience.title}
                  </h3>
                  <p className="relative mt-3 text-sm leading-relaxed text-ink-soft">
                    {audience.description}
                  </p>

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
      </div>
    </section>
  );
}
