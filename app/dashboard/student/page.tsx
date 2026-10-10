import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { DashboardShell, EmptyState, StatCard } from "@/components/platform/DashboardShell";
import { cn } from "@/lib/accents";
import { STATUS_LABELS, formatINR, type Order } from "@/lib/platform";
import { requireProfile } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Student dashboard",
  robots: { index: false, follow: false },
};

const ORDER_TONE: Record<string, string> = {
  pending: "bg-gold-50 text-gold-800 border-gold-200",
  verified: "bg-well-50 text-well-800 border-well-200",
  rejected: "bg-red-50 text-red-800 border-red-200",
};

export default async function StudentDashboard() {
  const { supabase, profile } = await requireProfile();

  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("student_id", profile.id)
    .order("created_at", { ascending: false });

  const orders = (data ?? []) as Order[];
  const active = orders.filter((o) => o.status === "verified").length;
  const waiting = orders.filter((o) => o.status === "pending").length;
  const spent = orders
    .filter((o) => o.status === "verified")
    .reduce((sum, o) => sum + o.amount_inr, 0);

  return (
    <DashboardShell
      profile={profile}
      title="My learning"
      subtitle="Every course you have enrolled in, and where each payment stands."
      tabs={[]}
      active="/dashboard/student"
      action={
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-well-600 to-navy-700 px-5 py-2.5 text-sm font-semibold text-white shadow-glow-green transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
        >
          <BookOpen className="size-4" strokeWidth={2.4} />
          Browse courses
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active courses" value={active} tone="green" />
        <StatCard label="Awaiting verification" value={waiting} tone="gold" />
        <StatCard label="Total paid" value={formatINR(spent)} tone="navy" />
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold sm:text-2xl">Enrolments</h2>

        {orders.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              title="You have not enrolled yet"
              body="Browse the catalogue and enrol in a course. It will show up here once you submit your payment reference."
              cta={
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-well-600 to-navy-700 px-6 py-3 text-sm font-semibold text-white shadow-glow-green transition-transform hover:-translate-y-0.5"
                >
                  <BookOpen className="size-4" strokeWidth={2.4} />
                  Browse courses
                </Link>
              }
            />
          </div>
        ) : (
          <ul className="mt-5 grid gap-4">
            {orders.map((order) => (
              <li key={order.id}>
                <article className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-navy-900/7 bg-white/85 p-5 shadow-soft backdrop-blur-sm sm:p-6">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold">{order.course_title}</h3>
                    <p className="mt-1 text-sm text-ink-soft">
                      {formatINR(order.amount_inr)} · UTR{" "}
                      <span className="font-mono text-xs">{order.utr}</span>
                    </p>
                    <p className="mt-1 text-xs text-ink-soft">
                      Enrolled{" "}
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold",
                      ORDER_TONE[order.status],
                    )}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </DashboardShell>
  );
}
