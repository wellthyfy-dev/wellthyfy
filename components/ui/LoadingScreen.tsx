"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * Brand splash shown while the page settles. Dismisses on window load
 * (with a short floor so it never flashes) and always clears by 2.4s.
 */
export default function LoadingScreen() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const start = performance.now();
    const MIN_MS = 850;

    const finish = () => {
      const elapsed = performance.now() - start;
      window.setTimeout(() => setDone(true), Math.max(0, MIN_MS - elapsed));
    };

    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });

    const failsafe = window.setTimeout(() => setDone(true), 2400);
    return () => {
      window.removeEventListener("load", finish);
      window.clearTimeout(failsafe);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = done ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[100] grid place-items-center bg-[radial-gradient(120%_100%_at_50%_0%,#ffffff_0%,#f2f9f4_55%,#e8f3ec_100%)]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          role="status"
          aria-live="polite"
          aria-label="Loading Wellthyfy"
        >
          <div className="flex flex-col items-center gap-7">
            <div className="relative grid size-32 place-items-center sm:size-36">
              <motion.span
                className="absolute inset-0 rounded-full border-2 border-dashed border-well-300"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              <motion.span
                className="absolute inset-3 rounded-full border-2 border-navy-200"
                animate={{ rotate: -360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              />
              <motion.span
                className="absolute inset-0 rounded-full border border-gold-300/70"
                animate={{ scale: [1, 1.28, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <Image
                  src="/logo-mark.webp"
                  alt=""
                  width={110}
                  height={110}
                  priority
                  className="size-[4.6rem] sm:size-20"
                />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="flex flex-col items-center gap-3"
            >
              <p className="font-display text-2xl font-semibold tracking-tight">
                <span className="text-well-700">Well</span>
                <span className="text-navy-800">thy</span>
                <span className="text-gold-500">fy</span>
              </p>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-navy-700/70">
                Health · Wealth · Happiness
              </p>
              <span className="mt-1 h-[3px] w-40 overflow-hidden rounded-full bg-well-100">
                <motion.span
                  className="block h-full rounded-full bg-gradient-to-r from-well-500 via-navy-600 to-gold-500"
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{ duration: 1.4, ease: "easeInOut" }}
                />
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
