import { NextResponse, type NextRequest } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { recordRazorpayPayment } from "@/lib/razorpay-enrol";
import { createPublicClient } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";

type OrderPaid = {
  event?: string;
  payload?: {
    payment?: { entity?: { id?: string; order_id?: string } };
    order?: { entity?: { id?: string } };
  };
};

/**
 * Razorpay webhook (subscribe to `order.paid`). Records the enrolment even when
 * the student closed the tab before the browser's verify call ran. Safe to
 * receive more than once, and safe to race the verify call.
 *
 * Authenticity: X-Razorpay-Signature = HMAC-SHA256(raw body, webhook secret).
 * Returns 5xx only for problems worth a Razorpay retry.
 */
export async function POST(request: NextRequest) {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "webhook secret not set" }, { status: 503 });
  }

  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }

  let event: OrderPaid;
  try {
    event = JSON.parse(raw) as OrderPaid;
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (event.event !== "order.paid") return NextResponse.json({ ignored: event.event ?? null });

  const paymentId = event.payload?.payment?.entity?.id ?? "";
  const orderId = event.payload?.order?.entity?.id ?? event.payload?.payment?.entity?.order_id ?? "";
  if (!paymentId || !orderId) return NextResponse.json({ error: "missing ids" }, { status: 400 });

  const result = await recordRazorpayPayment({
    supabase: createPublicClient(),
    orderId,
    paymentId,
    sessionUserId: null,
  });
  if (result.kind === "error") {
    // Let Razorpay retry (it backs off for up to 24 hours).
    return NextResponse.json({ error: "not recorded" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, result: result.kind });
}
