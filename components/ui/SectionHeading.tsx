import type { ReactNode } from "react";
import { cn } from "@/lib/accents";
import { Reveal } from "./Reveal";

export function Eyebrow({
  children,
  tone = "light",
  className,
}: {
  children: ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em]",
        tone === "light"
          ? "border border-well-200/80 bg-white/80 text-well-700 shadow-sm"
          : "border border-white/20 bg-white/10 text-well-200 backdrop-blur-sm",
        className,
      )}
    >
      <span
        className={cn("size-1.5 rounded-full", tone === "light" ? "bg-gold-500" : "bg-gold-400")}
        aria-hidden="true"
      />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  highlight,
  description,
  tone = "light",
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  /** Trailing words rendered in the brand gradient. */
  highlight?: string;
  description?: ReactNode;
  tone?: "light" | "dark";
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" ? "mx-auto max-w-3xl items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow && (
        <Reveal direction="up">
          <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
        </Reveal>
      )}
      <Reveal direction="up" delay={0.08}>
        <h2
          className={cn(
            "text-balance text-3xl font-semibold leading-[1.12] sm:text-4xl lg:text-[2.9rem]",
            tone === "dark" && "text-white",
          )}
        >
          {title}{" "}
          {highlight && (
            <span className={tone === "dark" ? "text-gradient-gold" : "text-gradient-brand"}>
              {highlight}
            </span>
          )}
        </h2>
      </Reveal>
      {description && (
        <Reveal direction="up" delay={0.16}>
          <p
            className={cn(
              "max-w-2xl text-base leading-relaxed sm:text-lg",
              tone === "dark" ? "text-navy-100/80" : "text-ink-soft",
            )}
          >
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
