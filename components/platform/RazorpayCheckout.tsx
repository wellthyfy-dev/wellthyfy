"use client";

import { AlertCircle, Loader2, Lock } from "lucide-react";
import { useState } from "react";
import { formatINR } from "@/lib/platform";

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

type RazorpaySuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", cb: (res: { error?: { description?: string } }) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

let scriptPromise: Promise<boolean> | null = null;

/** Loads checkout.js once, on first click, so course pages stay light. */
function loadCheckout() {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  scriptPromise ??= new Promise<boolean>((resolve) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => {
      scriptPromise = null;
      resolve(false);
    };
    document.body.appendChild(s);
  });
  return scriptPromise;
}

async function postJson<T>(url: string, body: unknown): Promise<T & { error?: string }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ...data, error: data.error ?? "Something went wrong. Please try again." };
  return data;
}

export default function RazorpayCheckout({
  courseId,
  batchId,
  amount,
  disabled,
  onPaid,
}: {
  courseId: string;
  batchId: string;
  /** Course price in rupees, for the button label. */
  amount: number;
  disabled?: boolean;
  onPaid: (paymentId: string) => void;
}) {
  const [busy, setBusy] = useState<"idle" | "opening" | "verifying">("idle");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function pay() {
    setError(null);
    setNotice(null);
    setBusy("opening");

    const [loaded, order] = await Promise.all([
      loadCheckout(),
      postJson<{
        order_id: string;
        amount: number;
        currency: string;
        key_id: string;
        course_title: string;
        prefill: { name: string; email: string; contact: string };
      }>("/api/razorpay/create-order", { course_id: courseId, batch_id: batchId || null }),
    ]);

    if (order.error) {
      setBusy("idle");
      setError(order.error);
      return;
    }
    if (!loaded || !window.Razorpay) {
      setBusy("idle");
      setError("Couldn't load the payment window. Check your connection and try again.");
      return;
    }

    const rzp = new window.Razorpay({
      key: order.key_id,
      order_id: order.order_id,
      amount: order.amount,
      currency: order.currency,
      name: "Wellthyfy",
      description: order.course_title,
      prefill: order.prefill,
      theme: { color: "#0E2233" },
      handler: async (res: RazorpaySuccess) => {
        setBusy("verifying");
        const result = await postJson<{ ok: boolean; payment_id: string }>(
          "/api/razorpay/verify-payment",
          {
            razorpay_payment_id: res.razorpay_payment_id,
            razorpay_order_id: res.razorpay_order_id,
            razorpay_signature: res.razorpay_signature,
          },
        );
        setBusy("idle");
        if (result.error) setError(result.error);
        else onPaid(result.payment_id);
      },
      modal: {
        ondismiss: () => {
          setBusy((b) => (b === "verifying" ? b : "idle"));
          setNotice("Payment cancelled. You can try again whenever you're ready.");
        },
      },
    });
    rzp.on("payment.failed", (res) => {
      setError(
        `Payment failed${res.error?.description ? `: ${res.error.description}` : "."} No money was taken — please try again.`,
      );
    });
    rzp.open();
  }

  return (
    <div className="grid gap-3">
      {error && (
        <p
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
        >
          <AlertCircle className="mt-0.5 size-4.5 shrink-0 text-red-600" />
          {error}
        </p>
      )}
      {notice && !error && (
        <p role="status" className="rounded-xl border border-navy-900/10 bg-navy-50/60 px-4 py-3 text-sm text-ink-soft">
          {notice}
        </p>
      )}

      <button
        type="button"
        onClick={pay}
        disabled={disabled || busy !== "idle"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-well-600 via-well-500 to-navy-700 px-7 py-3.5 text-base font-semibold text-white shadow-glow-green transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift disabled:translate-y-0 disabled:opacity-70"
      >
        {busy === "idle" ? (
          <>
            <Lock className="size-4.5" />
            Pay {formatINR(amount)} securely
          </>
        ) : (
          <>
            <Loader2 className="size-4.5 animate-spin" />
            {busy === "verifying" ? "Confirming payment…" : "Opening payment…"}
          </>
        )}
      </button>
      <p className="text-center text-xs text-ink-soft">
        UPI, cards, net banking and wallets via Razorpay. You&apos;re enrolled instantly.
      </p>
    </div>
  );
}
