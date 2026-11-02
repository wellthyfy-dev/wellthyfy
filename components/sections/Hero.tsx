"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Users } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { PersonAvatar } from "@/components/illustrations/Illustrations";
import { EASE } from "@/components/ui/Reveal";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const HERO_IMAGE = "/home/hero-group.webp";
const HERO_ALT =
  "A group of smiling learners in a bright, plant-filled room listening to a Wellthyfy mentor during a session.";

/** Left edge of the photo: the content column's edge, but at least 6vw. */
const PHOTO_LEFT = "max(6vw, calc((100vw - 80rem) / 2))";
/** Height of the photo at that width (941 / 1672 of its width). */
const PHOTO_HEIGHT = `calc((100vw - ${PHOTO_LEFT}) * 0.5628)`;
/** Soft left edge and soft bottom, as an alpha mask so the page tint shows through. */
const HERO_MASK =
  "linear-gradient(to right, transparent 0%, #000 14%), linear-gradient(to bottom, #000 72%, transparent 100%)";

function CommunityBadge({ className = "" }: { className?: string }) {
  return (
    <a
      href="#contact"
      className={`group inline-flex items-center gap-3 rounded-full border border-white/70 bg-white/80 py-2 pl-2 pr-4 shadow-soft backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lift ${className}`}
    >
      <span className="flex -space-x-2.5">
        {(
          [
            ["#c98b5f", "#2b1d16", "#2e8b57", "short"],
            ["#e2b08a", "#3a2a1f", "#0a4d9d", "long"],
            ["#a86d45", "#1c120d", "#e4ae28", "bun"],
          ] as const
        ).map(([skin, hair, shirt, style]) => (
          <PersonAvatar
            key={shirt}
            skin={skin}
            hair={hair}
            shirt={shirt}
            style={style}
            className="size-9 rounded-full bg-white ring-2 ring-white transition-transform duration-300 group-hover:scale-105"
          />
        ))}
      </span>
      <span className="text-left text-xs leading-tight">
        <span className="block font-semibold text-ink">Join our community</span>
        <span className="text-ink-soft">Grow together, every day</span>
      </span>
    </a>
  );
}

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);

  // Pointer position over the hero, -0.5…0.5, smoothed with a spring.
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 60, damping: 18 });
  const my = useSpring(rawY, { stiffness: 60, damping: 18 });
  const imgX = useTransform(mx, (v) => v * -14);
  const imgY = useTransform(my, (v) => v * -10);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = root.getBoundingClientRect();
      rawX.set((e.clientX - r.left) / r.width - 0.5);
      rawY.set((e.clientY - r.top) / r.height - 0.5);
    };
    const onLeave = () => {
      rawX.set(0);
      rawY.set(0);
    };
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);

    const ctx = gsap.context(() => {
      // Copy drifts and fades as the hero scrolls away.
      gsap.to("[data-hero-copy]", {
        yPercent: -10,
        opacity: 0.2,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: 0.8 },
      });
    }, root);

    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      ctx.revert();
    };
  }, [rawX, rawY]);

  return (
    <section
      id="home"
      ref={rootRef}
      style={{ ["--hero-photo-h" as string]: PHOTO_HEIGHT }}
      className="relative overflow-hidden pb-16 pt-28 sm:pt-32 xl:flex xl:min-h-[max(94svh,var(--hero-photo-h))] xl:items-center xl:pb-24 xl:pt-36"
    >
      {/* Desktop: full-width photo behind the whole hero. Pinned to its left
          edge so the empty, light side of the picture sits under the copy. */}
      <div
        aria-hidden="true"
        className="absolute right-0 top-0 hidden aspect-[1672/941] overflow-hidden xl:block"
        style={{
          left: PHOTO_LEFT,
          maskImage: HERO_MASK,
          WebkitMaskImage: HERO_MASK,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      >
        <motion.div style={{ x: imgX, y: imgY }} className="absolute -inset-3">
          <Image
            src={HERO_IMAGE}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-left"
          />
        </motion.div>
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden xl:block bg-[linear-gradient(90deg,#fbfdfb_0%,rgba(251,253,251,0.94)_18%,rgba(251,253,251,0.7)_30%,rgba(251,253,251,0)_42%)]"
      />

      <div className="container-page relative w-full">
        <div data-hero-copy className="max-w-2xl xl:max-w-[36rem]">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="inline-flex items-center gap-2.5 rounded-full border border-well-200 bg-white/80 py-1.5 pl-1.5 pr-4 shadow-sm backdrop-blur-sm"
          >
            <span className="rounded-full bg-gradient-to-r from-well-600 to-navy-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              Wellthyfy
            </span>
            <span className="text-xs font-medium text-ink-soft">
              A complete lifestyle company, not a shortcut
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.75, ease: EASE }}
            className="mt-7 text-[2.6rem] font-semibold leading-[1.06] sm:text-6xl xl:text-[4rem]"
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
            className="mt-8 font-display text-xl font-medium text-navy-800 sm:text-2xl"
          >
            A Complete Lifestyle Solution for Modern Life
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: EASE }}
            className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg xl:max-w-[29rem]"
          >
            Wellthyfy Lifestyle Ventures helps individuals and families achieve better health,
            stronger financial wellbeing, personal growth, and lasting happiness through holistic
            wellness programs, skill development initiatives, and community support.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease: EASE }}
            className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
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
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-navy-200 bg-white/85 px-8 py-4 text-base font-semibold text-navy-800 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-navy-300 hover:bg-white hover:shadow-soft sm:w-auto"
            >
              Join Community
              <Users className="size-4.5 transition-transform duration-300 group-hover:scale-110" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.7, ease: EASE }}
            className="mt-8 hidden xl:block"
          >
            <CommunityBadge />
          </motion.div>
        </div>

        {/* Mobile / tablet: the photo as a card under the copy */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.8, ease: EASE }}
          className="relative mt-10 xl:hidden"
        >
          <div className="relative aspect-[1672/941] overflow-hidden rounded-[1.75rem] shadow-lift">
            <Image
              src={HERO_IMAGE}
              alt={HERO_ALT}
              fill
              sizes="(max-width: 1280px) 100vw, 0px"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-navy-950/35 to-transparent" />
          </div>
          <div className="mt-5 flex justify-center">
            <CommunityBadge />
          </div>
        </motion.div>
      </div>

      {/* Accessible description of the decorative desktop photo */}
      <span className="sr-only">{HERO_ALT}</span>
    </section>
  );
}
