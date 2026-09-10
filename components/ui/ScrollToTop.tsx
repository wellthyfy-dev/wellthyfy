"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(y > 300);
      setProgress(max > 0 ? Math.min(1, y / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const R = 21;
  const CIRC = 2 * Math.PI * R;

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label="Scroll back to top"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                ? "auto"
                : "smooth",
            })
          }
          initial={{ opacity: 0, scale: 0.4, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.4, y: 20 }}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
          className="group fixed bottom-6 right-5 z-50 grid size-13 place-items-center rounded-full bg-white/90 shadow-lift backdrop-blur-md ring-1 ring-navy-900/8 sm:bottom-8 sm:right-8"
        >
          {/* Reading-progress ring */}
          <svg
            className="absolute inset-0 size-full -rotate-90"
            viewBox="0 0 52 52"
            aria-hidden="true"
          >
            <circle cx="26" cy="26" r={R} fill="none" stroke="rgb(220 241 228)" strokeWidth="2.5" />
            <circle
              cx="26"
              cy="26"
              r={R}
              fill="none"
              stroke="url(#stt-grad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - progress)}
              style={{ transition: "stroke-dashoffset 120ms linear" }}
            />
            <defs>
              <linearGradient id="stt-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#65B741" />
                <stop offset="55%" stopColor="#0A4D9D" />
                <stop offset="100%" stopColor="#D4A017" />
              </linearGradient>
            </defs>
          </svg>
          <ArrowUp
            className="size-5 text-navy-800 transition-transform duration-300 group-hover:-translate-y-0.5"
            strokeWidth={2.4}
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
