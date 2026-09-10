"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/accents";
import { navLinks, siteConfig } from "@/lib/site";

const SECTION_IDS = navLinks.map((l) => l.href.replace("#", ""));

/** Login buttons are placeholders until the portals ship. */
function ComingSoonButton({
  label,
  variant,
  className,
}: {
  label: string;
  variant: "ghost" | "solid";
  className?: string;
}) {
  return (
    <span className="group/tip relative inline-flex">
      <a
        href="#"
        aria-disabled="true"
        onClick={(e) => e.preventDefault()}
        className={cn(
          "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 focus-visible:outline-navy-700",
          variant === "ghost"
            ? "border border-navy-200 bg-white/70 text-navy-800 hover:border-navy-300 hover:bg-white hover:shadow-sm"
            : "bg-gradient-to-r from-well-600 to-navy-700 text-white shadow-glow-green hover:from-well-500 hover:to-navy-600 hover:shadow-lift",
          className,
        )}
      >
        {label}
      </a>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-50 mt-2.5 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-lg bg-navy-900 px-2.5 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-lift transition-all duration-200 group-hover/tip:translate-y-0 group-hover/tip:opacity-100 group-focus-within/tip:translate-y-0 group-focus-within/tip:opacity-100"
      >
        <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-navy-900" />
        Coming Soon
      </span>
    </span>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the nav item for the section currently in view.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled
            ? "border-b border-navy-900/[0.07] bg-white/75 shadow-[0_4px_30px_-12px_rgba(14,34,51,0.16)] backdrop-blur-xl backdrop-saturate-150"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <nav
          aria-label="Primary"
          className="container-page flex h-[4.6rem] items-center justify-between gap-4 sm:h-24 md:h-[6.5rem]"
        >
          <a href="#home" className="shrink-0 rounded-lg" aria-label={`${siteConfig.name} — home`}>
            <Logo variant="header" priority />
          </a>

          {/* Centre links */}
          <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 xl:flex">
            {navLinks.map((link) => {
              const id = link.href.replace("#", "");
              const isActive = active === id;
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "relative block rounded-full px-4 py-2 text-[0.9rem] font-medium transition-colors duration-300",
                      isActive ? "text-navy-800" : "text-ink-soft hover:text-navy-800",
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-well-50 ring-1 ring-well-200/70"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Right actions */}
          <div className="hidden items-center gap-2.5 lg:flex">
            <ComingSoonButton label="Student Login" variant="ghost" />
            <ComingSoonButton label="Faculty Login" variant="solid" />
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex size-11 items-center justify-center rounded-full border border-navy-200 bg-white/80 text-navy-800 shadow-sm transition-colors hover:bg-white xl:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </nav>
      </header>

      {/* Mobile sheet */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-navy-950/45 backdrop-blur-sm xl:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              id="mobile-menu"
              className="fixed inset-x-0 top-[4.6rem] z-[45] mx-3 sm:top-24 md:top-[6.5rem] overflow-hidden rounded-3xl border border-well-100 bg-white/95 p-5 shadow-lift backdrop-blur-xl xl:hidden"
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <ul className="flex flex-col gap-1">
                {navLinks.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.05 }}
                  >
                    <a
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-medium text-ink transition-colors hover:bg-well-50 hover:text-well-700"
                    >
                      {link.label}
                      <span className="size-1.5 rounded-full bg-gold-400" aria-hidden="true" />
                    </a>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-4 grid gap-2.5 border-t border-navy-900/8 pt-4">
                <ComingSoonButton label="Student Login" variant="ghost" className="w-full py-3" />
                <ComingSoonButton label="Faculty Login" variant="solid" className="w-full py-3" />
                <a
                  href={siteConfig.phoneHref}
                  className="mt-1 flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-navy-800 transition-colors hover:text-well-700"
                >
                  <Phone className="size-4" />
                  {siteConfig.phone}
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
