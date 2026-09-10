import Image from "next/image";
import type { Accent } from "@/lib/site";

/**
 * Course cover photography. Files live in `public/courses/<id>.webp`,
 * built 1200x600 from the sources in `assets/brand/`.
 */

/** Brand wash laid over the photo so the badge and duration text stay legible. */
const TINTS: Record<Accent, string> = {
  gold: "from-gold-900/55 via-gold-700/10 to-transparent",
  green: "from-well-900/60 via-well-800/10 to-transparent",
  navy: "from-navy-950/60 via-navy-800/10 to-transparent",
};

const ALTS: Record<string, string> = {
  beautician:
    "A client receiving a facial treatment, surrounded by brushes, skincare products and towels.",
  yoga: "A woman seated in a cross-legged meditation pose on a mat, overlooking green hills at sunrise.",
  "digital-marketing":
    "A laptop on a desk with social media, analytics and advertising icons rising above it.",
};

export default function CourseCover({
  id,
  accent,
  priority = false,
}: {
  id: string;
  accent: Accent;
  priority?: boolean;
}) {
  return (
    <div className="relative h-52 overflow-hidden">
      <Image
        src={`/courses/${id}.webp`}
        alt={ALTS[id] ?? ""}
        fill
        priority={priority}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover"
      />

      {/* Legibility wash — darkest at the bottom where the duration label sits */}
      <div
        className={`absolute inset-0 bg-gradient-to-t ${TINTS[accent]}`}
        aria-hidden="true"
      />
      {/* Slight top scrim for the badge chip */}
      <div
        className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/25 to-transparent"
        aria-hidden="true"
      />
    </div>
  );
}
