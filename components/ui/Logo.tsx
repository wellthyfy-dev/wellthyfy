import Image from "next/image";
import { cn } from "@/lib/accents";

/**
 * Brand lockup built from the real logo artwork: the circular emblem beside
 * the actual "Wellthyfy / LIFESTYLE VENTURES" wordmark.
 *
 * The supplied logo (`public/logo-full.png`) is a *stacked* lockup — emblem
 * over wordmark over tagline. At a header height of 80px that whole stack is
 * only ~82px wide, which renders "LIFESTYLE VENTURES" and the tagline at four
 * or five pixels tall. So the emblem and wordmark are cropped from the
 * full-resolution source and set side by side instead, which keeps the real
 * typography legible in a horizontal bar.
 *
 * Sizes are Tailwind classes rather than inline styles so the lockup can scale
 * per breakpoint. At full size it is ~254px wide, which does not fit beside a
 * menu button on a phone, so the header steps down on small screens.
 */
const VARIANTS = {
  /** 48px → 64px → 80px emblem. */
  header: {
    emblem: "size-12 sm:size-16 md:size-20",
    wordmark: "h-[1.55rem] sm:h-[2.05rem] md:h-[2.6rem]",
    gap: "gap-2.5 md:gap-3.5",
  },
  /** 80px emblem — the footer has room for the full lockup at every width. */
  footer: {
    emblem: "size-20",
    wordmark: "h-[2.6rem]",
    gap: "gap-3.5",
  },
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
  const size = VARIANTS[variant];

  return (
    <span className={cn("flex items-center", size.gap, className)}>
      <Image
        src="/logo-mark.webp"
        alt=""
        width={160}
        height={160}
        priority={priority}
        sizes="80px"
        className={cn("shrink-0 drop-shadow-sm transition-all duration-300", size.emblem)}
      />
      <Image
        src="/logo-wordmark.webp"
        alt="Wellthyfy Lifestyle Ventures"
        width={900}
        height={230}
        priority={priority}
        sizes="160px"
        className={cn("w-auto shrink-0 transition-all duration-300", size.wordmark)}
      />
    </span>
  );
}
