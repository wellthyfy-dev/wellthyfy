"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { EASE, Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/accents";
import { whyWellthyfy } from "@/lib/site";

const ACCENT_CYCLE = [
  { tile: "from-well-400 to-well-600", text: "text-well-700", bar: "bg-well-500" },
  { tile: "from-navy-500 to-navy-700", text: "text-navy-700", bar: "bg-navy-600" },
  { tile: "from-gold-400 to-gold-600", text: "text-gold-700", bar: "bg-gold-500" },
];

export default function WhyWellthyfy() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="why-wellthyfy" className="relative scroll-mt-28 overflow-hidden py-20 sm:py-24 lg:py-28">
      <div className="container-page">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16">
          {/* Visual */}
          <Reveal direction="right">
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              {/* soft rings behind the arch */}
              <div
                aria-hidden="true"
                className="absolute -left-8 top-10 size-40 rounded-full bg-gold-200/50 blur-2xl"
              />
              <div
                aria-hidden="true"
                className="absolute -right-6 bottom-6 size-48 rounded-full bg-well-200/60 blur-2xl"
              />

              <div className="group relative mx-auto w-[92%]">
                <div
                  aria-hidden="true"
                  className="absolute inset-[10%] rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(101,183,65,0.3),transparent_62%),radial-gradient(circle_at_70%_60%,rgba(244,197,66,0.28),transparent_62%)] blur-2xl"
                />
                <Image
                  src="/about/meditation.webp"
                  alt="A woman meditating on a yoga mat, surrounded by icons for yoga, herbal care, nutrition, learning, financial growth and community."
                  width={1100}
                  height={986}
                  sizes="(max-width: 1024px) 85vw, 520px"
                  className="relative h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              </div>

              {/* Floating trust badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: 0.25, duration: 0.7, ease: EASE }}
                whileHover={{ y: -4 }}
                className="absolute -bottom-4 left-0 flex max-w-[17rem] items-start gap-3 rounded-2xl border border-well-100 bg-white/95 p-4 shadow-lift backdrop-blur-md sm:left-2"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-well-500 to-navy-700 text-white shadow-glow-green">
                  <ShieldCheck className="size-5" strokeWidth={2} />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink">
                    A registered private limited company
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-ink-soft">
                    Transparent programs and a real address in Puducherry.
                  </span>
                </span>
              </motion.div>

              {/* Floating sparkle chip */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: 0.4, duration: 0.6, ease: EASE }}
                className="absolute bottom-24 right-0 flex items-center gap-2 rounded-full border border-gold-200 bg-white/95 px-4 py-2.5 text-sm font-semibold text-gold-800 shadow-lift sm:right-2"
              >
                <Sparkles className="size-4 text-gold-600 animate-float" />
                Holistic, not a shortcut
              </motion.div>
            </div>
          </Reveal>

          {/* Copy + reasons */}
          <div>
            <Reveal>
              <Eyebrow>Why Choose Wellthyfy</Eyebrow>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-6 text-3xl font-semibold leading-[1.14] sm:text-4xl lg:text-[2.7rem]">
                Reasons families keep <span className="text-gradient-brand">choosing us</span>
              </h2>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="mt-5 text-base leading-relaxed text-ink-soft sm:text-lg">
                We are not selling a shortcut. We build habits, skills and relationships that keep
                paying off long after the programme ends.
              </p>
            </Reveal>

            <ul className="mt-8 divide-y divide-navy-900/7 border-y border-navy-900/7">
              {whyWellthyfy.map((item, i) => {
                const c = ACCENT_CYCLE[i % ACCENT_CYCLE.length];
                const on = hovered === i;
                return (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ delay: i * 0.05, duration: 0.5, ease: EASE }}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    className="relative"
                  >
                    <div
                      className={cn(
                        "relative flex items-center gap-4 py-4 transition-transform duration-300",
                        on && "translate-x-2",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-xl transition-all duration-300",
                          on
                            ? `bg-gradient-to-br ${c.tile} rotate-6 scale-110 text-white shadow-soft`
                            : `bg-white ${c.text} ring-1 ring-navy-900/8`,
                        )}
                      >
                        <Check className="size-4.5" strokeWidth={3} />
                      </span>
                      <p className="text-[1.02rem] font-medium leading-snug text-ink">{item}</p>
                      <span
                        className="ml-auto font-display text-sm font-semibold text-navy-900/20"
                        aria-hidden="true"
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute bottom-0 left-0 h-0.5 origin-left transition-transform duration-500",
                        c.bar,
                        on ? "w-full scale-x-100" : "w-full scale-x-0",
                      )}
                    />
                  </motion.li>
                );
              })}
            </ul>

            <Reveal delay={0.2}>
              <Link
                href="/contact"
                className="group mt-9 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-well-600 to-navy-700 px-6 py-3.5 text-sm font-semibold text-white shadow-glow-green transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
              >
                Talk to us
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
