"use client";

import { AlertCircle, CalendarDays, CheckCircle2, Copy, Loader2, MapPin, Send, Video } from "lucide-react";
import { useActionState, useState } from "react";
import { submitEnrollment, type EnrollState } from "@/app/courses/[slug]/actions";
import { cn } from "@/lib/accents";
import RazorpayCheckout from "./RazorpayCheckout";
import { formatINR } from "@/lib/platform";
import { fieldClass, labelClass } from "./AuthForm";

export type BatchChoice = {
  id: string;
  name: string;
  schedule: string;
  starts: string;
  mode: string;
  online: boolean;
  seatsLeft: number;
};

export default function EnrollPanel({
  courseId,
  slug,
  amount,
  upiId,
  qrSvg,
  batches = [],
  online = false,
}: {
  courseId: string;
  slug: string;
  amount: number;
  upiId: string;
  qrSvg: string;
  /** Open batches to choose from; empty when the course has none. */
  batches?: BatchChoice[];
  /** Razorpay is configured: offer instant online payment, with UPI as a fallback. */
  online?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const firstOpen = batches.find((b) => b.seatsLeft > 0)?.id ?? "";
  const [batchId, setBatchId] = useState(batches.length === 1 ? firstOpen : "");
  const payOnline = online && amount > 0;
  const [showUpi, setShowUpi] = useState(!payOnline);
  const [paidId, setPaidId] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState<EnrollState, FormData>(submitEnrollment, {
    error: null,
  });

  if (paidId) {
    return (
      <div className="rounded-2xl border border-well-200 bg-well-50 p-6">
        <CheckCircle2 className="size-7 text-well-600" />
        <p className="mt-3 font-display text-lg font-semibold text-ink">You&apos;re enrolled!</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Payment received
          {batches.length > 0 ? " and your seat is confirmed" : ""}. A confirmation is on its way
          to your email{batches.length > 0 ? " and your classes are in your dashboard" : ""}.
        </p>
        <p className="mt-2 text-xs text-ink-soft">
          Payment ID <span className="font-mono">{paidId}</span>
        </p>
        <a
          href="/dashboard/student"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-well-600 to-navy-700 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Go to my dashboard
        </a>
      </div>
    );
  }

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-well-200 bg-well-50 p-6">
        <CheckCircle2 className="size-7 text-well-600" />
        <p className="mt-3 font-display text-lg font-semibold text-ink">Enrolment submitted</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Your payment reference is with the Wellthyfy team
          {batches.length > 0 ? " and your seat is held" : ""}. We&apos;ll email you as soon as
          it is verified — your classes then appear in your dashboard.
        </p>
        <a
          href="/dashboard/student"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-well-600 to-navy-700 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Go to my dashboard
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-navy-900/7 bg-white p-6">
      <p className="font-display text-lg font-semibold text-ink">
        Pay {amount === 0 ? "nothing — this course is free" : formatINR(amount)}
      </p>

      {batches.length > 0 && (
        <fieldset className="mt-5">
          <legend className={labelClass}>Choose your batch</legend>
          <div className="grid gap-2.5">
            {batches.map((b) => {
              const full = b.seatsLeft <= 0;
              const on = batchId === b.id;
              return (
                <label
                  key={b.id}
                  className={cn(
                    "relative block cursor-pointer rounded-xl border p-3.5 transition-colors",
                    full
                      ? "cursor-not-allowed border-navy-900/7 bg-navy-50/40 opacity-60"
                      : on
                        ? "border-well-400 bg-well-50 ring-2 ring-well-200"
                        : "border-navy-900/10 bg-white hover:border-navy-300",
                  )}
                >
                  <input
                    type="radio"
                    name="batch_choice"
                    value={b.id}
                    required
                    disabled={full}
                    checked={on}
                    onChange={() => setBatchId(b.id)}
                    className="sr-only"
                  />
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-ink">{b.name}</span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                        full
                          ? "bg-red-50 text-red-700"
                          : b.seatsLeft <= 5
                            ? "bg-gold-50 text-gold-800"
                            : "bg-well-50 text-well-800",
                      )}
                    >
                      {full ? "Full" : `${b.seatsLeft} seat${b.seatsLeft === 1 ? "" : "s"} left`}
                    </span>
                  </span>
                  <span className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-soft">
                    <CalendarDays className="size-3.5 shrink-0 text-navy-600" />
                    {b.schedule}
                  </span>
                  <span className="mt-1 flex items-center gap-1.5 text-xs text-ink-soft">
                    {b.online ? (
                      <Video className="size-3.5 shrink-0 text-navy-600" />
                    ) : (
                      <MapPin className="size-3.5 shrink-0 text-navy-600" />
                    )}
                    {b.mode} · starts {b.starts}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {payOnline && (
        <div className="mt-6">
          <RazorpayCheckout
            courseId={courseId}
            batchId={batchId}
            amount={amount}
            disabled={batches.length > 0 && !batchId}
            onPaid={setPaidId}
          />
          <button
            type="button"
            onClick={() => setShowUpi((v) => !v)}
            aria-expanded={showUpi}
            className="mt-4 block w-full text-center text-xs font-semibold text-navy-800 underline underline-offset-4"
          >
            {showUpi ? "Hide UPI QR option" : "Prefer to pay by UPI QR and share the UTR?"}
          </button>
        </div>
      )}

      {showUpi && (
        <div className={cn("mt-6", payOnline && "border-t border-navy-900/7 pt-6")}>
          {amount > 0 && (
            <>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Scan the QR with any UPI app, or pay to the ID below. Then enter the UTR / reference
                number from your payment so our team can confirm it.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-5">
                <div
                  className="shrink-0 rounded-2xl border border-navy-900/10 bg-white p-3 [&>svg]:block [&>svg]:size-40"
                  // Generated server-side from the UPI deep link; no user input.
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />

                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-700/60">
                    UPI ID
                  </p>
                  <p className="mt-1 break-all font-mono text-sm font-semibold text-ink">{upiId}</p>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(upiId);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-navy-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-navy-800 transition-colors hover:bg-navy-50"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="size-3.5 text-well-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        Copy UPI ID
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          <form action={formAction} className="mt-5 grid gap-4">
            <input type="hidden" name="course_id" value={courseId} />
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="batch_id" value={batchId} />

            <div>
              <label htmlFor="utr" className={labelClass}>
                UTR / payment reference
              </label>
              <input
                id="utr"
                name="utr"
                type="text"
                required
                inputMode="numeric"
                placeholder="12-digit reference from your UPI app"
                className={`${fieldClass} font-mono`}
              />
              <p className="mt-1.5 text-xs text-ink-soft">
                Shown as UTR, RRN or transaction ID in your payment receipt.
              </p>
            </div>

            <div>
              <label htmlFor="payer_note" className={labelClass}>
                Note for our team (optional)
              </label>
              <textarea
                id="payer_note"
                name="payer_note"
                rows={2}
                maxLength={300}
                placeholder="Anything they should know about your payment"
                className={`${fieldClass} resize-y`}
              />
            </div>

            {state.error && (
              <p
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
              >
                <AlertCircle className="mt-0.5 size-4.5 shrink-0 text-red-600" />
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending || (batches.length > 0 && !batchId)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-well-600 via-well-500 to-navy-700 px-7 py-3.5 text-base font-semibold text-white shadow-glow-green transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift disabled:translate-y-0 disabled:opacity-70"
            >
              {pending ? (
                <>
                  <Loader2 className="size-4.5 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  Confirm enrolment
                  <Send className="size-4.5" />
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
