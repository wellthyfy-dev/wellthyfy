"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { classChangedEmail, type ClassMailData } from "@/lib/batch-emails";
import {
  istLocalToIso,
  modesForCourse,
  needsVenue,
  type Batch,
  type BatchMode,
  type BatchSession,
  type BatchStatus,
} from "@/lib/batches";
import { adminRecipients, sendMail } from "@/lib/mailer";
import { siteOrigin } from "@/lib/site-origin";
import { requireFaculty } from "@/lib/supabase/auth";

export type BatchFormState = { error: string | null };

const text = (form: FormData, key: string, max = 500) =>
  String(form.get(key) ?? "")
    .trim()
    .slice(0, max);

const int = (form: FormData, key: string) => Number.parseInt(text(form, key, 12), 10);

const HTTPS_URL = /^https:\/\/\S{4,490}$/;

/** Database errors raised by our own functions are written for people; others are not. */
function friendly(message: string) {
  if (/permission denied|violates|syntax|function .* does not exist/i.test(message)) {
    return "Something went wrong saving that. Please check the details and try again.";
  }
  return message;
}

const back = (batchId: string, params: Record<string, string>) =>
  `/dashboard/faculty/batches/${batchId}?${new URLSearchParams(params).toString()}`;

function revalidateBatch(batchId: string, courseId?: string, slug?: string) {
  revalidatePath(`/dashboard/faculty/batches/${batchId}`);
  if (courseId) revalidatePath(`/dashboard/faculty/courses/${courseId}/batches`);
  if (slug) revalidatePath(`/courses/${slug}`);
  revalidatePath("/dashboard/student");
  revalidatePath("/dashboard/faculty");
}

// ── Create ───────────────────────────────────────────────────────────────────

export async function createBatch(_prev: BatchFormState, form: FormData): Promise<BatchFormState> {
  const { supabase, profile } = await requireFaculty();

  const courseId = text(form, "course_id", 60);
  const { data: course } = await supabase
    .from("courses")
    .select("id, mode, slug, faculty_id")
    .eq("id", courseId)
    .eq("faculty_id", profile.id)
    .maybeSingle();
  if (!course) return { error: "That course was not found." };

  const name = text(form, "name", 80);
  const mode = text(form, "mode", 20) as BatchMode;
  const startDate = text(form, "start_date", 10);
  const startTime = text(form, "start_time", 5);
  const days = form
    .getAll("days")
    .map((d) => Number.parseInt(String(d), 10))
    .filter((d) => d >= 1 && d <= 7);
  const duration = int(form, "duration_min");
  const count = int(form, "session_count");
  const seats = int(form, "seats");
  const venue = text(form, "venue", 500);
  const meetingUrl = text(form, "meeting_url", 500);

  if (name.length < 2) return { error: "Give the batch a name, for example “Morning batch”." };
  if (!modesForCourse(course.mode).includes(mode)) {
    return { error: "Choose how this batch is taught." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) return { error: "Choose the start date." };
  if (!/^\d{2}:\d{2}$/.test(startTime)) return { error: "Choose the class time." };
  if (days.length === 0) return { error: "Pick at least one class day." };
  if (!(duration >= 15 && duration <= 480)) {
    return { error: "Class length must be between 15 and 480 minutes." };
  }
  if (!(count >= 1 && count <= 200)) return { error: "Number of classes must be 1 to 200." };
  if (!(seats >= 1 && seats <= 500)) return { error: "Seats must be between 1 and 500." };
  if (needsVenue(mode) && venue.length < 5) {
    return { error: "Add the venue address students should come to." };
  }
  if (meetingUrl && !HTTPS_URL.test(meetingUrl)) {
    return { error: "The class link must start with https:// (a Zoom or Google Meet link)." };
  }

  const { data: batchId, error } = await supabase.rpc("create_batch", {
    p_course_id: course.id,
    p_name: name,
    p_mode: mode,
    p_start_date: startDate,
    p_days: days,
    p_start_time: startTime,
    p_duration_min: duration,
    p_session_count: count,
    p_seats: seats,
    p_venue: needsVenue(mode) ? venue : null,
    p_meeting_url: mode === "offline" ? null : meetingUrl || null,
  });
  if (error) return { error: friendly(error.message) };

  revalidateBatch(String(batchId), course.id, course.slug);
  redirect(back(String(batchId), { notice: "created" }));
}

// ── Edit details ─────────────────────────────────────────────────────────────

async function ownBatch(batchId: string) {
  const ctx = await requireFaculty();
  const { data } = await ctx.supabase
    .from("batches")
    .select("*, courses(title, slug)")
    .eq("id", batchId)
    .eq("faculty_id", ctx.profile.id)
    .maybeSingle();
  if (!data) redirect("/dashboard/faculty");
  const { courses, ...batch } = data as Batch & { courses: { title: string; slug: string } | null };
  return { ...ctx, batch: batch as Batch, course: courses ?? { title: "", slug: "" } };
}

const FACULTY_STATUSES: BatchStatus[] = ["open", "closed", "completed"];

export async function updateBatchDetails(form: FormData) {
  const batchId = text(form, "batch_id", 60);
  const { supabase, batch, course } = await ownBatch(batchId);

  const name = text(form, "name", 80);
  const seats = int(form, "seats");
  const venue = text(form, "venue", 500);
  const status = text(form, "status", 20) as BatchStatus;
  const meetingUrl = text(form, "meeting_url", 500);

  const fail = (error: string) => redirect(back(batchId, { error }));

  if (name.length < 2) fail("Give the batch a name.");
  if (!(seats >= 1 && seats <= 500)) fail("Seats must be between 1 and 500.");
  if (!FACULTY_STATUSES.includes(status) && status !== batch.status) {
    fail("To cancel a batch, contact the Wellthyfy team so students can be refunded.");
  }
  if (needsVenue(batch.mode) && venue.length < 5) fail("Add the venue address.");
  if (meetingUrl && !HTTPS_URL.test(meetingUrl)) {
    fail("The class link must start with https:// (a Zoom or Google Meet link).");
  }

  const { data: taken } = await supabase.rpc("batch_seats_taken", { p_batches: [batchId] });
  const held = (taken as { taken: number }[] | null)?.[0]?.taken ?? 0;
  if (seats < held) fail(`${held} students already hold a seat, so seats can't go below ${held}.`);

  const { error } = await supabase
    .from("batches")
    .update({ name, seats, venue: needsVenue(batch.mode) ? venue : null, status })
    .eq("id", batchId);
  if (error) fail(friendly(error.message));

  if (batch.mode !== "offline") {
    const { error: linkError } = await supabase
      .from("batch_private")
      .update({ meeting_url: meetingUrl || null, updated_at: new Date().toISOString() })
      .eq("batch_id", batchId);
    if (linkError) fail(friendly(linkError.message));
  }

  revalidateBatch(batchId, batch.course_id, course.slug);
  redirect(back(batchId, { notice: "saved" }));
}

// ── Move / cancel one class ──────────────────────────────────────────────────

export async function updateSession(form: FormData) {
  const batchId = text(form, "batch_id", 60);
  const sessionId = text(form, "session_id", 60);
  const intent = text(form, "intent", 20);
  const { supabase, batch, course } = await ownBatch(batchId);

  const { data: row } = await supabase
    .from("batch_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("batch_id", batchId)
    .maybeSingle();
  const session = row as BatchSession | null;
  if (!session) redirect(back(batchId, { error: "That class was not found." }));

  let startsAt = session.starts_at;
  let status = session.status;
  if (intent === "move") {
    const iso = istLocalToIso(text(form, "starts_at", 20));
    if (!iso) redirect(back(batchId, { error: "Pick the new date and time." }));
    if (new Date(iso).getTime() < Date.now()) {
      redirect(back(batchId, { error: "The new time is in the past." }));
    }
    startsAt = iso;
    status = "scheduled";
  } else if (intent === "cancel") {
    status = "cancelled";
  } else if (intent === "restore") {
    status = "scheduled";
  } else {
    redirect(back(batchId, {}));
  }

  if (startsAt === session.starts_at && status === session.status) {
    redirect(back(batchId, {}));
  }

  const { error } = await supabase.rpc("update_batch_session", {
    p_session: sessionId,
    p_starts_at: startsAt,
    p_status: status,
  });
  if (error) redirect(back(batchId, { error: friendly(error.message) }));

  // Tell the batch, unless the class is already over.
  let mailed = 0;
  if (new Date(session.ends_at).getTime() > Date.now() || intent === "move") {
    const { data: students } = await supabase
      .from("orders")
      .select("student_name, student_email")
      .eq("batch_id", batchId)
      .eq("status", "verified");

    const durationMs = new Date(session.ends_at).getTime() - new Date(session.starts_at).getTime();
    const endsAt = new Date(new Date(startsAt).getTime() + durationMs).toISOString();
    const origin = await siteOrigin();
    const change =
      intent === "move"
        ? { kind: "moved" as const, previousStartsAt: session.starts_at, previousEndsAt: session.ends_at }
        : intent === "cancel"
          ? { kind: "cancelled" as const }
          : { kind: "restored" as const };

    const results = await Promise.all(
      (students ?? [])
        .filter((s) => s.student_email)
        .map((s) => {
          const data: ClassMailData = {
            studentName: s.student_name,
            courseTitle: course.title,
            batchName: batch.name,
            mode: batch.mode,
            venue: batch.venue,
            seq: session.seq,
            startsAt,
            endsAt,
          };
          return sendMail({
            to: s.student_email as string,
            replyTo: adminRecipients(),
            ...classChangedEmail(data, change, origin),
          });
        }),
    );
    mailed = results.filter((r) => r.ok).length;
    for (const r of results) if (!r.ok) console.warn("[batch] change email failed:", r.error);
  }

  revalidateBatch(batchId, batch.course_id, course.slug);
  redirect(back(batchId, { notice: intent, mailed: String(mailed) }));
}

// ── Recordings ───────────────────────────────────────────────────────────────

export async function saveRecording(form: FormData) {
  const batchId = text(form, "batch_id", 60);
  const sessionId = text(form, "session_id", 60);
  const url = text(form, "url", 500);
  const { supabase, batch, course } = await ownBatch(batchId);

  const { data: session } = await supabase
    .from("batch_sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("batch_id", batchId)
    .maybeSingle();
  if (!session) redirect(back(batchId, { error: "That class was not found." }));

  if (!url) {
    await supabase.from("session_recordings").delete().eq("session_id", sessionId);
  } else {
    if (!HTTPS_URL.test(url)) {
      redirect(back(batchId, { error: "The recording link must start with https://." }));
    }
    const { error } = await supabase
      .from("session_recordings")
      .upsert({ session_id: sessionId, url, added_at: new Date().toISOString() });
    if (error) redirect(back(batchId, { error: friendly(error.message) }));
  }

  revalidateBatch(batchId, batch.course_id, course.slug);
  redirect(back(batchId, { notice: url ? "recording" : "recording-removed" }));
}

// ── Delete ───────────────────────────────────────────────────────────────────

/** Delete an empty batch. The database refuses while any student holds a seat. */
export async function deleteBatch(form: FormData) {
  const batchId = text(form, "batch_id", 64);
  const { supabase, batch, course } = await ownBatch(batchId);

  const { error } = await supabase.rpc("delete_batch", { p_batch: batchId });
  if (error) redirect(back(batchId, { error: friendly(error.message) }));

  revalidateBatch(batchId, batch.course_id, course.slug);
  redirect(`/dashboard/faculty/courses/${batch.course_id}/batches?notice=deleted`);
}
