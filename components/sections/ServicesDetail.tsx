import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { accentStyles, cn } from "@/lib/accents";
import { serviceSlug, services } from "@/lib/site";

/** Where each service leads next on the site. */
const related: Record<string, { label: string; href: string }> = {
  "health-wellness": { label: "Wellness courses", href: "/courses#wellness" },
  "financial-education": { label: "Wealth courses", href: "/courses#wealth" },
  "lifestyle-coaching": { label: "Happiness courses", href: "/courses#happiness" },
  "skill-development": { label: "Professional courses", href: "/courses#professional" },
  "partnership-opportunities": { label: "Become a faculty", href: "/become-a-faculty" },
};

const alts: Record<string, string> = {
  "health-wellness": "A woman meditating on a yoga mat on a sunlit terrace overlooking hills and a lake.",
  "financial-education":
    "A young woman planning her finances at a laptop beside books on personal finance, investing and wealth planning.",
  "lifestyle-coaching":
    "A smiling man with a notebook beside a board of lifestyle goals: stay healthy, be productive, be happy, grow personally.",
  "skill-development": "A laptop surrounded by digital marketing icons — social media, search, video and analytics.",
  "community-empowerment":
    "Wellthyfy volunteers of all ages planting a sapling together — growing together for a better tomorrow.",
  "partnership-opportunities":
    "Two professionals shaking hands while colleagues applaud — collaborate, grow and create impact.",
};

/** Every service in full, alternating sides; each row is a jump target. */
export default function ServicesDetail() {
  return (
    <div className="container-page pb-8">
      <div className="grid gap-20 lg:gap-28">
        {services.map((service, i) => {
          const slug = serviceSlug(service.title);
          const a = accentStyles[service.accent];
          const flip = i % 2 === 1;
          const next = related[slug];
          return (
            <section
              key={slug}
              id={slug}
              aria-labelledby={`${slug}-title`}
              className="grid scroll-mt-28 items-center gap-10 lg:grid-cols-2 lg:gap-16"
            >
              <Reveal direction={flip ? "left" : "right"} className={cn(flip && "lg:order-2")}>
                <div className="group relative">
                  <div
                    aria-hidden="true"
                    className={cn("absolute -inset-3 rounded-[2.5rem] opacity-70 blur-2xl", a.softBg)}
                  />
                  <div className="relative aspect-video overflow-hidden rounded-[2rem] border-[6px] border-white shadow-lift">
                    <Image
                      src={`/core-services/${slug}.webp`}
                      alt={alts[slug] ?? service.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 600px"
                      className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                    />
                  </div>
                  <span
                    className={cn(
                      "absolute -bottom-5 grid size-16 place-items-center rounded-2xl text-white shadow-lift ring-4 ring-white transition-transform duration-500 group-hover:-rotate-6",
                      flip ? "-left-3 lg:left-auto lg:-right-3" : "-left-3",
                      a.iconTile,
                    )}
                  >
                    <Icon name={service.icon} className="size-7" />
                  </span>
                </div>
              </Reveal>

              <Reveal direction={flip ? "right" : "left"} delay={0.08}>
                <div>
                  <p className={cn("text-xs font-bold uppercase tracking-[0.2em]", a.text)}>
                    Service {String(i + 1).padStart(2, "0")}
                  </p>
                  <h2 id={`${slug}-title`} className="mt-3 text-3xl font-semibold leading-tight sm:text-[2.3rem]">
                    {service.title}
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">
                    {service.description}
                  </p>

                  <h3 className="mt-8 text-sm font-semibold uppercase tracking-[0.14em] text-navy-700/70">
                    What it includes
                  </h3>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {service.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-center gap-3 rounded-xl border border-navy-900/7 bg-white/80 px-4 py-3 text-[0.95rem] font-medium text-ink shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft"
                      >
                        <span className={cn("grid size-6 shrink-0 place-items-center rounded-full text-white", a.iconTile)}>
                          <Check className="size-3.5" strokeWidth={3} />
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href="/contact"
                      className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-well-600 to-navy-700 px-6 py-3 text-sm font-semibold text-white shadow-glow-green transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
                    >
                      Enquire now
                      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                    {next && (
                      <Link
                        href={next.href}
                        className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white/85 px-6 py-3 text-sm font-semibold text-navy-800 transition-all duration-300 hover:-translate-y-0.5 hover:border-navy-300 hover:shadow-soft"
                      >
                        {next.label}
                      </Link>
                    )}
                  </div>
                </div>
              </Reveal>
            </section>
          );
        })}
      </div>
    </div>
  );
}
