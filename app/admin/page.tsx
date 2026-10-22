import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EmptyState, StatCard } from "@/components/platform/DashboardShell";
import { APPLICATION_STATUS_LABELS, type FacultyApplication } from "@/lib/faculty";
import { COURSE_STATUS_LABELS, formatINR, type Course } from "@/lib/platform";
import { requireAdmin } from "@/lib/supabase/auth";

const rowClass =
  "group flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-navy-900/7 bg-white/85 p-5 shadow-soft backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift";
const badgeClass =
  "rounded-full border border-gold-200 bg-gold-50 px-3 py-1.5 text-xs font-semibold text-gold-800";

function QueueHeader({ title, href, label }: { title: string; href: string; label: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 className="text-xl font-semibold sm:text-2xl">{title}</h2>
      <Link
        href={href}
        className="group inline-flex items-center gap-1.5 text-sm font-semibold text-navy-800 hover:text-well-700"
      >
        {label}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

export default async function AdminOverview() {
  const { supabase } = await requireAdmin();

  const head = (table: string) =>
    supabase.from(table).select("id", { count: "exact", head: true });

  const [pendingApps, pendingCourses, pendingPayments, liveCourses, faculty, recentApps, recentCourses] =
    await Promise.all([
      head("faculty_applications").eq("status", "pending"),
      head("courses").eq("status", "pending_review"),
      head("orders").eq("status", "pending"),
      head("courses").eq("status", "published"),
      head("profiles").eq("role", "faculty"),
      supabase
        .from("faculty_applications")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("courses")
        .select("*")
        .eq("status", "pending_review")
        .order("submitted_at", { ascending: true })
        .limit(5),
    ]);

  const apps = (recentApps.data ?? []) as FacultyApplication[];
  const courses = (recentCourses.data ?? []) as Course[];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Applications to review" value={pendingApps.count ?? 0} tone="gold" />
        <StatCard label="Courses to review" value={pendingCourses.count ?? 0} tone="gold" />
        <StatCard label="Payments to verify" value={pendingPayments.count ?? 0} tone="gold" />
        <StatCard label="Live courses" value={liveCourses.count ?? 0} tone="green" />
        <StatCard label="Faculty accounts" value={faculty.count ?? 0} tone="navy" />
      </div>

      <section className="mt-12">
        <QueueHeader
          title="Faculty applications"
          href="/admin/applications"
          label="All applications"
        />
        {apps.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              title="All caught up"
              body="New faculty applications appear here the moment someone submits one."
            />
          </div>
        ) : (
          <ul className="mt-5 grid gap-3">
            {apps.map((a) => (
              <li key={a.id}>
                <Link href={`/admin/applications/${a.id}`} className={rowClass}>
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{a.full_name}</p>
                    <p className="mt-0.5 truncate text-sm text-ink-soft">
                      {a.qualification ?? a.course_title ?? a.contact_email}
                    </p>
                  </div>
                  <span className={badgeClass}>{APPLICATION_STATUS_LABELS[a.status]}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <QueueHeader
          title="Courses waiting for approval"
          href="/admin/courses?status=pending_review"
          label="All courses"
        />
        {courses.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              title="Nothing to review"
              body="When a faculty member submits a course, it waits here until you approve it."
            />
          </div>
        ) : (
          <ul className="mt-5 grid gap-3">
            {courses.map((c) => (
              <li key={c.id}>
                <Link href={`/admin/courses/${c.id}`} className={rowClass}>
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{c.title}</p>
                    <p className="mt-0.5 truncate text-sm text-ink-soft">
                      {c.faculty_name ?? "Faculty"} ·{" "}
                      {c.price_inr === 0 ? "Free" : formatINR(c.price_inr)}
                    </p>
                  </div>
                  <span className={badgeClass}>{COURSE_STATUS_LABELS[c.status]}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
