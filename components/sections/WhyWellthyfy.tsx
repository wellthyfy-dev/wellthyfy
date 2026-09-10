"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { whyWellthyfy } from "@/lib/site";

const ACCENT_CYCLE = [
  "from-well-400 to-well-600",
  "from-navy-500 to-navy-700",
  "from-gold-400 to-gold-600",
];

export default function WhyWellthyfy() {
  return (
    <section id="why-wellthyfy" className="relative scroll-mt-28 py-20 sm:py-24 lg:py-28">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          {/* Intro */}
          <div className="lg:sticky lg:top-28 lg:self-start">
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

            <Reveal delay={0.2}>
              <div className="mt-8 flex items-start gap-4 rounded-2xl border border-well-100 bg-well-50/70 p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-well-500 to-navy-700 text-white shadow-glow-green">
                  <ShieldCheck className="size-5.5" strokeWidth={2} />
                </span>
                <div>
                  <p className="font-semibold text-ink">A registered private limited company</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                    Transparent programs, named faculty and a real address in Puducherry.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.26}>
              <a
                href="#contact"
                className="group mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-well-600 to-navy-700 px-6 py-3.5 text-sm font-semibold text-white shadow-glow-green transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
              >
                Talk to us
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </Reveal>
          </div>

          {/* Checklist */}
          <StaggerGroup as="ul" className="grid gap-4 sm:grid-cols-2">
            {whyWellthyfy.map((item, i) => (
              <StaggerItem as="li" key={item} className="h-full">
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  className="group flex h-full items-start gap-4 rounded-2xl border border-navy-900/7 bg-white/85 p-5 shadow-soft backdrop-blur-sm transition-shadow duration-400 hover:shadow-lift sm:p-6"
                >
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${
                      ACCENT_CYCLE[i % ACCENT_CYCLE.length]
                    } text-white transition-transform duration-400 group-hover:scale-110 group-hover:rotate-6`}
                  >
                    <Check className="size-4.5" strokeWidth={3} />
                  </span>
                  <p className="pt-1.5 text-[0.98rem] font-medium leading-snug text-ink">{item}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </div>
    </section>
  );
}
