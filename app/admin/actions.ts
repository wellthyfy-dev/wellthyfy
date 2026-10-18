"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { FACULTY_DOMAIN, isFacultyEmail, type FacultyApplication } from "@/lib/faculty";
import { applicationApprovedEmail, applicationRejectedEmail } from "@/lib/faculty-emails";
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
}

/**
 * Approve an application.
 *
 * The database function does the real work in one transaction: it publishes
 * the course and stores the assigned mail id and the private invite token. Only
 * after that succeeds do we email the applicant.
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

  const { token, slug } = data as { token: string; slug: string; course_id: string };

  const { data: app } = await supabase
    .from("faculty_applications")
    .select("full_name, contact_email, course_title")
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
        courseTitle: app.course_title,
        facultyEmail: email,
        joinUrl: `${origin}/faculty/join?token=${token}`,
        loginUrl: `${origin}/faculty/login`,
        courseUrl: `${origin}/courses/${slug}`,
        note: note || null,
      }),
    });
    mailed = result.ok;
    if (!result.ok) console.warn("[admin] approval email failed:", result.error);
  }

  revalidatePublic();
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
    .select("full_name, contact_email, course_title")
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
      ...applicationRejectedEmail({
        fullName: app.full_name,
        courseTitle: app.course_title,
        note: note || null,
      }),
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

  const { data: course } = await supabase
    .from("courses")
    .select("slug")
    .eq("application_id", id)
    .maybeSingle();

  const origin = await siteOrigin();
  const result = await sendMail({
    to: app.contact_email,
    replyTo: adminRecipients(),
    ...applicationApprovedEmail({
      fullName: app.full_name,
      courseTitle: app.course_title,
      facultyEmail: app.assigned_email,
      joinUrl: `${origin}/faculty/join?token=${app.invite_token}`,
      loginUrl: `${origin}/faculty/login`,
      courseUrl: course ? `${origin}/courses/${course.slug}` : origin,
      note: app.admin_note,
    }),
  });

  redirect(`/admin/applications/${id}?notice=${result.ok ? "resent" : "resend-failed"}`);
}

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
    })
    .eq("id", id);

  revalidatePublic();
}
