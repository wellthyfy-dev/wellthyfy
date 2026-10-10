import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Layers, User } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { accentStyles, cn } from "@/lib/accents";
import { CATEGORY_META, MODE_LABELS, formatINR, type Course } from "@/lib/platform";

export function PublishedCourseCard({ course }: { course: Course }) {
  const meta = CATEGORY_META[course.category];
  const a = accentStyles[meta.accent];

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-navy-900/8 bg-white shadow-soft transition-all duration-500 hover:-translate-y-2 hover:shadow-lift"
    >
      <div
        className={cn(
          "relative overflow-hidden",
          course.cover_url ? "h-40" : cn("px-6 py-5", a.iconTile),
        )}
      >
        {course.cover_url ? (
          <>
            <Image
              src={course.cover_url}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Keeps the chips legible over any photo */}
            <div
              className="absolute inset-0 bg-gradient-to-b from-navy-950/55 via-navy-950/10 to-transparent"
              aria-hidden="true"
            />
          </>
        ) : (
          <div
            className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:14px_14px]"
            aria-hidden="true"
          />
        )}

        <div
          className={cn(
            "relative flex items-center justify-between gap-3",
            course.cover_url && "px-5 py-4",
          )}
        >
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-white/90 drop-shadow">
            <Icon name={meta.icon} className="size-3.5" />
            {meta.label}
          </span>
          <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            {course.subcategory}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-semibold leading-snug">{course.title}</h3>
        {course.summary && (
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{course.summary}</p>
        )}

        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-ink-soft">
          <li className="inline-flex items-center gap-1.5">
            <Layers className="size-3.5" strokeWidth={2.2} />
            {MODE_LABELS[course.mode]}
          </li>
          {course.faculty_name && (
            <li className="inline-flex items-center gap-1.5">
              <User className="size-3.5" strokeWidth={2.2} />
              {course.faculty_name}
            </li>
          )}
        </ul>

        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          <span className="font-display text-xl font-semibold text-ink">
            {course.price_inr === 0 ? "Free" : formatINR(course.price_inr)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-800 transition-colors group-hover:text-well-700">
            View
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>

      <span
        className={cn(
          "h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100",
          a.bar,
        )}
      />
    </Link>
  );
}
