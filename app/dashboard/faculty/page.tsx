import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Pencil, Plus } from "lucide-react";
import { DashboardShell, EmptyState, StatCard } from "@/components/platform/DashboardShell";
import { accentStyles, cn } from "@/lib/accents";
import {
  CATEGORY_META,
  MODE_LABELS,
  STATUS_LABELS,
  formatINR,
  type Course,
  type Order,
} from "@/lib/platform";
import { requireFaculty } from "@/lib/supabase/auth";
import { setCourseStatus } from "./actions";

export const metadata: Metadata = {
  title: "Faculty dashboard",
  robots: { index: false, follow: false },
};

const ORDER_TONE: Record<string, string> = {
  pending: "bg-gold-50 text-gold-800 border-gold-200",
  verified: "bg-well-50 text-well-800 border-well-200",
  rejected: "bg-red-50 text-red-800 border-red-200",
};

export default async function FacultyDashboard() {
  const { supabase, profile } = await requireFaculty();

  const [{ data: courseRows }, { data: orderRows }] = await Promise.all([
    supabase
      .from("courses")
      .select("*")
      .eq("faculty_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("*")
      .eq("faculty_id", profile.id)
      .order("created_at", { ascending: false }),
  ]);

  const courses = (courseRows ?? []) as Course[];
  const orders = (orderRows ?? []) as Order[];

  const published = courses.filter((c) => c.status === "published").length;
  const pending = orders.filter((o) => o.status === "pending").length;
  const earned = orders
    .filter((o) => o.status === "verified")
    .reduce((sum, o) => sum + o.amount_inr, 0);

  return (
    <DashboardShell
      profile={profile}
      title="Faculty dashboard"
      subtitle="Manage your courses and see who has enrolled."
      tabs={[]}
      active="/dashboard/faculty"
      action={
        <Link
          href="/dashboard/faculty/courses/new"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-well-600 to-navy-700 px-5 py-2.5 text-sm font-semibold text-white shadow-glow-green transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
        >
          <Plus className="size-4" strokeWidth={2.6} />
          Create course
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Courses" value={courses.length} tone="navy" />
        <StatCard label="Published" value={published} tone="green" />
        <StatCard label="Awaiting verification" value={pending} tone="gold" />
        <StatCard label="Verified earnings" value={formatINR(earned)} tone="green" />
      </div>

      {/* Courses */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold sm:text-2xl">Your courses</h2>

        {courses.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              title="No courses yet"
              body="Create your first course. Publish it and it appears on the Wellthyfy site straight away."
              cta={
                <Link
                  href="/dashboard/faculty/courses/new"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-well-600 to-navy-700 px-6 py-3 text-sm font-semibold text-white shadow-glow-green transition-transform hover:-translate-y-0.5"
                >
                  <Plus className="size-4" strokeWidth={2.6} />
                  Create course
                </Link>
              }
            />
          </div>
        ) : (
          <ul className="mt-5 grid gap-4">
            {courses.map((course) => {
              const meta = CATEGORY_META[course.category];
              const a = accentStyles[meta.accent];
              const live = course.status === "published";

              return (
                <li key={course.id}>
                  <article className="flex flex-wrap items-start gap-5 rounded-2xl border border-navy-900/7 bg-white/85 p-5 shadow-soft backdrop-blur-sm sm:p-6">
                    {course.cover_url && (
                      <Image
                        src={course.cover_url}
                        alt=""
                        width={160}
                        height={90}
                        className="h-20 w-32 shrink-0 rounded-xl object-cover"
                      />
                    )}
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
                          {course.subcategory}
                        </span>
                        <span className="rounded-full border border-navy-900/10 bg-white px-2.5 py-1 text-[11px] font-medium text-ink-soft">
                          {MODE_LABELS[course.mode]}
                        </span>
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                            live
                              ? "border-well-200 bg-well-50 text-well-800"
                              : "border-navy-900/10 bg-navy-50 text-ink-soft",
                          )}
                        >
                          {live ? "Live" : "Draft"}
                        </span>
                      </div>

                      <h3 className="mt-3 text-lg font-semibold">{course.title}</h3>
                      {course.summary && (
                        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                          {course.summary}
                        </p>
                      )}
                      <p className="mt-3 text-sm font-semibold text-navy-800">
                        {course.price_inr === 0 ? "Free" : formatINR(course.price_inr)}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {live && (
                        <Link
                          href={`/courses/${course.slug}`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-navy-200 bg-white px-4 py-2 text-xs font-semibold text-navy-800 transition-colors hover:bg-navy-50"
                        >
                          View
                        </Link>
                      )}
                      <Link
                        href={`/dashboard/faculty/courses/${course.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-navy-200 bg-white px-4 py-2 text-xs font-semibold text-navy-800 transition-all duration-300 hover:-translate-y-0.5 hover:bg-navy-50"
                      >
                        <Pencil className="size-3.5" strokeWidth={2.4} />
                        Edit
                      </Link>
                      <form action={setCourseStatus}>
                        <input type="hidden" name="id" value={course.id} />
                        <input
                          type="hidden"
                          name="status"
                          value={live ? "draft" : "published"}
                        />
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
        )}
      </section>

      {/* Enrolments */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold sm:text-2xl">Your students</h2>
        <p className="mt-1.5 text-sm text-ink-soft">
          Students pay Wellthyfy by UPI and our team confirms each payment. Once a payment is{" "}
          <span className="font-semibold text-ink">verified</span> it counts towards your
          bi-weekly payout.
        </p>

        {orders.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              title="No enrolments yet"
              body="When a student enrols in one of your courses, they appear here with their contact details."
            />
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto rounded-2xl border border-navy-900/7 bg-white/85 shadow-soft backdrop-blur-sm">
            <table className="w-full min-w-[46rem] text-left text-sm">
              <thead className="border-b border-navy-900/7 text-[11px] uppercase tracking-[0.14em] text-navy-700/60">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Student</th>
                  <th className="px-5 py-3.5 font-semibold">Course</th>
                  <th className="px-5 py-3.5 font-semibold">Amount</th>
                  <th className="px-5 py-3.5 font-semibold">Payment</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-navy-900/5 last:border-0">
                    <td className="px-5 py-4">
                      <p className="font-medium text-ink">{order.student_name ?? "Student"}</p>
                      {order.student_email && (
                        <a
                          href={`mailto:${order.student_email}`}
                          className="mt-0.5 block text-xs text-navy-700 hover:underline"
                        >
                          {order.student_email}
                        </a>
                      )}
                      {order.student_whatsapp && (
                        <p className="mt-0.5 text-xs text-ink-soft">
                          WhatsApp {order.student_whatsapp}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-ink">{order.course_title}</p>
                      <p className="mt-0.5 text-xs text-ink-soft">
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-navy-800">
                      {formatINR(order.amount_inr)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "inline-block rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                          ORDER_TONE[order.status],
                        )}
                      >
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
