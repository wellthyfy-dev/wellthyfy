import { NextResponse, type NextRequest } from "next/server";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { recordRazorpayPayment } from "@/lib/razorpay-enrol";
import { getSessionProfile } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

const fail = (error: string, status: number, extra?: Record<string, unknown>) =>
  NextResponse.json({ error, ...extra }, { status });

/**
 * Confirms a Checkout payment from the browser and enrols the student.
 *
 * The signature must equal HMAC-SHA256(order_id|payment_id, key_secret);
 * anything else is rejected with 400 and nothing is recorded. If the student
 * closes the tab before this runs, the order.paid webhook records it instead.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const orderId = typeof body?.razorpay_order_id === "string" ? body.razorpay_order_id : "";
  const paymentId = typeof body?.razorpay_payment_id === "string" ? body.razorpay_payment_id : "";
  const signature = typeof body?.razorpay_signature === "string" ? body.razorpay_signature : "";
  if (!orderId || !paymentId || !signature) return fail("Missing payment details.", 400);

  if (!verifyPaymentSignature(orderId, paymentId, signature)) {
    console.warn("[razorpay] signature mismatch for", orderId, paymentId);
    return fail("We couldn't confirm this payment. If money was debited, contact us.", 400);
  }

  const { supabase, user } = await getSessionProfile();
  if (!user) return fail("Please sign in again to finish enrolling.", 401);

  const result = await recordRazorpayPayment({ supabase, orderId, paymentId, sessionUserId: user.id });
  switch (result.kind) {
    case "enrolled":
      return NextResponse.json({ ok: true, order_id: result.orderId, payment_id: paymentId });
    case "refunded":
      return fail(
        `${result.reason} We've refunded your payment in full — it reaches your account in 5–7 working days.`,
        409,
        { refunded: true },
      );
    case "refund_failed":
      return fail(
        `${result.reason} Your payment (${paymentId}) is safe — our team will refund you shortly.`,
        409,
      );
    case "not_mine":
      return fail("This payment belongs to a different account.", 403);
    default:
      return fail(
        `Your payment (${paymentId}) went through and we're confirming it. You'll get an email once you're enrolled — no need to pay again.`,
        500,
      );
  }
}
