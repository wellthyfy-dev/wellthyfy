import Image from "next/image";
import { cn } from "@/lib/accents";

/**
 * The full Wellthyfy logo — emblem, "Wellthyfy" and "LIFESTYLE VENTURES" in
 * one artwork (`public/logo-full.webp`, trimmed, transparent, ~3.6 : 1).
 *
 * Heights are Tailwind classes so the logo can scale per breakpoint; width
 * follows the artwork's aspect ratio. The header steps down on small screens
 * so it fits beside the menu button, and stays clear of the centred nav links
 * on desktop.
 */
const VARIANTS = {
  /** ≈174px → 232px → 247px wide. */
  header: "h-12 sm:h-16 md:h-[4.25rem]",
  /** ≈290px wide — the footer has room at every width. */
  footer: "h-20",
} as const;

export function Logo({
  variant = "header",
  className,
  priority = false,
}: {
  variant?: keyof typeof VARIANTS;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo-full.webp"
      alt="Wellthyfy Lifestyle Ventures"
      width={1200}
      height={331}
      priority={priority}
      sizes="(max-width: 640px) 180px, 300px"
      className={cn("w-auto shrink-0 transition-all duration-300", VARIANTS[variant], className)}
    />
  );
}
