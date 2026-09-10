"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, Sunrise } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { accentStyles, cn } from "@/lib/accents";
import { morningClub } from "@/lib/site";

export default function MorningClub() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-navy-950 py-20 text-white sm:py-24 lg:py-32 grain">
      {/* Sunrise atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 size-[52rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(244,197,66,0.30),transparent_62%)] blur-3xl" />
        <div className="absolute -left-32 bottom-0 size-[34rem] rounded-full bg-[radial-gradient(circle,rgba(46,139,87,0.28),transparent_65%)] blur-3xl" />
        <div className="absolute -right-24 top-1/3 size-[32rem] rounded-full bg-[radial-gradient(circle,rgba(30,136,229,0.30),transparent_65%)] blur-3xl" />
        {/* Horizon line */}
        <div className="absolute inset-x-0 top-[16%] h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />
      </div>

      <div className="container-page relative">
        {/* Header */}
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
          <Reveal>
            <Eyebrow tone="dark">Start Your Day Right</Eyebrow>
          </Reveal>

          <Reveal delay={0.08}>
            <motion.span
              className="grid size-16 place-items-center rounded-2xl border border-gold-400/30 bg-gold-400/10 text-gold-300 backdrop-blur-sm"
              animate={reduce ? {} : { y: [0, -8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sunrise className="size-8" strokeWidth={1.7} />
            </motion.span>
          </Reveal>

          <Reveal delay={0.12}>
            <h2 className="text-3xl font-semibold leading-[1.12] text-white sm:text-4xl lg:text-[2.9rem]">
              Daily Morning <span className="text-gradient-gold">Wellthyfy Club</span>
            </h2>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="max-w-xl text-base leading-relaxed text-navy-100/75 sm:text-lg">
              Thirty focused minutes, every morning. Small enough to keep, powerful enough to change
              the shape of your year.
            </p>
          </Reveal>
        </div>

        {/* Timeline */}
        <div className="relative mx-auto mt-16 max-w-3xl lg:mt-20">
          {/* Spine */}
          <motion.span
            className="absolute left-[1.85rem] top-4 w-px origin-top bg-gradient-to-b from-well-400 via-gold-400 to-navy-400 sm:left-1/2 sm:-translate-x-1/2"
            style={{ bottom: "3.5rem" }}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.3, ease: "easeInOut" }}
          />

          <ol className="space-y-10 sm:space-y-14">
            {morningClub.map((step, i) => {
              const a = accentStyles[step.accent];
              const alignRight = i % 2 === 1;

              return (
                <li key={step.title} className="relative">
                  <div
                    className={cn(
                      "flex items-start gap-5 sm:items-center sm:gap-0",
                      alignRight ? "sm:flex-row-reverse" : "sm:flex-row",
                    )}
                  >
                    {/* Card */}
                    <motion.div
                      className={cn(
                        "order-2 flex-1 sm:order-none",
                        alignRight ? "sm:pl-12 sm:text-left" : "sm:pr-12 sm:text-right",
                      )}
                      initial={{ opacity: 0, x: reduce ? 0 : alignRight ? 40 : -40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="group rounded-2xl border border-white/12 bg-white/[0.06] p-6 backdrop-blur-md transition-all duration-500 hover:border-white/25 hover:bg-white/[0.1]">
                        <div
                          className={cn(
                            "flex items-center gap-3",
                            alignRight ? "sm:justify-start" : "sm:justify-end",
                          )}
                        >
                          <span
                            className={cn(
                              "grid size-11 place-items-center rounded-xl text-white transition-transform duration-500 group-hover:scale-110",
                              a.iconTile,
                              alignRight ? "sm:order-first" : "sm:order-last",
                            )}
                          >
                            <Icon name={step.icon} className="size-5.5" />
                          </span>
                          <h3 className="text-xl font-semibold text-white sm:text-[1.4rem]">
                            <span className="text-gradient-gold font-display">{step.minutes}</span>{" "}
                            {step.title}
                          </h3>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-navy-100/70">
                          {step.description}
                        </p>
                      </div>
                    </motion.div>

                    {/* Node */}
                    <motion.span
                      className="relative z-10 order-1 grid size-15 shrink-0 place-items-center rounded-full border border-white/20 bg-navy-900 shadow-[0_0_0_6px_rgba(4,32,63,1)] sm:order-none"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
                    >
                      <span className={cn("absolute inset-1.5 rounded-full opacity-20", a.bar)} />
                      <span className="relative font-display text-lg font-bold text-white">
                        {step.minutes}
                      </span>
                      <span className="relative -mt-1 block text-[7px] font-bold uppercase tracking-widest text-navy-200">
                        min
                      </span>
                    </motion.span>

                    {/* Spacer on desktop */}
                    <div className="hidden flex-1 sm:block" />
                  </div>

                  {/* Down arrow between steps */}
                  {i < morningClub.length - 1 && (
                    <motion.span
                      className="absolute left-[1.85rem] -bottom-8 z-10 -translate-x-1/2 text-gold-400/70 sm:left-1/2 sm:-bottom-11"
                      animate={reduce ? {} : { y: [0, 6, 0], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.4 }}
                    >
                      <ArrowDown className="size-5" strokeWidth={2.4} />
                    </motion.span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {/* Closing statement */}
        <Reveal delay={0.1}>
          <div className="mx-auto mt-20 max-w-2xl text-center">
            <div className="mx-auto mb-8 h-px w-24 bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" />
            <p className="font-display text-3xl font-semibold leading-[1.3] sm:text-4xl lg:text-[2.7rem]">
              <span className="block bg-gradient-to-r from-well-300 to-well-400 bg-clip-text text-transparent">
                Live Healthy.
              </span>
              <span className="block bg-gradient-to-r from-navy-300 to-navy-400 bg-clip-text text-transparent">
                Live Wealthy.
              </span>
              <span className="block bg-gradient-to-r from-gold-300 to-gold-400 bg-clip-text text-transparent">
                Live Happy.
              </span>
            </p>

            <a
              href="#contact"
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-semibold text-navy-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-50 hover:shadow-lift"
            >
              Join the Morning Club
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
