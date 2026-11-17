"use server";

import { revalidatePath } from "next/cache";
import { adminRecipients, sendMail } from "@/lib/mailer";
import { enrollmentReceivedEmail, newEnrollmentAdminEmail } from "@/lib/order-emails";
import { siteOrigin } from "@/lib/site-origin";
import { requireProfile } from "@/lib/supabase/auth";

export type EnrollState = { error: string | null; ok?: boolean };

/**
 * Records a manual-UPI enrolment. The student pays out of band and submits the
 * UTR; a Wellthyfy admin verifies it (Admin → Payments). The team is alerted by
 * email and the student gets a receipt. Amount and faculty are
 * read from the course row server-side so neither can be forged by the client.
 */
export async function submitEnrollment(_prev: EnrollState, form: FormData): Promise<EnrollState> {
  const { supabase, profile } = await requireProfile();

  const courseId = String(form.get("course_id") ?? "");
  const slug = String(form.get("slug") ?? "");
  const batchId = String(form.get("batch_id") ?? "").trim() || null;
  const utr = String(form.get("utr") ?? "").trim();
  const note = String(form.get("payer_note") ?? "")
    .trim()
    .slice(0, 300);

  if (!courseId) return { error: "Missing course." };
  if (!/^[A-Za-z0-9]{8,30}$/.test(utr)) {
    return { error: "Enter the UTR / reference number exactly as your bank shows it." };
  }

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, title, price_inr, faculty_id, status")
    .eq("id", courseId)
    .maybeSingle();

  if (courseError || !course) return { error: "That course is no longer available." };
  if (course.status !== "published") return { error: "That course is not open for enrolment." };
  if (course.faculty_id === profile.id) {
    return { error: "You cannot enrol in your own course." };
  }

  // Courses that run in batches need one picked; the database enforces seats.
  const { data: openBatches } = await supabase
    .from("batches")
    .select("id, name, mode, start_date, days, start_time, duration_min, venue")
    .eq("course_id", course.id)
    .eq("status", "open");
  const batch = batchId ? (openBatches ?? []).find((b) => b.id === batchId) : null;
  if ((openBatches ?? []).length > 0 && !batch) {
    return { error: "Choose the batch you want to join." };
  }

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      course_id: course.id,
      student_id: profile.id,
      faculty_id: course.faculty_id,
      course_title: course.title,
      amount_inr: course.price_inr,
      student_name: profile.full_name,
      student_email: profile.email,
      student_whatsapp: profile.whatsapp,
      utr,
      payer_note: note || null,
      batch_id: batch?.id ?? null,
    })
    .select(
      "id, course_title, amount_inr, utr, payer_note, student_name, student_email, student_whatsapp",
    )
    .single();

  if (error) {
    if (error.code === "23505") return { error: "You have already enrolled in this course." };
    // Raised by the seat-limit check (e.g. the last seat just went).
    if (error.code === "23514") return { error: error.message };
    return { error: "We couldn't save your enrolment. Please try again." };
  }

  // The enrolment is saved; email is a courtesy and must never fail it.
  if (order) {
    const mail = { ...order, batch };
    const origin = await siteOrigin();
    const admins = adminRecipients();
    const [adminMail, studentMail] = await Promise.all([
      admins.length
        ? sendMail({
            to: admins,
            replyTo: order.student_email ?? undefined,
            ...newEnrollmentAdminEmail(mail, origin),
          })
        : Promise.resolve({ ok: false as const, error: "no admin recipients configured" }),
      order.student_email
        ? sendMail({
            to: order.student_email,
            replyTo: admins,
            ...enrollmentReceivedEmail(mail, origin),
          })
        : Promise.resolve({ ok: false as const, error: "student has no email" }),
    ]);
    if (!adminMail.ok) console.warn("[enrol] admin alert not sent:", adminMail.error);
    if (!studentMail.ok) console.warn("[enrol] receipt not sent:", studentMail.error);
  }

  revalidatePath(`/courses/${slug}`);
  revalidatePath("/dashboard/student");
  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard/faculty");
  return { error: null, ok: true };
}
