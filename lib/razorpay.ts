import { createHmac, timingSafeEqual } from "node:crypto";
import Razorpay from "razorpay";

/** Razorpay will not open an order below ₹1. */
export const MIN_AMOUNT_PAISE = 100;

/** True when both keys are set; the course page falls back to manual UPI otherwise. */
export function razorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

let client: Razorpay | null = null;

/** Server-side SDK client. Never import this from a client component. */
export function razorpay() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) throw new Error("Razorpay keys are not set");
  client ??= new Razorpay({ key_id, key_secret });
  return client;
}

/**
 * Checkout signature check: HMAC-SHA256(order_id + "|" + payment_id, key_secret),
 * compared in constant time with what Razorpay handed the browser.
 */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Webhook check: X-Razorpay-Signature = HMAC-SHA256(raw body, webhook secret). */
export function verifyWebhookSignature(rawBody: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Razorpay SDK errors carry the HTTP status and a description. */
export function razorpayError(err: unknown) {
  const e = err as { statusCode?: number; error?: { description?: string } };
  return { status: e?.statusCode, description: e?.error?.description ?? String(err) };
}
