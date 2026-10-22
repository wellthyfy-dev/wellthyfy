"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { FACULTY_DOMAIN, isFacultyEmail, type FacultyApplication } from "@/lib/faculty";
import {
  applicationApprovedEmail,
  applicationRejectedEmail,
  courseApprovedEmail,
  courseRejectedEmail,
} from "@/lib/faculty-emails";
import { adminRecipients, sendMail } from "@/lib/mailer";
import type { CourseStatus, OrderStatus } from "@/lib/platform";
import { siteOrigin } from "@/lib/site-origin";
import { requireAdmin } from "@/lib/supabase/auth";

export type ReviewState = { error: string | null };

const field = (form: FormData, key: string, max = 1000) =>
  String(form.get(key) ?? "").trim().slice(0, max);

function revalidatePublic() {
  revalidatePath("/");
  revalidatePath("/courses");
  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard/faculty");
}

// ── Faculty applications ─────────────────────────────────────────────────────

/**
 * Approve an applicant.
 *
 * The database function stores the assigned mail id and the private invite
 * token in one transaction. Only after that succeeds do we email the applicant.
 * No course is created here — faculty create courses after signing up, and
 * each one is reviewed separately.
 */
export async function approveApplication(
  _prev: ReviewState,
  form: FormData,
): Promise<ReviewState> {
  const { supabase } = await requireAdmin();

  const id = field(form, "id", 60);
  const email = field(form, "assigned_email", 200).toLowerCase();
  const note = field(form, "note");

  if (!isFacultyEmail(email)) {
    return { error: `Enter the faculty's mail id. It must end in @${FACULTY_DOMAIN}.` };
  }

  const { data, error } = await supabase.rpc("approve_faculty_application", {
    p_id: id,
    p_email: email,
    p_note: note || null,
  });
  if (error) return { error: error.message };

  const { token } = data as { token: string };

  const { data: app } = await supabase
    .from("faculty_applications")
    .select("full_name, contact_email")
    .eq("id", id)
    .single();

  let mailed = false;
  if (app) {
    const origin = await siteOrigin();
    const result = await sendMail({
      to: app.contact_email,
      replyTo: adminRecipients(),
      ...applicationApprovedEmail({
        fullName: app.full_name,
        facultyEmail: email,
        joinUrl: `${origin}/faculty/join?token=${token}`,
        loginUrl: `${origin}/faculty/login`,
        note: note || null,
      }),
    });
    mailed = result.ok;
    if (!result.ok) console.warn("[admin] approval email failed:", result.error);
  }

  revalidatePath("/admin", "layout");
  redirect(`/admin/applications/${id}?notice=${mailed ? "approved" : "approved-nomail"}`);
}

export async function rejectApplication(
  _prev: ReviewState,
  form: FormData,
): Promise<ReviewState> {
  const { supabase } = await requireAdmin();

  const id = field(form, "id", 60);
  const note = field(form, "note");

  const { data: app } = await supabase
    .from("faculty_applications")
    .select("full_name, contact_email")
    .eq("id", id)
    .single();

  const { error } = await supabase.rpc("reject_faculty_application", {
    p_id: id,
    p_note: note || null,
  });
  if (error) return { error: error.message };

  let mailed = false;
  if (app) {
    const result = await sendMail({
      to: app.contact_email,
      replyTo: adminRecipients(),
      ...applicationRejectedEmail({ fullName: app.full_name, note: note || null }),
    });
    mailed = result.ok;
    if (!result.ok) console.warn("[admin] rejection email failed:", result.error);
  }

  revalidatePath("/admin", "layout");
  redirect(`/admin/applications/${id}?notice=${mailed ? "rejected" : "rejected-nomail"}`);
}

/** Re-send the approval email (new inbox, lost message, etc.). */
export async function resendInvite(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = field(form, "id", 60);

  const { data } = await supabase
    .from("faculty_applications")
    .select("*")
    .eq("id", id)
    .eq("status", "approved")
    .maybeSingle();
  const app = data as FacultyApplication | null;
  if (!app?.invite_token || !app.assigned_email || app.faculty_user_id) {
    redirect(`/admin/applications/${id}?notice=resend-unavailable`);
  }

  const origin = await siteOrigin();
  const result = await sendMail({
    to: app.contact_email,
    replyTo: adminRecipients(),
    ...applicationApprovedEmail({
      fullName: app.full_name,
      facultyEmail: app.assigned_email,
      joinUrl: `${origin}/faculty/join?token=${app.invite_token}`,
      loginUrl: `${origin}/faculty/login`,
      note: app.admin_note,
    }),
  });

  redirect(`/admin/applications/${id}?notice=${result.ok ? "resent" : "resend-failed"}`);
}

// ── Course review ────────────────────────────────────────────────────────────

/** Loads what the decision emails need: the course and its faculty's contact. */
async function courseForDecision(supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"], id: string) {
  const { data: course } = await supabase
    .from("courses")
    .select("id, title, slug, status, faculty_id, faculty_name")
    .eq("id", id)
    .maybeSingle();
  if (!course) return null;
  const { data: faculty } = course.faculty_id
    ? await supabase.from("profiles").select("email, full_name").eq("id", course.faculty_id).maybeSingle()
    : { data: null };
  return { course, faculty };
}

export async function approveCourse(_prev: ReviewState, form: FormData): Promise<ReviewState> {
  const { supabase } = await requireAdmin();
  const id = field(form, "id", 60);

  const found = await courseForDecision(supabase, id);
  if (!found) return { error: "That course was not found." };
  if (found.course.status !== "pending_review") {
    return { error: "This course is not waiting for review." };
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("courses")
    .update({ status: "published", published_at: now, reviewed_at: now, review_note: null })
    .eq("id", id)
    .eq("status", "pending_review");
  if (error) return { error: error.message };

  let mailed = !found.faculty;
  if (found.faculty) {
    const origin = await siteOrigin();
    const result = await sendMail({
      to: found.faculty.email,
      replyTo: adminRecipients(),
      ...courseApprovedEmail({
        fullName: found.faculty.full_name || found.course.faculty_name || "there",
        title: found.course.title,
        courseUrl: `${origin}/courses/${found.course.slug}`,
      }),
    });
    mailed = result.ok;
    if (!result.ok) console.warn("[admin] course approval email failed:", result.error);
  }

  revalidatePublic();
  revalidatePath(`/courses/${found.course.slug}`);
  redirect(`/admin/courses/${id}?notice=${mailed ? "approved" : "approved-nomail"}`);
}

export async function rejectCourse(_prev: ReviewState, form: FormData): Promise<ReviewState> {
  const { supabase } = await requireAdmin();
  const id = field(form, "id", 60);
  const note = field(form, "note");

  if (note.length < 5) {
    return { error: "Tell the faculty what to change — it is shown to them." };
  }

  const found = await courseForDecision(supabase, id);
  if (!found) return { error: "That course was not found." };
  if (found.course.status !== "pending_review") {
    return { error: "This course is not waiting for review." };
  }

  const { error } = await supabase
    .from("courses")
    .update({
      status: "rejected",
      published_at: null,
      reviewed_at: new Date().toISOString(),
      review_note: note,
    })
    .eq("id", id)
    .eq("status", "pending_review");
  if (error) return { error: error.message };

  let mailed = !found.faculty;
  if (found.faculty) {
    const origin = await siteOrigin();
    const result = await sendMail({
      to: found.faculty.email,
      replyTo: adminRecipients(),
      ...courseRejectedEmail({
        fullName: found.faculty.full_name || found.course.faculty_name || "there",
        title: found.course.title,
        note,
        dashboardUrl: `${origin}/dashboard/faculty`,
      }),
    });
    mailed = result.ok;
    if (!result.ok) console.warn("[admin] course rejection email failed:", result.error);
  }

  revalidatePublic();
  redirect(`/admin/courses/${id}?notice=${mailed ? "rejected" : "rejected-nomail"}`);
}

// ── Payments and live courses ────────────────────────────────────────────────

export async function setOrderStatusAdmin(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = field(form, "id", 60);
  const status = field(form, "status", 20) as OrderStatus;
  if (!id || !["pending", "verified", "rejected"].includes(status)) return;

  await supabase
    .from("orders")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard/student");
  revalidatePath("/dashboard/faculty");
}

/** Take a live course off the site, or put a previously approved one back. */
export async function setCourseStatusAdmin(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = field(form, "id", 60);
  const status = field(form, "status", 20) as CourseStatus;
  if (!id || !["draft", "published", "archived"].includes(status)) return;

  await supabase
    .from("courses")
    .update({
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
      ...(status === "published" ? { reviewed_at: new Date().toISOString(), review_note: null } : {}),
    })
    .eq("id", id);

  revalidatePublic();
}
