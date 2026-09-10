import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { accentStyles, cn } from "@/lib/accents";
import { pillars } from "@/lib/site";

/** Health / Wealth / Happiness as overlapping circles — the section's argument in one picture. */
function BalanceArtwork() {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      {/* Soft colour halo so the artwork sits in the page rather than on it */}
      <div
        className="absolute inset-6 rounded-full bg-[radial-gradient(circle_at_32%_28%,rgba(101,183,65,0.18),transparent_62%),radial-gradient(circle_at_74%_38%,rgba(30,136,229,0.16),transparent_62%),radial-gradient(circle_at_50%_82%,rgba(244,197,66,0.18),transparent_62%)] blur-2xl"
        aria-hidden="true"
      />
      <Image
        src="/balance.webp"
        alt="Health, Wealth and Happiness shown as three overlapping circles, with Balance at the centre where all three meet."
        width={1100}
        height={1079}
        sizes="(max-width: 1024px) 90vw, 32rem"
        className="relative w-full"
      />
    </div>
  );
}

export default function About() {
  return (
    <section id="about" className="relative scroll-mt-28 py-20 sm:py-28 lg:py-32">
      <div className="container-page">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          <Reveal direction="right">
            <BalanceArtwork />
          </Reveal>

          <div>
            <Reveal direction="left">
              <Eyebrow>About Wellthyfy</Eyebrow>
            </Reveal>

            <Reveal direction="left" delay={0.08}>
              <h2 className="mt-6 text-3xl font-semibold leading-[1.14] sm:text-4xl lg:text-[2.7rem]">
                A holistic lifestyle company built on{" "}
                <span className="text-gradient-brand">balance</span>
              </h2>
            </Reveal>

            <Reveal direction="left" delay={0.14}>
              <p className="mt-6 text-base leading-relaxed text-ink-soft sm:text-lg">
                Wellthyfy Lifestyle Ventures Pvt. Ltd. is a holistic lifestyle company dedicated to
                empowering individuals and communities to achieve balanced and fulfilling lives.
              </p>
            </Reveal>

            <Reveal direction="left" delay={0.2}>
              <p className="mt-5 border-l-2 border-gold-400 pl-5 font-display text-lg font-medium leading-relaxed text-navy-800 sm:text-xl">
                We believe true success comes when Health, Wealth and Happiness grow together.
              </p>
            </Reveal>

            <Reveal direction="left" delay={0.28}>
              <a
                href="#services"
                className="group mt-8 inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white/80 px-6 py-3.5 text-sm font-semibold text-navy-800 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-navy-300 hover:shadow-soft"
              >
                See what we do
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </Reveal>
          </div>
        </div>

        {/* Three pillars */}
        <StaggerGroup className="mt-20 grid gap-6 md:grid-cols-3 lg:mt-24 lg:gap-7">
          {pillars.map((pillar) => {
            const a = accentStyles[pillar.accent];
            return (
              <StaggerItem key={pillar.title}>
                <article
                  className={cn(
                    "group relative h-full overflow-hidden rounded-3xl border border-navy-900/7 bg-white/85 p-7 shadow-soft backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-lift ring-brand-hover",
                  )}
                >
                  {/* Corner tint that blooms on hover */}
                  <span
                    className={cn(
                      "pointer-events-none absolute -right-16 -top-16 size-40 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100",
                      a.tintBg,
                    )}
                  />

                  <span
                    className={cn(
                      "relative grid size-14 place-items-center rounded-2xl text-white transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6",
                      a.iconTile,
                      a.glow,
                    )}
                  >
                    <Icon name={pillar.icon} className="size-7" />
                  </span>

                  <h3 className="relative mt-6 text-xl font-semibold sm:text-[1.35rem]">
                    {pillar.title}
                  </h3>
                  <p className="relative mt-2.5 text-sm leading-relaxed text-ink-soft">
                    {pillar.blurb}
                  </p>

                  <ul className="relative mt-6 space-y-3 border-t border-navy-900/7 pt-5">
                    {pillar.points.map((point) => (
                      <li key={point} className="flex items-center gap-3 text-[0.95rem] text-ink">
                        <span
                          className={cn(
                            "grid size-5 shrink-0 place-items-center rounded-full",
                            a.softBg,
                          )}
                        >
                          <Check className={cn("size-3", a.text)} strokeWidth={3.2} />
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>

                  {/* Base accent bar */}
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
