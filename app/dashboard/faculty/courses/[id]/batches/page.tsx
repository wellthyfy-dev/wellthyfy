import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, MapPin, Users, Video } from "lucide-react";
import BatchForm from "@/components/platform/BatchForm";
import { EmptyState } from "@/components/platform/DashboardShell";
import { cn } from "@/lib/accents";
import {
  BATCH_MODE_LABELS,
  BATCH_STATUS_LABELS,
  BATCH_STATUS_TONE,
  formatStartDate,
  isOnline,
  modesForCourse,
  scheduleSummary,
  type Batch,
} from "@/lib/batches";
import { COURSE_STATUS_LABELS, type Course } from "@/lib/platform";
import { siteConfig } from "@/lib/site";
import { requireFaculty } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Batches",
  robots: { index: false, follow: false },
};

const todayIst = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

export default async function CourseBatchesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const { id } = await params;
  const { notice } = await searchParams;
  const { supabase, profile } = await requireFaculty();

  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .eq("faculty_id", profile.id)
    .maybeSingle();
  const course = (data as Course | null) ?? null;
  if (!course) notFound();

  const { data: batchRows } = await supabase
    .from("batches")
    .select("*")
    .eq("course_id", course.id)
    .order("start_date", { ascending: false });
  const batches = (batchRows ?? []) as Batch[];

  const { data: takenRows } = batches.length
    ? await supabase.rpc("batch_seats_taken", { p_batches: batches.map((b) => b.id) })
    : { data: [] };
  const taken = new Map(
    ((takenRows ?? []) as { batch_id: string; taken: number }[]).map((r) => [r.batch_id, r.taken]),
  );

  const modes = modesForCourse(course.mode);

  return (
    <div className="relative pb-24 pt-28 md:pt-36">
      <div className="container-page">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/dashboard/faculty"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-ink-soft transition-colors hover:text-well-700"
          >
            <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Back to dashboard
          </Link>

          {notice === "deleted" && (
            <p
              role="status"
              className="mt-6 flex items-center gap-2.5 rounded-xl border border-well-200 bg-well-50 px-4 py-3 text-sm font-medium text-well-900"
            >
              <CheckCircle2 className="size-4.5 shrink-0 text-well-600" />
              Batch deleted.
            </p>
          )}

          <h1 className="mt-7 text-3xl font-semibold leading-[1.12] sm:text-4xl">
            Batches · <span className="text-gradient-brand">{course.title}</span>
          </h1>
          <p className="mt-3 max-w-2xl text-base text-ink-soft">
            A batch is one group of students on one timetable. Students choose a batch when they
            enrol; each class is recorded and shared with that batch as a recap.
          </p>
          {course.status !== "published" && (
            <p className="mt-4 rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-sm text-gold-900">
              This course is <strong>{COURSE_STATUS_LABELS[course.status].toLowerCase()}</strong>.
              You can prepare batches now; students see them once the course is approved and live.
            </p>
          )}

          {/* Existing batches */}
          <section className="mt-10">
            <h2 className="text-xl font-semibold sm:text-2xl">Your batches</h2>
            {batches.length === 0 ? (
              <div className="mt-5">
                <EmptyState
                  title="No batches yet"
                  body="Create the first batch below — pick the days, time and number of classes, and we generate the full timetable."
                />
              </div>
            ) : (
              <ul className="mt-5 grid gap-4">
                {batches.map((b) => (
                  <li key={b.id}>
                    <Link
                      href={`/dashboard/faculty/batches/${b.id}`}
                      className="group flex flex-wrap items-center gap-5 rounded-2xl border border-navy-900/7 bg-white/85 p-5 shadow-soft backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-well-300 hover:shadow-lift sm:p-6"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                              BATCH_STATUS_TONE[b.status],
                            )}
                          >
                            {BATCH_STATUS_LABELS[b.status]}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full border border-navy-900/10 bg-white px-2.5 py-1 text-[11px] font-medium text-ink-soft">
                            {isOnline(b.mode) ? <Video className="size-3" /> : <MapPin className="size-3" />}
                            {BATCH_MODE_LABELS[b.mode]}
                          </span>
                        </div>
                        <h3 className="mt-2.5 text-lg font-semibold">{b.name}</h3>
                        <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="size-4 text-navy-600" />
                            {scheduleSummary(b)} · starts {formatStartDate(b.start_date)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Users className="size-4 text-navy-600" />
                            {taken.get(b.id) ?? 0}/{b.seats} seats · {b.session_count} classes
                          </span>
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-800">
                        Manage
                        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* New batch */}
          <section className="mt-12">
            <h2 className="text-xl font-semibold sm:text-2xl">Create a batch</h2>
            <p className="mt-1.5 text-sm text-ink-soft">
              Only one online class can run at a time across Wellthyfy, so we check your times
              against every other online batch.
            </p>
            <div className="mt-5 rounded-3xl border border-navy-900/7 bg-white/90 p-6 shadow-lift backdrop-blur-md sm:p-8">
              {modes.length === 0 ? (
                <p className="text-sm text-ink-soft">
                  Self-paced (recorded) courses don&apos;t have live batches. Change the course
                  mode to live, in-person or hybrid to schedule classes.
                </p>
              ) : (
                <BatchForm
                  courseId={course.id}
                  modes={modes}
                  defaultVenue={siteConfig.address.full}
                  minDate={todayIst()}
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
