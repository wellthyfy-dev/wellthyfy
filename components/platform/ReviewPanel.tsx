"use client";

import { AlertCircle, BadgeCheck, Loader2, XCircle } from "lucide-react";
import { useActionState, useState } from "react";
import {
  approveApplication,
  rejectApplication,
  type ReviewState,
} from "@/app/admin/actions";
import { FACULTY_DOMAIN } from "@/lib/faculty";
import { fieldClass, labelClass } from "./AuthForm";

function ErrorLine({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
    >
      <AlertCircle className="mt-0.5 size-4.5 shrink-0 text-red-600" />
      {message}
    </p>
  );
}

/** Approve (assign a Wellthyfy mail id) or reject, for a pending application. */
export default function ReviewPanel({
  applicationId,
  suggestedLocalPart,
}: {
  applicationId: string;
  suggestedLocalPart: string;
}) {
  const [mode, setMode] = useState<"approve" | "reject">("approve");
  const [approveState, approve, approving] = useActionState<ReviewState, FormData>(
    approveApplication,
    { error: null },
  );
  const [rejectState, reject, rejecting] = useActionState<ReviewState, FormData>(
    rejectApplication,
    { error: null },
  );

  return (
    <div className="rounded-3xl border border-navy-900/7 bg-white/90 p-6 shadow-soft backdrop-blur-sm">
      <div className="grid grid-cols-2 gap-2 rounded-full bg-navy-50/70 p-1">
        {(["approve", "reject"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              mode === m ? "bg-white text-navy-800 shadow-sm" : "text-ink-soft hover:text-navy-800"
            }`}
          >
            {m === "approve" ? "Approve" : "Reject"}
          </button>
        ))}
      </div>

      {mode === "approve" ? (
        <form action={approve} className="mt-5 grid gap-4">
          <input type="hidden" name="id" value={applicationId} />

          <div>
            <label htmlFor="assigned_email" className={labelClass}>
              Assign a Wellthyfy mail id
            </label>
            <input
              id="assigned_email"
              name="assigned_email"
              type="email"
              required
              defaultValue={`${suggestedLocalPart}@${FACULTY_DOMAIN}`}
              placeholder={`name@${FACULTY_DOMAIN}`}
              className={fieldClass}
            />
            <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
              Create this mailbox first. The faculty member signs up with it, and the account
              confirmation email is delivered there.
            </p>
          </div>

          <div>
            <label htmlFor="approve_note" className={labelClass}>
              Note to the applicant (optional)
            </label>
            <textarea
              id="approve_note"
              name="note"
              rows={3}
              maxLength={1000}
              placeholder="Included in the approval email."
              className={`${fieldClass} resize-y`}
            />
          </div>

          <div className="rounded-xl border border-well-200 bg-well-50/70 px-4 py-3 text-xs leading-relaxed text-ink-soft">
            Approving emails the applicant their mail id and a private link to create their
            faculty account. They then create courses, and you approve each course separately.
          </div>

          <ErrorLine message={approveState.error} />

          <button
            type="submit"
            disabled={approving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-well-600 to-well-700 px-6 py-3.5 text-sm font-semibold text-white shadow-glow-green transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift disabled:translate-y-0 disabled:opacity-70"
          >
            {approving ? (
              <>
                <Loader2 className="size-4.5 animate-spin" />
                Approving…
              </>
            ) : (
              <>
                <BadgeCheck className="size-4.5" strokeWidth={2.2} />
                Approve applicant
              </>
            )}
          </button>
        </form>
      ) : (
        <form action={reject} className="mt-5 grid gap-4">
          <input type="hidden" name="id" value={applicationId} />

          <div>
            <label htmlFor="reject_note" className={labelClass}>
              Reason (shared with the applicant)
            </label>
            <textarea
              id="reject_note"
              name="note"
              rows={4}
              maxLength={1000}
              placeholder="Optional, but a short reason helps them reapply."
              className={`${fieldClass} resize-y`}
            />
          </div>

          <ErrorLine message={rejectState.error} />

          <button
            type="submit"
            disabled={rejecting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-6 py-3.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-70"
          >
            {rejecting ? (
              <>
                <Loader2 className="size-4.5 animate-spin" />
                Rejecting…
              </>
            ) : (
              <>
                <XCircle className="size-4.5" strokeWidth={2.2} />
                Reject application
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
