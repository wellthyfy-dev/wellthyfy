import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EmptyState, StatCard } from "@/components/platform/DashboardShell";
import { APPLICATION_STATUS_LABELS, type FacultyApplication } from "@/lib/faculty";
import { formatINR } from "@/lib/platform";
import { requireAdmin } from "@/lib/supabase/auth";

export default async function AdminOverview() {
  const { supabase } = await requireAdmin();

  const head = (table: string) =>
    supabase.from(table).select("id", { count: "exact", head: true });

  const [pendingApps, pendingPayments, liveCourses, faculty, students, recent] = await Promise.all([
    head("faculty_applications").eq("status", "pending"),
    head("orders").eq("status", "pending"),
    head("courses").eq("status", "published"),
    head("profiles").eq("role", "faculty"),
    head("profiles").eq("role", "student"),
    supabase
      .from("faculty_applications")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const pending = (recent.data ?? []) as FacultyApplication[];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Applications to review" value={pendingApps.count ?? 0} tone="gold" />
        <StatCard label="Payments to verify" value={pendingPayments.count ?? 0} tone="gold" />
        <StatCard label="Live courses" value={liveCourses.count ?? 0} tone="green" />
        <StatCard label="Faculty accounts" value={faculty.count ?? 0} tone="navy" />
        <StatCard label="Students" value={students.count ?? 0} tone="navy" />
      </div>

      <section className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold sm:text-2xl">Waiting for review</h2>
          <Link
            href="/admin/applications"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-navy-800 hover:text-well-700"
          >
            All applications
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {pending.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              title="All caught up"
              body="New faculty applications appear here the moment someone submits one."
            />
          </div>
        ) : (
          <ul className="mt-5 grid gap-3">
            {pending.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/admin/applications/${a.id}`}
                  className="group flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-navy-900/7 bg-white/85 p-5 shadow-soft backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{a.full_name}</p>
                    <p className="mt-0.5 truncate text-sm text-ink-soft">
                      {a.course_title} · {formatINR(a.fee_inr)}
                    </p>
                  </div>
                  <span className="rounded-full border border-gold-200 bg-gold-50 px-3 py-1.5 text-xs font-semibold text-gold-800">
                    {APPLICATION_STATUS_LABELS[a.status]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
