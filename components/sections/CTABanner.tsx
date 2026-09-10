"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";
import Image from "next/image";
import type { CSSProperties } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { seeded } from "@/lib/gsap";

/** Fixed precision keeps the serialised markup byte-identical across SSR and hydration. */
const r = (value: number, places = 2) => Number(value.toFixed(places));

const sparks = Array.from({ length: 18 }, (_, i) => ({
  left: r(seeded(i, 3.7) * 100),
  top: r(seeded(i, 8.1) * 100),
  size: r(3 + seeded(i, 5.9) * 6),
  duration: r(6 + seeded(i, 12.3) * 8),
  delay: r(seeded(i, 15.1) * 6),
}));

export default function CTABanner() {
  const reduce = useReducedMotion();

  return (
    <section className="relative py-12 sm:py-16 lg:py-20">
      <div className="container-page">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[2.25rem] px-6 py-16 text-center shadow-lift sm:px-12 sm:py-20 lg:px-16 lg:py-24 grain">
            {/* Gradient bed */}
            <div className="absolute inset-0 -z-20 bg-[linear-gradient(120deg,#14402a_0%,#2e8b57_26%,#0a4d9d_62%,#083c79_84%,#a87b12_100%)]" />
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_20%,rgba(101,183,65,0.55),transparent_48%),radial-gradient(circle_at_82%_78%,rgba(244,197,66,0.45),transparent_48%)]" />

            {/* Drifting sparks */}
            <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
              {sparks.map((s, i) => (
                <span
                  key={i}
                  className="wf-spark absolute rounded-full bg-white/60"
                  style={
                    {
                      left: `${s.left}%`,
                      top: `${s.top}%`,
                      "--wf-size": `${s.size}px`,
                      "--wf-dur": `${s.duration}s`,
                      "--wf-delay": `${s.delay}s`,
                    } as CSSProperties
                  }
                />
              ))}
            </div>

            {/* Watermark emblem */}
            <motion.div
              className="pointer-events-none absolute -right-12 -top-12 -z-10 opacity-[0.14] sm:-right-8"
              animate={reduce ? {} : { rotate: 360 }}
              transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
            >
              <Image
                src="/logo-mark.webp"
                alt=""
                width={280}
                height={280}
                className="size-56 sm:size-72"
              />
            </motion.div>

            <h2 className="mx-auto max-w-3xl text-3xl font-semibold leading-[1.12] text-white sm:text-4xl lg:text-[3.1rem]">
              Join the Wellthyfy Movement
            </h2>

            <p className="mx-auto mt-5 max-w-2xl font-display text-lg font-medium text-white/85 sm:text-2xl">
              Choose Health. Build Wealth. Enjoy Happiness.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
              <a
                href="#contact"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-navy-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-50 hover:shadow-lift sm:w-auto"
              >
                Become a Member
                <ArrowRight className="size-4.5 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a
                href="#contact"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/45 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/70 hover:bg-white/20 sm:w-auto"
              >
                Contact Us
                <MessageCircle className="size-4.5 transition-transform duration-300 group-hover:scale-110" />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
