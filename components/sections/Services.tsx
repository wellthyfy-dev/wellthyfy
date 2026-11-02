"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { EASE, Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { accentStyles, cn } from "@/lib/accents";
import { serviceSlug, services } from "@/lib/site";

const AUTOPLAY_MS = 6500;

/** Photo for each service (public/core-services, 16:9). */
const visuals: Record<string, { src: string; alt: string; position?: string }> = {
  "Health & Wellness": {
    src: "/core-services/health-wellness.webp",
    alt: "A woman meditating on a yoga mat on a sunlit terrace overlooking hills and a lake.",
  },
  "Financial Education": {
    src: "/core-services/financial-education.webp",
    alt: "A young woman planning her finances at a laptop beside books on personal finance, investing and wealth planning.",
  },
  "Lifestyle Coaching": {
    src: "/core-services/lifestyle-coaching.webp",
    alt: "A smiling man with a notebook beside a board of lifestyle goals: stay healthy, be productive, be happy, grow personally.",
  },
  "Skill Development": {
    src: "/core-services/skill-development.webp",
    alt: "A laptop surrounded by digital marketing icons — social media, search, video and analytics.",
  },
  "Community Empowerment": {
    src: "/core-services/community-empowerment.webp",
    alt: "Wellthyfy volunteers of all ages planting a sapling together — growing together for a better tomorrow.",
  },
  "Partnership Opportunities": {
    src: "/core-services/partnership-opportunities.webp",
    alt: "Two professionals shaking hands while colleagues applaud — collaborate, grow and create impact.",
  },
};

export default function Services() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [userPicked, setUserPicked] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  // Only auto-advance while the section is on screen, not hovered, and until
  // the visitor makes a choice of their own.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (paused || userPicked || !inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => setActive((i) => (i + 1) % services.length), AUTOPLAY_MS);
    return () => window.clearTimeout(t);
  }, [active, paused, userPicked, inView]);

  const pick = useCallback((i: number, focus = false) => {
    setActive(i);
    setUserPicked(true);
    if (focus) tabRefs.current[i]?.focus();
  }, []);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = services.length - 1;
    const next =
      e.key === "ArrowDown" || e.key === "ArrowRight"
        ? active === last ? 0 : active + 1
        : e.key === "ArrowUp" || e.key === "ArrowLeft"
          ? active === 0 ? last : active - 1
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : null;
    if (next === null) return;
    e.preventDefault();
    pick(next, true);
  };

  const service = services[active];
  const a = accentStyles[service.accent];
  const visual = visuals[service.title];
  const running = !paused && !userPicked && inView;

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative scroll-mt-28 py-20 sm:py-24 lg:py-28"
    >
      <div className="container-page">
        <SectionHeading
          eyebrow="Core Services"
          title="Everything a balanced life needs,"
          highlight="in one place"
          description="Six connected programs that support the body, the bank balance and the belonging — pick one to see what it includes."
        />

        <Reveal>
          <div
            className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* Tabs */}
            <div
              role="tablist"
              aria-label="Wellthyfy services"
              aria-orientation="vertical"
              onKeyDown={onKey}
              className="-mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:auto-rows-fr lg:gap-3 lg:overflow-visible lg:px-0 lg:pb-0"
            >
              {services.map((s, i) => {
                const sa = accentStyles[s.accent];
                const selected = i === active;
                return (
                  <button
                    key={s.title}
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    role="tab"
                    id={`service-tab-${i}`}
                    aria-selected={selected}
                    aria-controls="service-panel"
                    tabIndex={selected ? 0 : -1}
                    onClick={() => pick(i)}
                    className={cn(
                      "group relative flex shrink-0 snap-start items-center gap-4 overflow-hidden rounded-2xl px-4 py-3.5 text-left transition-all duration-300 lg:h-full lg:px-5 lg:py-4",
                      selected
                        ? "bg-white shadow-lift ring-1 ring-navy-900/5"
                        : "bg-white/40 hover:bg-white/80 hover:shadow-soft",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-11 shrink-0 place-items-center rounded-xl transition-all duration-500",
                        selected ? cn(sa.iconTile, "text-white", sa.glow) : cn(sa.softBg, sa.text),
                        "group-hover:-rotate-6",
                      )}
                    >
                      <Icon name={s.icon} className="size-5.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block whitespace-nowrap text-[0.95rem] font-semibold text-ink lg:whitespace-normal">
                        {s.title}
                      </span>
                      <span className="mt-0.5 hidden text-xs leading-snug text-ink-soft lg:line-clamp-2">
                        {s.description}
                      </span>
                    </span>
                    <span
                      className="ml-auto hidden font-display text-lg font-semibold text-navy-900/15 lg:block"
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    {/* Autoplay progress */}
                    {selected && (
                      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-navy-900/5">
                        <motion.span
                          key={`${active}-${running}`}
                          className={cn("block h-full origin-left", sa.bar)}
                          initial={{ scaleX: running ? 0 : 1 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: running ? AUTOPLAY_MS / 1000 : 0, ease: "linear" }}
                        />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Panel */}
            <div
              id="service-panel"
              role="tabpanel"
              aria-labelledby={`service-tab-${active}`}
              className="relative overflow-hidden rounded-[2rem] border border-navy-900/7 bg-white shadow-lift"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <div className="relative aspect-video overflow-hidden bg-well-50">
                    <motion.div
                      className="absolute inset-0"
                      initial={{ scale: 1.08 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 1.2, ease: EASE }}
                    >
                      <Image
                        src={visual.src}
                        alt={visual.alt}
                        fill
                        sizes="(max-width: 1024px) 100vw, 680px"
                        className={cn("object-cover", visual.position ?? "object-center")}
                      />
                    </motion.div>
                    <span
                      className={cn(
                        "absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-sm",
                        a.text,
                      )}
                    >
                      <Icon name={service.icon} className="size-4" />
                      {String(active + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="p-6 sm:p-8">
                    <h3 className="text-2xl font-semibold sm:text-[1.75rem]">{service.title}</h3>
                    <p className="mt-2.5 text-base leading-relaxed text-ink-soft">
                      {service.description}
                    </p>
                    <ul className="mt-6 grid content-start gap-2.5 sm:grid-cols-2 lg:min-h-[5.75rem]">
                      {service.points.map((point, i) => (
                        <motion.li
                          key={point}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 + i * 0.06, duration: 0.4, ease: EASE }}
                          className="flex items-center gap-2.5 text-sm font-medium text-ink"
                        >
                          <span className={cn("grid size-6 shrink-0 place-items-center rounded-full text-white", a.iconTile)}>
                            <Check className="size-3.5" strokeWidth={3} />
                          </span>
                          {point}
                        </motion.li>
                      ))}
                    </ul>
                    <Link
                      href={`/services#${serviceSlug(service.title)}`}
                      className="group mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-well-600 to-navy-700 px-6 py-3 text-sm font-semibold text-white shadow-glow-green transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
                    >
                      Learn more
                      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 text-center">
          <Link
            href="/services"
            className="group inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white/85 px-7 py-3.5 text-sm font-semibold text-navy-800 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-navy-300 hover:shadow-soft"
          >
            View all services in detail
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
