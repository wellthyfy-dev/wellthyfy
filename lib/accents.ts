import type { Accent } from "./site";

/**
 * Static class maps — Tailwind scans source for complete class strings,
 * so every variant is spelled out rather than interpolated.
 */
export const accentStyles: Record<
  Accent,
  {
    text: string;
    softText: string;
    iconTile: string;
    softBg: string;
    tintBg: string;
    border: string;
    hoverBorder: string;
    glow: string;
    dot: string;
    bar: string;
    hex: string;
    rgb: string;
  }
> = {
  green: {
    text: "text-well-700",
    softText: "text-well-600",
    iconTile: "bg-gradient-to-br from-well-400 to-well-600",
    softBg: "bg-well-50",
    tintBg: "bg-well-100/60",
    border: "border-well-200",
    hoverBorder: "group-hover:border-well-300",
    glow: "shadow-glow-green",
    dot: "bg-well-500",
    bar: "bg-gradient-to-r from-well-400 to-well-600",
    hex: "#2E8B57",
    rgb: "46 139 87",
  },
  navy: {
    text: "text-navy-700",
    softText: "text-navy-600",
    iconTile: "bg-gradient-to-br from-navy-500 to-navy-800",
    softBg: "bg-navy-50",
    tintBg: "bg-navy-100/60",
    border: "border-navy-200",
    hoverBorder: "group-hover:border-navy-300",
    glow: "shadow-glow-navy",
    dot: "bg-navy-500",
    bar: "bg-gradient-to-r from-navy-500 to-navy-800",
    hex: "#0A4D9D",
    rgb: "10 77 157",
  },
  gold: {
    text: "text-gold-700",
    softText: "text-gold-600",
    iconTile: "bg-gradient-to-br from-gold-400 to-gold-600",
    softBg: "bg-gold-50",
    tintBg: "bg-gold-100/60",
    border: "border-gold-200",
    hoverBorder: "group-hover:border-gold-300",
    glow: "shadow-glow-gold",
    dot: "bg-gold-500",
    bar: "bg-gradient-to-r from-gold-400 to-gold-600",
    hex: "#D4A017",
    rgb: "212 160 23",
  },
};

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
