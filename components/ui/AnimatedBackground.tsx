"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { gsap, prefersReducedMotion, seeded } from "@/lib/gsap";

/** A single stylised leaf, drawn once and reused via <use>. */
function LeafSprite() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <defs>
        <symbol id="wf-leaf" viewBox="0 0 64 64">
          <path
            d="M56 8C34 6 12 16 8 36c-2 11 4 20 14 21 16 2 30-12 34-49z"
            fill="currentColor"
            opacity="0.9"
          />
          <path
            d="M56 8C40 22 26 38 14 57"
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M44 17c-8 1-14 4-18 9M50 26c-8 2-13 6-16 11"
            fill="none"
            stroke="rgba(255,255,255,0.32)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </symbol>
      </defs>
    </svg>
  );
}

const LEAF_TONES = ["text-well-500/30", "text-well-400/28", "text-well-600/22", "text-gold-400/24"];

/** Fixed precision keeps the serialised markup byte-identical across SSR and hydration. */
const r = (value: number, places = 2) => Number(value.toFixed(places));

const leaves = Array.from({ length: 16 }, (_, i) => ({
  left: r(4 + seeded(i, 1.7) * 92),
  top: r(3 + seeded(i, 3.1) * 94),
  size: r(22 + seeded(i, 5.3) * 44),
  rotate: r(seeded(i, 7.9) * 360),
  tone: LEAF_TONES[i % LEAF_TONES.length],
  depth: r(0.12 + seeded(i, 2.3) * 0.38, 3),
  duration: r(7 + seeded(i, 11.1) * 9),
  delay: r(seeded(i, 13.7) * 6),
}));

const particles = Array.from({ length: 26 }, (_, i) => ({
  left: r(seeded(i, 17.3) * 100),
  top: r(seeded(i, 19.7) * 100),
  size: r(2 + seeded(i, 23.1) * 5),
  depth: r(0.2 + seeded(i, 29.5) * 0.6, 3),
  duration: r(9 + seeded(i, 31.3) * 12),
  delay: r(seeded(i, 37.1) * 8),
  gold: seeded(i, 41.9) > 0.62,
}));

export default function AnimatedBackground() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Depth-based parallax: each decorative element drifts at its own rate.
      gsap.utils.toArray<HTMLElement>("[data-depth]").forEach((el) => {
        const depth = Number(el.dataset.depth ?? 0.2);
        gsap.to(el, {
          yPercent: -depth * 260,
          xPercent: (depth - 0.35) * 40,
          ease: "none",
          scrollTrigger: {
            trigger: document.documentElement,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.1,
            invalidateOnRefresh: true,
          },
        });
      });

      // Slow breathing motion on the colour glows.
      gsap.utils.toArray<HTMLElement>("[data-glow]").forEach((el, i) => {
        gsap.to(el, {
          scale: 1.18,
          x: i % 2 === 0 ? 60 : -50,
          y: i % 2 === 0 ? -40 : 50,
          duration: 14 + i * 3,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <LeafSprite />

      {/* Base wash */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-10%,#ffffff_0%,#f7fbf8_45%,#eef6f1_100%)]" />

      {/* Colour glows */}
      <div
        data-glow
        className="absolute -left-32 top-[-10%] size-[46rem] rounded-full bg-[radial-gradient(circle,rgba(101,183,65,0.20),transparent_66%)] blur-3xl"
      />
      <div
        data-glow
        className="absolute -right-40 top-[24%] size-[42rem] rounded-full bg-[radial-gradient(circle,rgba(30,136,229,0.17),transparent_66%)] blur-3xl"
      />
      <div
        data-glow
        className="absolute left-[18%] top-[62%] size-[38rem] rounded-full bg-[radial-gradient(circle,rgba(244,197,66,0.16),transparent_66%)] blur-3xl"
      />
      <div
        data-glow
        className="absolute right-[6%] bottom-[-8%] size-[34rem] rounded-full bg-[radial-gradient(circle,rgba(46,139,87,0.16),transparent_66%)] blur-3xl"
      />

      {/* Floating leaves */}
      {leaves.map((leaf, i) => (
        <div
          key={`leaf-${i}`}
          data-depth={leaf.depth}
          className="absolute"
          style={{ left: `${leaf.left}%`, top: `${leaf.top}%` }}
        >
          <svg
            className={`wf-leaf ${leaf.tone} blur-[0.3px]`}
            style={
              {
                "--wf-size": `${leaf.size}px`,
                "--wf-rot": `${leaf.rotate}deg`,
                "--wf-dur": `${leaf.duration}s`,
                "--wf-delay": `${leaf.delay}s`,
              } as CSSProperties
            }
            viewBox="0 0 64 64"
          >
            <use href="#wf-leaf" />
          </svg>
        </div>
      ))}

      {/* Light particles */}
      {particles.map((p, i) => (
        <span
          key={`particle-${i}`}
          data-depth={p.depth}
          className={`wf-particle absolute rounded-full ${
            p.gold ? "bg-gold-400/50" : "bg-well-400/45"
          } shadow-[0_0_10px_currentColor]`}
          style={
            {
              left: `${p.left}%`,
              top: `${p.top}%`,
              "--wf-size": `${p.size}px`,
              "--wf-dur": `${p.duration}s`,
              "--wf-delay": `${p.delay}s`,
            } as CSSProperties
          }
        />
      ))}

      {/* Fine grid for structure */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(14,34,51,0.028)_1px,transparent_1px),linear-gradient(to_bottom,rgba(14,34,51,0.028)_1px,transparent_1px)] bg-[size:76px_76px] [mask-image:radial-gradient(85%_65%_at_50%_35%,#000,transparent)]" />
    </div>
  );
}
