import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { EmptyState } from "@/components/platform/DashboardShell";
import { accentStyles, cn } from "@/lib/accents";
import { CATEGORY_META, formatINR, type Course } from "@/lib/platform";
import { requireAdmin } from "@/lib/supabase/auth";
import { setCourseStatusAdmin } from "../actions";

export default async function AdminCoursesPage() {
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);
  const courses = (data ?? []) as Course[];

  if (courses.length === 0) {
    return <EmptyState title="No courses yet" body="Approved applications and faculty-created courses appear here." />;
  }

  return (
    <ul className="grid gap-3">
      {courses.map((c) => {
        const meta = CATEGORY_META[c.category];
        const a = accentStyles[meta.accent];
        const live = c.status === "published";
        return (
          <li key={c.id}>
            <article className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-navy-900/7 bg-white/85 p-5 shadow-soft backdrop-blur-sm">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-semibold", a.softBg, a.border, a.text)}>
                    {meta.label}
                  </span>
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                      live
                        ? "border-well-200 bg-well-50 text-well-800"
                        : "border-navy-900/10 bg-navy-50 text-ink-soft",
                    )}
                  >
                    {live ? "Live" : c.status === "draft" ? "Draft" : "Archived"}
                  </span>
                  {!c.faculty_id && (
                    <span className="rounded-full border border-gold-200 bg-gold-50 px-2.5 py-1 text-[11px] font-semibold text-gold-800">
                      Faculty account not created yet
                    </span>
                  )}
                </div>
                <p className="mt-2.5 font-semibold text-ink">{c.title}</p>
                <p className="mt-0.5 text-sm text-ink-soft">
                  {c.faculty_name ?? "Unknown faculty"} ·{" "}
                  {c.price_inr === 0 ? "Free" : formatINR(c.price_inr)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/courses/${c.slug}`}
                  className="rounded-full border border-navy-200 bg-white px-4 py-2 text-xs font-semibold text-navy-800 transition-colors hover:bg-navy-50"
                >
                  View
                </Link>
                <form action={setCourseStatusAdmin}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="status" value={live ? "draft" : "published"} />
                  <button
                    type="submit"
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5",
                      live
                        ? "border border-navy-200 bg-white text-navy-800 hover:bg-navy-50"
                        : "bg-gradient-to-r from-well-600 to-navy-700 text-white shadow-glow-green",
                    )}
                  >
                    {live ? (
                      <>
                        <EyeOff className="size-3.5" strokeWidth={2.4} />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="size-3.5" strokeWidth={2.4} />
                        Publish
                      </>
                    )}
                  </button>
                </form>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
