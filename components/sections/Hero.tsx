"use client";

import { motion } from "framer-motion";
import { ArrowRight, Users } from "lucide-react";
import { useEffect, useRef } from "react";
import { EASE } from "@/components/ui/Reveal";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Copy drifts and fades as the hero scrolls away.
      gsap.to("[data-hero-copy]", {
        yPercent: -10,
        opacity: 0.2,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: 0.8 },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="home"
      ref={rootRef}
      className="relative flex min-h-svh items-center overflow-hidden pb-24 pt-32 md:pt-40 lg:pb-28"
    >
      <div className="container-page w-full">
        <div data-hero-copy className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="inline-flex items-center gap-2.5 rounded-full border border-well-200 bg-white/80 py-1.5 pl-1.5 pr-4 shadow-sm backdrop-blur-sm"
          >
            <span className="rounded-full bg-gradient-to-r from-well-600 to-navy-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              Since day one
            </span>
            <span className="text-xs font-medium text-ink-soft">
              A complete lifestyle company, not a shortcut
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.75, ease: EASE }}
            className="mt-8 text-[2.6rem] font-semibold leading-[1.06] sm:text-6xl lg:text-7xl xl:text-[5rem]"
          >
            Empowering{" "}
            <span className="bg-gradient-to-r from-well-600 to-well-400 bg-clip-text text-transparent">
              Health
            </span>
            ,{" "}
            <span className="bg-gradient-to-r from-navy-700 to-navy-500 bg-clip-text text-transparent">
              Wealth
            </span>{" "}
            &amp;{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-gold-600 to-gold-400 bg-clip-text text-transparent">
                Happiness
              </span>
              <motion.svg
                className="absolute -bottom-2 left-0 h-3 w-full text-gold-400 sm:-bottom-3 sm:h-4"
                viewBox="0 0 200 12"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <motion.path
                  d="M2 8.5C40 3 92 1.8 150 4.4c18 .8 36 2.6 48 4.1"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.9, duration: 1, ease: EASE }}
                />
              </motion.svg>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.7, ease: EASE }}
            className="mt-9 font-display text-xl font-medium text-navy-800 sm:text-2xl"
          >
            A Complete Lifestyle Solution for Modern Life
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: EASE }}
            className="mt-6 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg"
          >
            Wellthyfy Lifestyle Ventures helps individuals and families achieve better health,
            stronger financial wellbeing, personal growth, and lasting happiness through holistic
            wellness programs, skill development initiatives, and community support.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease: EASE }}
            className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row"
          >
            <a
              href="#courses"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-well-600 via-well-500 to-navy-700 px-8 py-4 text-base font-semibold text-white shadow-glow-green transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift sm:w-auto"
            >
              Explore Courses
              <ArrowRight className="size-4.5 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <a
              href="#contact"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-navy-200 bg-white/80 px-8 py-4 text-base font-semibold text-navy-800 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-navy-300 hover:bg-white hover:shadow-soft sm:w-auto"
            >
              Join Community
              <Users className="size-4.5 transition-transform duration-300 group-hover:scale-110" />
            </a>
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.a
        href="#about"
        aria-label="Scroll to About"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-ink-soft transition-colors hover:text-well-700 lg:flex"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em]">Scroll</span>
        <span className="grid h-9 w-6 place-items-start rounded-full border border-navy-300/70 p-1.5">
          <motion.span
            className="size-1.5 rounded-full bg-well-600"
            animate={{ y: [0, 10, 0], opacity: [1, 0.35, 1] }}
            transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.a>
    </section>
  );
}
