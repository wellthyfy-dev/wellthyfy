import Image from "next/image";
import { cn } from "@/lib/accents";

/**
 * Brand lockup: the circular emblem from the logo plus a typographic
 * wordmark that mirrors the original green / navy / gold colour split.
 *
 * Sizes are Tailwind classes rather than inline styles so the mark can scale
 * per breakpoint. At full size the lockup is ~275px wide, which does not fit
 * beside a menu button on a phone, so the header steps down on small screens.
 */
const VARIANTS = {
  /** 48px → 64px → 80px mark. */
  header: {
    mark: "size-12 sm:size-16 md:size-20",
    word: "text-[1.5rem] sm:text-[2rem] md:text-[2.5rem]",
    subline: "text-[0.45rem] sm:text-[0.58rem] md:text-[0.72rem] tracking-[0.24em]",
    gap: "gap-2.5 md:gap-3",
  },
  /** 80px mark — the footer has room for the full lockup at every width. */
  footer: {
    mark: "size-20",
    word: "text-[2.5rem]",
    subline: "text-[0.72rem] tracking-[0.24em]",
    gap: "gap-3",
  },
} as const;

export function Logo({
  variant = "header",
  className,
  tone = "light",
  showSubline = true,
  priority = false,
}: {
  variant?: keyof typeof VARIANTS;
  className?: string;
  tone?: "light" | "dark";
  showSubline?: boolean;
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
        className={cn("shrink-0 drop-shadow-sm transition-all duration-300", size.mark)}
      />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display font-semibold leading-none tracking-tight transition-all duration-300",
            size.word,
          )}
        >
          <span className={tone === "dark" ? "text-well-300" : "text-well-700"}>Well</span>
          <span className={tone === "dark" ? "text-white" : "text-navy-800"}>thy</span>
          <span className="text-gold-500">fy</span>
        </span>
        {showSubline && (
          <span
            className={cn(
              "mt-1.5 font-semibold uppercase leading-none",
              size.subline,
              tone === "dark" ? "text-navy-200/80" : "text-navy-700/70",
            )}
          >
            Lifestyle Ventures
          </span>
        )}
      </span>
    </span>
  );
}
