"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { whatsappIconPath } from "@/components/layout/SocialLinks";
import { siteConfig, whatsappUrl } from "@/lib/site";

const MESSAGE = "Hi Wellthyfy, I'd like to book a consultation appointment.";

/** Hidden where it would get in the way of work screens. */
const HIDDEN_ON = ["/admin", "/classes"];

/**
 * Floating "Book a consultation" button on every public page. Opens WhatsApp
 * chat with a ready-to-send message.
 */
export default function ConsultationButton() {
  const pathname = usePathname();
  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <motion.a
      href={`${whatsappUrl}?text=${encodeURIComponent(MESSAGE)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Book a consultation appointment on WhatsApp, ${siteConfig.phone}`}
      initial={{ opacity: 0, y: 24, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
      className="group fixed bottom-6 right-5 z-50 flex items-center gap-3 rounded-full bg-[#25D366] p-3 text-white shadow-[0_12px_30px_-8px_rgba(37,211,102,0.65)] ring-4 ring-white/70 sm:bottom-8 sm:right-8 sm:py-2.5 sm:pl-3 sm:pr-5"
    >
      <span className="relative grid size-8 shrink-0 place-items-center">
        <span
          aria-hidden="true"
          className="absolute inset-0 animate-ping rounded-full bg-white/40 motion-reduce:hidden"
          style={{ animationDuration: "2.4s" }}
        />
        <svg viewBox="0 0 30 30" className="relative size-7 fill-current" aria-hidden="true">
          <path d={whatsappIconPath} />
        </svg>
      </span>
      <span className="hidden leading-tight sm:block">
        <span className="block text-sm font-bold">Book a consultation</span>
        <span className="block text-[11px] font-medium text-white/85">
          WhatsApp {siteConfig.phone.replace("+91 ", "")}
        </span>
      </span>
    </motion.a>
  );
}
