import Link from "next/link";
import { EmptyState } from "@/components/platform/DashboardShell";
import { accentStyles, cn } from "@/lib/accents";
import {
  CATEGORY_META,
  COURSE_STATUS_LABELS,
  COURSE_STATUS_TONE,
  formatINR,
  type Course,
  type CourseStatus,
} from "@/lib/platform";
import { requireAdmin } from "@/lib/supabase/auth";

const FILTERS: { key: CourseStatus | "all"; label: string }[] = [
  { key: "pending_review", label: "Waiting for approval" },
  { key: "published", label: "Live" },
  { key: "rejected", label: "Changes requested" },
  { key: "draft", label: "Drafts" },
  { key: "all", label: "All" },
];

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { status } = await searchParams;
  const active = FILTERS.some((f) => f.key === status) ? (status as string) : "pending_review";

  let query = supabase.from("courses").select("*").limit(300);
  query =
    active === "pending_review"
      ? query.order("submitted_at", { ascending: true })
      : query.order("created_at", { ascending: false });
  if (active !== "all") query = query.eq("status", active);

  const { data } = await query;
  const courses = (data ?? []) as Course[];

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/courses?status=${f.key}`}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              active === f.key
                ? "border-navy-700 bg-navy-800 text-white"
                : "border-navy-900/10 bg-white/80 text-ink-soft hover:text-navy-800",
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {courses.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Nothing here"
            body={
              active === "pending_review"
                ? "No courses are waiting for approval right now."
                : "No courses match this filter."
            }
          />
        </div>
      ) : (
        <ul className="mt-6 grid gap-3">
          {courses.map((c) => {
            const meta = CATEGORY_META[c.category];
            const a = accentStyles[meta.accent];
            return (
              <li key={c.id}>
                <Link
                  href={`/admin/courses/${c.id}`}
                  className="group flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-navy-900/7 bg-white/85 p-5 shadow-soft backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                          a.softBg,
                          a.border,
                          a.text,
                        )}
                      >
                        {meta.label}
                      </span>
                      <span className="rounded-full border border-navy-900/10 bg-white px-2.5 py-1 text-[11px] font-medium text-ink-soft">
                        {c.subcategory}
                      </span>
                    </div>
                    <p className="mt-2.5 font-semibold text-ink">{c.title}</p>
                    <p className="mt-0.5 text-sm text-ink-soft">
                      {c.faculty_name ?? "Unknown faculty"} ·{" "}
                      {c.price_inr === 0 ? "Free" : formatINR(c.price_inr)}
                      {c.status === "pending_review" && c.submitted_at && (
                        <>
                          {" "}
                          · submitted{" "}
                          {new Date(c.submitted_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </>
                      )}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold",
                      COURSE_STATUS_TONE[c.status],
                    )}
                  >
                    {COURSE_STATUS_LABELS[c.status]}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
