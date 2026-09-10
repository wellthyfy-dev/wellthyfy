"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// registerPlugin is idempotent, so a repeat import is harmless.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** True when the visitor asked the OS to minimise motion. */
export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Deterministic pseudo-random in [0,1) so server and client markup match.
 * Avoids hydration mismatches for decorative scattered elements.
 */
export function seeded(index: number, salt = 1) {
  const x = Math.sin((index + 1) * 12.9898 * salt) * 43758.5453;
  return x - Math.floor(x);
}

export { gsap, ScrollTrigger };
