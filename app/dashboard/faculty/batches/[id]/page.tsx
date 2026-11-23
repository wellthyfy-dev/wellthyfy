import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Film,
  MapPin,
  PlayCircle,
  RotateCcw,
  Save,
  X,
} from "lucide-react";
import { EmptyState } from "@/components/platform/DashboardShell";
import { fieldClass, labelClass } from "@/components/platform/AuthForm";
import { cn } from "@/lib/accents";
import {
  BATCH_MODE_LABELS,
  BATCH_STATUS_LABELS,
  BATCH_STATUS_TONE,
  formatSlot,
  formatStartDate,
  isOnline,
  isoToIstLocal,
  mapsLink,
  needsVenue,
  scheduleSummary,
  sessionPhase,
  type Batch,
  type BatchSession,
  type BatchStatus,
} from "@/lib/batches";
import { STATUS_LABELS, type Order } from "@/lib/platform";
import { requireFaculty } from "@/lib/supabase/auth";
import DeleteBatchButton from "@/components/platform/DeleteBatchButton";
import { deleteBatch, saveRecording, updateBatchDetails, updateSession } from "../actions";

export const metadata: Metadata = {
  title: "Manage batch",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const NOTICES: Record<string, string> = {
  created: "Batch created. Its timetable is below — share the course page so students can pick it.",
  saved: "Batch details saved.",
  move: "Class moved.",
  cancel: "Class cancelled.",
  restore: "Class restored.",
  recording: "Recording added. Students in this batch can watch it from My classes.",
  "recording-removed": "Recording removed.",
};

const smallBtn =
  "inline-flex items-center gap-1.5 rounded-full border border-navy-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-navy-800 transition-colors hover:bg-navy-50";

export default async function ManageBatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; error?: string; mailed?: string }>;
}) {
  const { id } = await params;
  const { notice, error, mailed } = await searchParams;
  const { supabase, profile } = await requireFaculty();

  const { data } = await supabase
    .from("batches")
    .select("*, courses(id, title, slug)")
    .eq("id", id)
    .eq("faculty_id", profile.id)
    .maybeSingle();
  if (!data) notFound();
  const { courses: course, ...rest } = data as Batch & {
    courses: { id: string; title: string; slug: string };
  };
  const batch = rest as Batch;

  const [{ data: sessionRows }, { data: priv }, { data: orderRows }] = await Promise.all([
    supabase.from("batch_sessions").select("*").eq("batch_id", id).order("seq"),
    supabase.from("batch_private").select("meeting_url").eq("batch_id", id).maybeSingle(),
    supabase.from("orders").select("*").eq("batch_id", id).order("created_at", { ascending: true }),
  ]);

  const sessions = (sessionRows ?? []) as BatchSession[];
  const orders = (orderRows ?? []) as Order[];
  const { data: recRows } = sessions.length
    ? await supabase
        .from("session_recordings")
        .select("session_id, url")
        .in("session_id", sessions.map((s) => s.id))
    : { data: [] };
  const recordings = new Map(
    ((recRows ?? []) as { session_id: string; url: string }[]).map((r) => [r.session_id, r.url]),
  );
  const meetingUrl = (priv as { meeting_url: string | null } | null)?.meeting_url ?? null;
  const held = orders.filter((o) => o.status !== "rejected").length;
  const now = Date.now();
  const statusChoices: BatchStatus[] =
    batch.status === "cancelled" ? ["cancelled"] : ["open", "closed", "completed"];

  return (
    <div className="relative pb-24 pt-28 md:pt-36">
      <div className="container-page">
        <div className="mx-auto max-w-5xl">
          <Link
            href={`/dashboard/faculty/courses/${course.id}/batches`}
            className="group inline-flex items-center gap-2 text-sm font-semibold text-ink-soft transition-colors hover:text-well-700"
          >
            <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
            All batches for {course.title}
          </Link>

          <div className="mt-7 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                BATCH_STATUS_TONE[batch.status],
              )}
            >
              {BATCH_STATUS_LABELS[batch.status]}
            </span>
            <span className="rounded-full border border-navy-900/10 bg-white px-2.5 py-1 text-[11px] font-medium text-ink-soft">
              {BATCH_MODE_LABELS[batch.mode]}
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-semibold leading-[1.12] sm:text-4xl">{batch.name}</h1>
          <p className="mt-2 text-base text-ink-soft">
            {course.title} · {scheduleSummary(batch)} · starts {formatStartDate(batch.start_date)} ·{" "}
            {held}/{batch.seats} seats
          </p>

          {notice && NOTICES[notice] && (
            <p className="mt-6 flex items-start gap-2.5 rounded-xl border border-well-200 bg-well-50 px-4 py-3 text-sm font-medium text-well-900">
              <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-well-600" />
              <span>
                {NOTICES[notice]}
                {mailed && Number(mailed) > 0 && ` We emailed ${mailed} student${mailed === "1" ? "" : "s"}.`}
              </span>
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
            >
              <AlertCircle className="mt-0.5 size-4.5 shrink-0 text-red-600" />
              {error}
            </p>
          )}

          {/* Details */}
          <section className="mt-10 rounded-3xl border border-navy-900/7 bg-white/90 p-6 shadow-soft backdrop-blur-md sm:p-8">
            <h2 className="text-xl font-semibold">Batch details</h2>
            <form action={updateBatchDetails} className="mt-5 grid gap-5">
              <input type="hidden" name="batch_id" value={batch.id} />
              <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_9rem_14rem]">
                <div>
                  <label htmlFor="name" className={labelClass}>
                    Name
                  </label>
                  <input id="name" name="name" required defaultValue={batch.name} className={fieldClass} />
                </div>
                <div>
                  <label htmlFor="seats" className={labelClass}>
                    Seats
                  </label>
                  <input
                    id="seats"
                    name="seats"
                    type="number"
                    min={Math.max(1, held)}
                    max={500}
                    required
                    defaultValue={batch.seats}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="status" className={labelClass}>
                    Status
                  </label>
                  <select id="status" name="status" defaultValue={batch.status} className={fieldClass}>
                    {statusChoices.map((s) => (
                      <option key={s} value={s}>
                        {BATCH_STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {isOnline(batch.mode) && (
                <div>
                  <label htmlFor="meeting_url" className={labelClass}>
                    Class link (Zoom or Google Meet)
                  </label>
                  <input
                    id="meeting_url"
                    name="meeting_url"
                    type="url"
                    defaultValue={meetingUrl ?? ""}
                    placeholder="https://zoom.us/j/…"
                    className={fieldClass}
                  />
                  <p className="mt-1.5 text-xs text-ink-soft">
                    One recurring link for every class. Students with a verified payment see a Join
                    button 15 minutes before each class.
                  </p>
                </div>
              )}
              {needsVenue(batch.mode) && (
                <div>
                  <label htmlFor="venue" className={labelClass}>
                    Venue address
                  </label>
                  <textarea
                    id="venue"
                    name="venue"
                    rows={2}
                    required
                    defaultValue={batch.venue ?? ""}
                    className={`${fieldClass} resize-y`}
                  />
                </div>
              )}
              <button
                type="submit"
                className="inline-flex items-center gap-2 justify-self-start rounded-full bg-gradient-to-r from-well-600 to-navy-700 px-5 py-2.5 text-sm font-semibold text-white shadow-glow-green transition-transform hover:-translate-y-0.5"
              >
                <Save className="size-4" />
                Save details
              </button>
            </form>
          </section>

          {/* Timetable */}
          <section className="mt-12">
            <h2 className="text-xl font-semibold sm:text-2xl">Timetable &amp; recordings</h2>
            <p className="mt-1.5 text-sm text-ink-soft">
              Moving or cancelling a class emails every verified student. After a class, paste its
              recording link (for example an unlisted YouTube or Google Drive link) — it appears as
              a recap for this batch only.
            </p>
            <ol className="mt-5 grid gap-3">
              {sessions.map((s) => {
                const phase = sessionPhase(s, now);
                const recording = recordings.get(s.id);
                return (
                  <li
                    key={s.id}
                    className={cn(
                      "rounded-2xl border bg-white/85 p-4 shadow-soft backdrop-blur-sm sm:p-5",
                      phase === "joinable" ? "border-well-300 ring-2 ring-well-200" : "border-navy-900/7",
                      phase === "cancelled" && "opacity-70",
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-well-400 to-navy-700 text-xs font-bold text-white">
                        {s.seq}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={cn("font-semibold text-ink", phase === "cancelled" && "line-through")}>
                          {formatSlot(s.starts_at, s.ends_at)}
                        </p>
                        <p className="text-xs text-ink-soft">
                          {phase === "cancelled"
                            ? "Cancelled"
                            : phase === "past"
                              ? recording
                                ? "Done · recording shared"
                                : "Done · add the recording"
                              : phase === "joinable"
                                ? "Live now / starting soon"
                                : "Upcoming"}
                        </p>
                      </div>

                      {phase === "joinable" && isOnline(batch.mode) && meetingUrl && (
                        <a
                          href={meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-well-600 to-well-700 px-4 py-2 text-xs font-semibold text-white shadow-glow-green"
                        >
                          <PlayCircle className="size-4" />
                          Start class
                        </a>
                      )}

                      {phase !== "past" && (
                        <form action={updateSession}>
                          <input type="hidden" name="batch_id" value={batch.id} />
                          <input type="hidden" name="session_id" value={s.id} />
                          {phase === "cancelled" ? (
                            <button type="submit" name="intent" value="restore" className={smallBtn}>
                              <RotateCcw className="size-3.5" />
                              Restore
                            </button>
                          ) : (
                            <button
                              type="submit"
                              name="intent"
                              value="cancel"
                              className={cn(smallBtn, "border-red-200 text-red-700 hover:bg-red-50")}
                            >
                              <X className="size-3.5" />
                              Cancel class
                            </button>
                          )}
                        </form>
                      )}
                    </div>

                    <div className="mt-3 grid gap-3 border-t border-navy-900/5 pt-3 lg:grid-cols-2">
                      {phase !== "past" ? (
                        <form action={updateSession} className="flex flex-wrap items-center gap-2">
                          <input type="hidden" name="batch_id" value={batch.id} />
                          <input type="hidden" name="session_id" value={s.id} />
                          <input type="hidden" name="intent" value="move" />
                          <label className="sr-only" htmlFor={`move-${s.id}`}>
                            New time for session {s.seq}
                          </label>
                          <input
                            id={`move-${s.id}`}
                            name="starts_at"
                            type="datetime-local"
                            required
                            defaultValue={isoToIstLocal(s.starts_at)}
                            className="rounded-lg border border-navy-900/10 bg-white px-3 py-1.5 text-sm"
                          />
                          <button type="submit" className={smallBtn}>
                            Move
                          </button>
                        </form>
                      ) : (
                        <span />
                      )}

                      {phase !== "cancelled" && (
                        <form action={saveRecording} className="flex flex-wrap items-center gap-2">
                          <input type="hidden" name="batch_id" value={batch.id} />
                          <input type="hidden" name="session_id" value={s.id} />
                          <Film className="size-4 text-navy-600" />
                          <label className="sr-only" htmlFor={`rec-${s.id}`}>
                            Recording link for session {s.seq}
                          </label>
                          <input
                            id={`rec-${s.id}`}
                            name="url"
                            type="url"
                            defaultValue={recording ?? ""}
                            placeholder="Recording link (https://…)"
                            className="min-w-0 flex-1 rounded-lg border border-navy-900/10 bg-white px-3 py-1.5 text-sm"
                          />
                          <button type="submit" className={smallBtn}>
                            {recording ? "Update" : "Add"}
                          </button>
                          {recording && (
                            <a href={recording} target="_blank" rel="noopener noreferrer" className={smallBtn}>
                              <ExternalLink className="size-3.5" />
                            </a>
                          )}
                        </form>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Roster */}
          <section className="mt-12">
            <h2 className="text-xl font-semibold sm:text-2xl">Students in this batch</h2>
            {batch.venue && (
              <a
                href={mapsLink(batch.venue)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-navy-700 hover:underline"
              >
                <MapPin className="size-4" />
                {batch.venue}
              </a>
            )}
            {orders.length === 0 ? (
              <div className="mt-5">
                <EmptyState
                  title="No students yet"
                  body="Students who pick this batch appear here. Their seat is held while the payment is checked."
                />
              </div>
            ) : (
              <div className="mt-5 overflow-x-auto rounded-2xl border border-navy-900/7 bg-white/85 shadow-soft backdrop-blur-sm">
                <table className="w-full min-w-[40rem] text-left text-sm">
                  <thead className="border-b border-navy-900/7 text-[11px] uppercase tracking-[0.14em] text-navy-700/60">
                    <tr>
                      <th className="px-5 py-3.5 font-semibold">#</th>
                      <th className="px-5 py-3.5 font-semibold">Student</th>
                      <th className="px-5 py-3.5 font-semibold">Contact</th>
                      <th className="px-5 py-3.5 font-semibold">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o, i) => (
                      <tr key={o.id} className="border-b border-navy-900/5 last:border-0">
                        <td className="px-5 py-3.5 text-ink-soft">{i + 1}</td>
                        <td className="px-5 py-3.5 font-medium text-ink">{o.student_name ?? "Student"}</td>
                        <td className="px-5 py-3.5 text-xs text-ink-soft">
                          {o.student_email}
                          {o.student_whatsapp && <span className="block">WhatsApp {o.student_whatsapp}</span>}
                        </td>
                        <td className="px-5 py-3.5 text-xs font-semibold">{STATUS_LABELS[o.status]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Delete */}
          <section className="mt-12 rounded-3xl border border-red-200/70 bg-white/85 p-6 shadow-soft sm:p-8">
            <h2 className="text-xl font-semibold">Delete batch</h2>
            {held > 0 ? (
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {held} student{held === 1 ? " holds" : "s hold"} a seat in this batch, so it can&apos;t be
                deleted. To stop new enrolments, set its status to <strong>Closed</strong> above. If it
                must go, ask the Wellthyfy team to move the students to another batch first.
              </p>
            ) : (
              <>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  Removes this batch, its timetable and any recordings. No students are enrolled, so
                  nobody is affected. This cannot be undone.
                </p>
                <form action={deleteBatch} className="mt-5">
                  <input type="hidden" name="batch_id" value={batch.id} />
                  <DeleteBatchButton name={batch.name} />
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
