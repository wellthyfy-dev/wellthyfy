"use client";

import { ArrowUpRight } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { accentStyles, cn } from "@/lib/accents";
import { services } from "@/lib/site";

export default function Services() {
  return (
    <section id="services" className="relative scroll-mt-28 py-20 sm:py-24 lg:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Core Services"
          title="Everything a balanced life needs,"
          highlight="in one place"
          description="Six connected programs that support the body, the bank balance and the belonging — designed to work together rather than in isolation."
        />

        <StaggerGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-7">
          {services.map((service, index) => {
            const a = accentStyles[service.accent];
            return (
              <StaggerItem key={service.title} className="h-full">
                <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-navy-900/7 bg-white/85 p-7 shadow-soft backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-lift ring-brand-hover">
                  {/* Hover bloom */}
                  <span
                    className={cn(
                      "pointer-events-none absolute -left-20 -top-20 size-48 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100",
                      a.tintBg,
                    )}
                  />

                  <div className="relative flex items-start justify-between gap-4">
                    <span
                      className={cn(
                        "grid size-14 place-items-center rounded-2xl text-white transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6",
                        a.iconTile,
                        a.glow,
                      )}
                    >
                      <Icon name={service.icon} className="size-7" />
                    </span>
                    <span
                      className="font-display text-3xl font-semibold text-navy-900/8 transition-colors duration-500 group-hover:text-navy-900/15"
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="relative mt-6 text-xl font-semibold">{service.title}</h3>
                  <p className="relative mt-2.5 text-sm leading-relaxed text-ink-soft">
                    {service.description}
                  </p>

                  <ul className="relative mt-6 flex flex-wrap gap-2">
                    {service.points.map((point) => (
                      <li
                        key={point}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-300",
                          a.softBg,
                          a.border,
                          a.text,
                        )}
                      >
                        {point}
                      </li>
                    ))}
                  </ul>

                  <div className="relative mt-auto pt-7">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-800 opacity-0 transition-all duration-400 group-hover:opacity-100">
                      Explore
                      <ArrowUpRight className="size-4" strokeWidth={2.4} />
                    </span>
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
      </div>
    </section>
  );
}
