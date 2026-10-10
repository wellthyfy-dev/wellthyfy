"use client";

import { AlertCircle, CheckCircle2, Copy, Loader2, Send } from "lucide-react";
import { useActionState, useState } from "react";
import { submitEnrollment, type EnrollState } from "@/app/courses/[slug]/actions";
import { formatINR } from "@/lib/platform";
import { fieldClass, labelClass } from "./AuthForm";

export default function EnrollPanel({
  courseId,
  slug,
  amount,
  upiId,
  qrSvg,
}: {
  courseId: string;
  slug: string;
  amount: number;
  upiId: string;
  qrSvg: string;
}) {
  const [copied, setCopied] = useState(false);
  const [state, formAction, pending] = useActionState<EnrollState, FormData>(submitEnrollment, {
    error: null,
  });

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-well-200 bg-well-50 p-6">
        <CheckCircle2 className="size-7 text-well-600" />
        <p className="mt-3 font-display text-lg font-semibold text-ink">Enrolment submitted</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Your payment reference is with the faculty. Once they confirm it against their bank
          statement, the course shows as verified in your dashboard.
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

      {amount > 0 && (
        <>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Scan the QR with any UPI app, or pay to the ID below. Then enter the UTR / reference
            number from your payment so the faculty can confirm it.
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

      <form action={formAction} className="mt-6 grid gap-4 border-t border-navy-900/7 pt-6">
        <input type="hidden" name="course_id" value={courseId} />
        <input type="hidden" name="slug" value={slug} />

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
            Note for the faculty (optional)
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
          disabled={pending}
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
  );
}
