"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/supabase/auth";

export type EnrollState = { error: string | null; ok?: boolean };

/**
 * Records a manual-UPI enrolment. The student pays out of band and submits the
 * UTR; the faculty verifies it from their dashboard. Amount and faculty are
 * read from the course row server-side so neither can be forged by the client.
 */
export async function submitEnrollment(
  _prev: EnrollState,
  form: FormData,
): Promise<EnrollState> {
  const { supabase, profile } = await requireProfile();

  const courseId = String(form.get("course_id") ?? "");
  const slug = String(form.get("slug") ?? "");
  const utr = String(form.get("utr") ?? "").trim();
  const note = String(form.get("payer_note") ?? "").trim().slice(0, 300);

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

  const { error } = await supabase.from("orders").insert({
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
  });

  if (error) {
    if (error.code === "23505") return { error: "You have already enrolled in this course." };
    return { error: error.message };
  }

  revalidatePath(`/courses/${slug}`);
  revalidatePath("/dashboard/student");
  revalidatePath("/dashboard/faculty");
  return { error: null, ok: true };
}
