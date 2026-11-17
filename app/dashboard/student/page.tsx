import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  ChevronDown,
  Hourglass,
  MapPin,
  PlayCircle,
  Video,
} from "lucide-react";
import { DashboardShell, EmptyState, StatCard } from "@/components/platform/DashboardShell";
import JoinClassButton from "@/components/platform/JoinClassButton";
import { cn } from "@/lib/accents";
import {
  BATCH_MODE_LABELS,
  formatDate,
  formatSlot,
  formatStartDate,
  isOnline,
  mapsLink,
  scheduleSummary,
  sessionPhase,
  type Batch,
  type BatchSession,
} from "@/lib/batches";
import { STATUS_LABELS, formatINR, type Order } from "@/lib/platform";
import { requireProfile } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Student dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ORDER_TONE: Record<string, string> = {
  pending: "bg-gold-50 text-gold-800 border-gold-200",
  verified: "bg-well-50 text-well-800 border-well-200",
  rejected: "bg-red-50 text-red-800 border-red-200",
};

const CLASS_NOTICES: Record<string, string> = {
  "too-early": "That class isn't open yet — the Join button works from 15 minutes before the start.",
  ended: "That class has ended. Its recording will appear under Recaps once your faculty adds it.",
  cancelled: "That class was cancelled. Check your timetable for the new plan.",
  "not-enrolled": "Classes open once your payment for the batch is verified.",
  "no-link": "Your faculty hasn't added the class link yet. Please try again in a minute, or message us on WhatsApp.",
  "not-found": "We couldn't find that class.",
};

type BatchView = Batch & { courses: { title: string; slug: string } | null };

export default async function StudentDashboard({
  searchParams,
}: {
  searchParams: Promise<{ class?: string }>;
}) {
  const { class: classNotice } = await searchParams;
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

  // ── Live classes for every batch the student is in ──
  const batchIds = [...new Set(orders.filter((o) => o.status !== "rejected" && o.batch_id).map((o) => o.batch_id as string))];
  const verifiedBatchIds = new Set(
    orders.filter((o) => o.status === "verified" && o.batch_id).map((o) => o.batch_id as string),
  );

  const [{ data: batchRows }, { data: sessionRows }] = batchIds.length
    ? await Promise.all([
        supabase.from("batches").select("*, courses(title, slug)").in("id", batchIds),
        supabase
          .from("batch_sessions")
          .select("*")
          .in("batch_id", [...verifiedBatchIds])
          .order("starts_at"),
      ])
    : [{ data: [] }, { data: [] }];

  // The course title comes from the order too, so it still shows if the course
  // is later taken off the site.
  const titles = new Map(orders.map((o) => [o.batch_id, o.course_title]));
  const batches = new Map(
    ((batchRows ?? []) as BatchView[]).map((b) => [
      b.id,
      { ...b, courses: { slug: b.courses?.slug ?? "", title: b.courses?.title ?? titles.get(b.id) ?? "" } },
    ]),
  );
  const sessions = (sessionRows ?? []) as BatchSession[];
  const { data: recRows } = sessions.length
    ? await supabase
        .from("session_recordings")
        .select("session_id, url")
        .in("session_id", sessions.map((s) => s.id))
    : { data: [] };
  const recordings = new Map(
    ((recRows ?? []) as { session_id: string; url: string }[]).map((r) => [r.session_id, r.url]),
  );

  const now = Date.now();
  const upcoming = sessions.filter((s) => {
    const p = sessionPhase(s, now);
    return p === "upcoming" || p === "joinable";
  });
  const next = upcoming[0];
  const nextBatch = next ? batches.get(next.batch_id) : undefined;
  const recaps = sessions
    .filter((s) => recordings.has(s.id))
    .sort((a, b) => b.starts_at.localeCompare(a.starts_at));
  const heldSeats = orders.filter(
    (o) => o.status === "pending" && o.batch_id && batches.has(o.batch_id),
  );

  return (
    <DashboardShell
      profile={profile}
      title="My learning"
      subtitle="Your live classes, recordings and every course you have enrolled in."
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

      {(batchIds.length > 0 || classNotice) && (
        <section id="classes" className="mt-12 scroll-mt-28">
          <h2 className="text-xl font-semibold sm:text-2xl">My classes</h2>

          {classNotice && CLASS_NOTICES[classNotice] && (
            <p
              role="status"
              className="mt-4 flex items-start gap-2.5 rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-sm font-medium text-gold-900"
            >
              <AlertCircle className="mt-0.5 size-4.5 shrink-0 text-gold-700" />
              {CLASS_NOTICES[classNotice]}
            </p>
          )}

          {heldSeats.map((o) => {
            const b = batches.get(o.batch_id as string)!;
            return (
              <p
                key={o.id}
                className="mt-4 flex items-start gap-2.5 rounded-xl border border-navy-900/7 bg-white/85 px-4 py-3 text-sm text-ink-soft"
              >
                <Hourglass className="mt-0.5 size-4.5 shrink-0 text-gold-600" />
                <span>
                  Your seat in <strong className="text-ink">{b.name}</strong> ({o.course_title}) is
                  held. Your timetable appears here as soon as the payment is verified.
                </span>
              </p>
            );
          })}

          {/* Next class */}
          {next && nextBatch && (
            <article className="mt-5 overflow-hidden rounded-3xl border border-well-200 bg-gradient-to-br from-well-50 via-white to-navy-50/60 p-6 shadow-lift sm:p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-well-700">
                Next class · Session {next.seq}
              </p>
              <h3 className="mt-2 text-2xl font-semibold">{nextBatch.courses?.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{nextBatch.name}</p>
              <p className="mt-4 flex items-center gap-2 text-base font-semibold text-ink">
                <CalendarDays className="size-5 text-navy-600" />
                {formatSlot(next.starts_at, next.ends_at)}
              </p>
              {nextBatch.venue && (
                <a
                  href={mapsLink(nextBatch.venue)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-start gap-2 text-sm text-navy-700 hover:underline"
                >
                  <MapPin className="mt-0.5 size-4 shrink-0" />
                  {nextBatch.venue}
                </a>
              )}
              <div className="mt-5">
                {isOnline(nextBatch.mode) ? (
                  <JoinClassButton
                    sessionId={next.id}
                    startsAt={next.starts_at}
                    endsAt={next.ends_at}
                  />
                ) : (
                  <span className="text-sm text-ink-soft">
                    At the institute — please arrive a few minutes early.
                  </span>
                )}
              </div>
            </article>
          )}

          {/* Each batch's timetable */}
          <div className="mt-6 grid gap-4">
            {[...verifiedBatchIds].map((id) => {
              const b = batches.get(id);
              if (!b) return null;
              const own = sessions.filter((s) => s.batch_id === id);
              const done = own.filter((s) => sessionPhase(s, now) === "past").length;
              return (
                <details
                  key={id}
                  className="group rounded-2xl border border-navy-900/7 bg-white/85 shadow-soft backdrop-blur-sm"
                >
                  <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 p-5 sm:p-6">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-well-400 to-navy-700 text-white">
                      {isOnline(b.mode) ? <Video className="size-5" /> : <MapPin className="size-5" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-ink">
                        {b.courses?.title} · {b.name}
                      </span>
                      <span className="block text-xs text-ink-soft">
                        {scheduleSummary(b)} · {BATCH_MODE_LABELS[b.mode]} · from{" "}
                        {formatStartDate(b.start_date)} · {done}/{own.length} classes done
                      </span>
                    </span>
                    <ChevronDown className="size-5 text-navy-700 transition-transform group-open:rotate-180" />
                  </summary>
                  <ol className="grid gap-2 border-t border-navy-900/5 p-5 sm:p-6">
                    {own.map((s) => {
                      const phase = sessionPhase(s, now);
                      const rec = recordings.get(s.id);
                      return (
                        <li
                          key={s.id}
                          className={cn(
                            "flex flex-wrap items-center gap-3 rounded-xl px-3 py-2.5",
                            phase === "joinable" ? "bg-well-50" : "bg-navy-50/40",
                          )}
                        >
                          <span className="w-8 text-xs font-bold text-navy-700">#{s.seq}</span>
                          <span
                            className={cn(
                              "min-w-0 flex-1 text-sm text-ink",
                              phase === "cancelled" && "text-ink-soft line-through",
                            )}
                          >
                            {formatSlot(s.starts_at, s.ends_at)}
                          </span>
                          {phase === "cancelled" ? (
                            <span className="text-xs font-semibold text-red-700">Cancelled</span>
                          ) : phase === "past" ? (
                            rec ? (
                              <a
                                href={rec}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-well-700 hover:underline"
                              >
                                <PlayCircle className="size-4" />
                                Watch recap
                              </a>
                            ) : (
                              <span className="text-xs text-ink-soft">Recording coming soon</span>
                            )
                          ) : isOnline(b.mode) ? (
                            <JoinClassButton sessionId={s.id} startsAt={s.starts_at} endsAt={s.ends_at} />
                          ) : (
                            <span className="text-xs text-ink-soft">At the institute</span>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </details>
              );
            })}
          </div>

          {/* Recaps */}
          {recaps.length > 0 && (
            <div className="mt-10">
              <h3 className="text-lg font-semibold">Recaps</h3>
              <p className="mt-1 text-sm text-ink-soft">
                Recordings of your batch&apos;s classes — yours to rewatch any time.
              </p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {recaps.map((s) => {
                  const b = batches.get(s.batch_id);
                  return (
                    <li key={s.id}>
                      <a
                        href={recordings.get(s.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 rounded-2xl border border-navy-900/7 bg-white/85 p-4 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-well-300 hover:shadow-lift"
                      >
                        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-well-500 to-navy-700 text-white">
                          <PlayCircle className="size-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-ink">
                            Session {s.seq} recap
                          </span>
                          <span className="block truncate text-xs text-ink-soft">
                            {b?.courses?.title} · {formatDate(s.starts_at)}
                          </span>
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      )}

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
                    {order.batch_id && batches.get(order.batch_id) && (
                      <p className="mt-0.5 text-sm font-medium text-well-700">
                        {batches.get(order.batch_id)!.name}
                      </p>
                    )}
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
