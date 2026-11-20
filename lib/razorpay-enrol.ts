import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { adminRecipients, sendMail } from "@/lib/mailer";
import {
  newStudentFacultyEmail,
  paymentVerifiedEmail,
  razorpayPaidAdminEmail,
  razorpayRefundedAdminEmail,
} from "@/lib/order-emails";
import { razorpay, razorpayError } from "@/lib/razorpay";
import { siteOrigin } from "@/lib/site-origin";

type Recorded = {
  id: string;
  course_id: string;
  faculty_id: string | null;
  batch_id: string | null;
  course_title: string;
  amount_inr: number;
  utr: string;
  student_name: string | null;
  student_email: string | null;
  student_whatsapp: string | null;
  faculty_email: string | null;
  faculty_name: string | null;
  course_slug: string | null;
  already_recorded: boolean;
};

export type EnrolResult =
  | { kind: "enrolled"; orderId: string; fresh: boolean }
  | { kind: "refunded"; reason: string }
  | { kind: "refund_failed"; reason: string }
  | { kind: "not_mine" }
  | { kind: "error"; message: string };

/**
 * Turns a confirmed Razorpay payment into a verified enrolment. Shared by the
 * browser's verify call and the order.paid webhook; whichever arrives second
 * finds the order already recorded and does nothing.
 *
 * If the enrolment can't be made because the batch filled up or the student is
 * already enrolled, the payment is refunded in full straight away, the team is
 * emailed, and the caller tells the student.
 */
export async function recordRazorpayPayment({
  supabase,
  orderId,
  paymentId,
  sessionUserId,
}: {
  supabase: SupabaseClient;
  orderId: string;
  paymentId: string;
  /** The signed-in user (verify route) or null (webhook). */
  sessionUserId: string | null;
}): Promise<EnrolResult> {
  const token = process.env.PAYMENTS_SECRET;
  if (!token) {
    console.error("[razorpay] PAYMENTS_SECRET is not set; paid order", orderId, "not recorded");
    return { kind: "error", message: "PAYMENTS_SECRET is not set" };
  }

  // Course, batch, student and amount come from what we stamped on the order.
  let notes: Record<string, string | number>;
  let amountPaise: number;
  try {
    const order = await razorpay().orders.fetch(orderId);
    notes = (order.notes ?? {}) as Record<string, string | number>;
    amountPaise = Number(order.amount);
  } catch (err) {
    const { status, description } = razorpayError(err);
    console.error("[razorpay] order fetch failed:", orderId, status, description);
    return { kind: "error", message: "order fetch failed" };
  }

  const studentId = String(notes.student_id ?? "");
  if (!studentId) return { kind: "error", message: "order has no student" };
  if (sessionUserId && sessionUserId !== studentId) return { kind: "not_mine" };

  const { data, error } = await supabase.rpc("record_razorpay_payment", {
    p_token: token,
    p_student: studentId,
    p_course: String(notes.course_id ?? ""),
    p_batch: String(notes.batch_id ?? "") || null,
    p_amount_inr: Math.round(amountPaise / 100),
    p_rzp_order: orderId,
    p_rzp_payment: paymentId,
  });
  const recorded = ((data ?? []) as Recorded[])[0];

  if (error || !recorded) {
    // 23514: batch full/closed. 23505: already enrolled (paid twice).
    if (error?.code === "23514" || error?.code === "23505") {
      return refund(paymentId, orderId, error.message, notes);
    }
    console.error("[razorpay] paid but not recorded:", orderId, paymentId, error?.code, error?.message);
    return { kind: "error", message: error?.message ?? "not recorded" };
  }

  if (!recorded.already_recorded) await announce(supabase, recorded);
  return { kind: "enrolled", orderId: recorded.id, fresh: !recorded.already_recorded };
}

async function refund(
  paymentId: string,
  orderId: string,
  reason: string,
  notes: Record<string, string | number>,
): Promise<EnrolResult> {
  const admins = adminRecipients();
  const alert = async (refunded: boolean, detail: string) => {
    if (!admins.length) return;
    const origin = await siteOrigin();
    const res = await sendMail({
      to: admins,
      ...razorpayRefundedAdminEmail(
        { paymentId, orderId, reason, refunded, detail, courseTitle: String(notes.course_title ?? "") },
        origin,
      ),
    });
    if (!res.ok) console.warn("[razorpay] refund alert not sent:", res.error);
  };

  try {
    const r = await razorpay().payments.refund(paymentId, {
      speed: "normal",
      notes: { reason: reason.slice(0, 250) },
    });
    console.warn("[razorpay] refunded", paymentId, r.id, "—", reason);
    await alert(true, r.id);
    return { kind: "refunded", reason };
  } catch (err) {
    const { status, description } = razorpayError(err);
    // A second caller (webhook vs verify) hits "already refunded" — that's fine.
    if (/fully refunded|already been refunded/i.test(description)) return { kind: "refunded", reason };
    console.error("[razorpay] REFUND FAILED", paymentId, status, description, "—", reason);
    await alert(false, description);
    return { kind: "refund_failed", reason };
  }
}

/** Emails the student, the team and the faculty; never fails the enrolment. */
async function announce(supabase: SupabaseClient, recorded: Recorded) {
  const { data: batch } = recorded.batch_id
    ? await supabase
        .from("batches")
        .select("name, mode, start_date, days, start_time, duration_min, venue")
        .eq("id", recorded.batch_id)
        .maybeSingle()
    : { data: null };
  const origin = await siteOrigin();
  const mail = { ...recorded, batch };
  const courseUrl = recorded.course_slug ? `${origin}/courses/${recorded.course_slug}` : null;
  const admins = adminRecipients();

  const mails = [];
  if (recorded.student_email) {
    mails.push(
      sendMail({ to: recorded.student_email, replyTo: admins, ...paymentVerifiedEmail(mail, origin, courseUrl) }),
    );
  }
  if (admins.length) {
    mails.push(
      sendMail({
        to: admins,
        replyTo: recorded.student_email ?? undefined,
        ...razorpayPaidAdminEmail(mail, origin),
      }),
    );
  }
  if (recorded.faculty_email) {
    mails.push(
      sendMail({
        to: recorded.faculty_email,
        replyTo: admins,
        ...newStudentFacultyEmail(mail, recorded.faculty_name, origin),
      }),
    );
  }
  for (const result of await Promise.all(mails)) {
    if (!result.ok) console.warn("[razorpay] enrolment email failed:", result.error);
  }

  revalidatePath("/courses/[slug]", "page");
  revalidatePath("/dashboard/student");
  revalidatePath("/dashboard/faculty");
  revalidatePath("/admin", "layout");
}
