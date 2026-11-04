"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PersonAvatar } from "@/components/illustrations/Illustrations";
import { Icon } from "@/components/ui/Icon";
import { EASE, Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { accentStyles, cn } from "@/lib/accents";
import { audiences } from "@/lib/site";

/** One illustrated person per audience, in the same order as `audiences`. */
const people = [
  { skin: "#c98b5f", hair: "#2b1d16", shirt: "#0a4d9d", style: "cap" },
  { skin: "#e2b08a", hair: "#5a3b26", shirt: "#2e8b57", style: "short" },
  { skin: "#a86d45", hair: "#1c120d", shirt: "#e4ae28", style: "long" },
  { skin: "#d89a6c", hair: "#20140f", shirt: "#1e88e5", style: "bun" },
  { skin: "#b97a50", hair: "#d4d4d4", shirt: "#45a06b", style: "grey" },
  { skin: "#c48256", hair: "#2b1d16", shirt: "#d4a017", style: "short" },
] as const;

export default function WhoCanJoin() {
  const [active, setActive] = useState(0);
  const audience = audiences[active];
  const a = accentStyles[audience.accent];
  const person = people[active];

  return (
    <section className="relative overflow-hidden py-20 sm:py-24 lg:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Who Can Join"
          title="Built for every stage of"
          highlight="life"
          description="Wellthyfy meets you where you are, whatever your age or schedule. Tap a person to see how it fits them."
        />

        <Reveal>
          <div className="mt-12 grid items-center gap-12 lg:mt-16 lg:grid-cols-2 lg:gap-16">
            {/* Orbit */}
            <div className="relative mx-auto aspect-square w-full max-w-[22rem] sm:max-w-[28rem]">
              {/* rings */}
              <div aria-hidden="true" className="absolute inset-[8%] rounded-full border-2 border-dashed border-navy-900/10 animate-spin-slow" />
              <div aria-hidden="true" className="absolute inset-[24%] rounded-full bg-gradient-to-br from-well-50 via-white to-gold-50 shadow-[inset_0_0_40px_rgba(46,139,87,0.12)]" />

              {/* centre: the selected person */}
              <div className="absolute inset-[27%] grid place-items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="relative size-full"
                  >
                    <span className={cn("absolute inset-0 rounded-full opacity-60 blur-xl", a.softBg)} />
                    <PersonAvatar
                      {...person}
                      className="relative size-full rounded-full bg-white shadow-lift ring-[6px] ring-white"
                    />
                    <span
                      className={cn(
                        "absolute -bottom-1 -right-1 grid size-12 place-items-center rounded-full text-white ring-4 ring-white sm:size-14",
                        a.iconTile,
                      )}
                    >
                      <Icon name={audience.icon} className="size-6" />
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* people around the ring */}
              <div role="tablist" aria-label="Who Wellthyfy is for">
                {audiences.map((aud, i) => {
                  const angle = (-90 + i * 60) * (Math.PI / 180);
                  const left = 50 + 42 * Math.cos(angle);
                  const top = 50 + 42 * Math.sin(angle);
                  const selected = i === active;
                  const pa = accentStyles[aud.accent];
                  return (
                    <button
                      key={aud.title}
                      role="tab"
                      aria-selected={selected}
                      aria-controls="audience-panel"
                      aria-label={aud.title}
                      onClick={() => setActive(i)}
                      onMouseEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      style={{ left: `${left.toFixed(2)}%`, top: `${top.toFixed(2)}%` }}
                      className="group absolute -translate-x-1/2 -translate-y-1/2"
                    >
                      <span
                        className={cn(
                          "absolute inset-0 rounded-full transition-all duration-300",
                          selected ? cn(pa.softBg, "scale-125 animate-pulse-ring") : "scale-100",
                        )}
                        aria-hidden="true"
                      />
                      <PersonAvatar
                        {...people[i]}
                        className={cn(
                          "relative size-14 rounded-full bg-white shadow-soft ring-4 transition-all duration-300 sm:size-[4.5rem]",
                          selected ? "scale-110 ring-white shadow-lift" : "ring-white/70 group-hover:scale-105",
                        )}
                      />
                      <span
                        className={cn(
                          "absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm sm:block",
                          selected ? cn(pa.iconTile, "text-white") : "bg-white/90 text-ink-soft",
                        )}
                      >
                        {aud.title.split(" ")[0] === "Anyone" ? "Anyone" : aud.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detail */}
            <div id="audience-panel" role="tabpanel" aria-live="polite" className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="relative overflow-hidden rounded-[2rem] border border-navy-900/7 bg-white p-7 shadow-lift sm:p-9"
                >
                  <span className={cn("absolute -right-16 -top-16 size-48 rounded-full opacity-60 blur-2xl", a.softBg)} />
                  <span
                    className={cn(
                      "relative inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold",
                      a.softBg,
                      a.text,
                    )}
                  >
                    <Icon name={audience.icon} className="size-4" />
                    {String(active + 1).padStart(2, "0")} / {String(audiences.length).padStart(2, "0")}
                  </span>
                  <h3 className="relative mt-5 text-2xl font-semibold leading-snug sm:text-3xl">
                    {audience.title}
                  </h3>
                  <p className="relative mt-3 text-base leading-relaxed text-ink-soft sm:text-lg">
                    {audience.description}
                  </p>
                  <Link
                    href="/contact"
                    className="group relative mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-well-600 to-navy-700 px-6 py-3 text-sm font-semibold text-white shadow-glow-green transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
                  >
                    This is me — get started
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              </AnimatePresence>

              {/* Quick pills (also great on small screens) */}
              <div className="mt-6 flex flex-wrap gap-2">
                {audiences.map((aud, i) => (
                  <button
                    key={aud.title}
                    type="button"
                    onClick={() => setActive(i)}
                    className={cn(
                      "rounded-full border px-3.5 py-2 text-xs font-semibold transition-all duration-300",
                      i === active
                        ? "border-transparent bg-navy-800 text-white shadow-soft"
                        : "border-navy-900/10 bg-white/80 text-ink-soft hover:border-navy-200 hover:text-navy-800",
                    )}
                  >
                    {aud.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
