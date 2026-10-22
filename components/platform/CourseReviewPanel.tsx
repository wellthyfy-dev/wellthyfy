"use client";

import { AlertCircle, BadgeCheck, Loader2, MessageSquareWarning } from "lucide-react";
import { useActionState, useState } from "react";
import { approveCourse, rejectCourse, type ReviewState } from "@/app/admin/actions";
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

/** Approve (publish) a submitted course, or send it back with requested changes. */
export default function CourseReviewPanel({ courseId }: { courseId: string }) {
  const [mode, setMode] = useState<"approve" | "reject">("approve");
  const [approveState, approve, approving] = useActionState<ReviewState, FormData>(
    approveCourse,
    { error: null },
  );
  const [rejectState, reject, rejecting] = useActionState<ReviewState, FormData>(rejectCourse, {
    error: null,
  });

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
            {m === "approve" ? "Approve" : "Request changes"}
          </button>
        ))}
      </div>

      {mode === "approve" ? (
        <form action={approve} className="mt-5 grid gap-4">
          <input type="hidden" name="id" value={courseId} />
          <div className="rounded-xl border border-well-200 bg-well-50/70 px-4 py-3 text-xs leading-relaxed text-ink-soft">
            Approving publishes the course on wellthyfy.in straight away and emails the faculty.
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
                Publishing…
              </>
            ) : (
              <>
                <BadgeCheck className="size-4.5" strokeWidth={2.2} />
                Approve and publish
              </>
            )}
          </button>
        </form>
      ) : (
        <form action={reject} className="mt-5 grid gap-4">
          <input type="hidden" name="id" value={courseId} />
          <div>
            <label htmlFor="course_note" className={labelClass}>
              What should they change?
            </label>
            <textarea
              id="course_note"
              name="note"
              rows={4}
              required
              minLength={5}
              maxLength={1000}
              placeholder="Shown on their dashboard and in the email, e.g. “Please add a clearer banner and the session timings.”"
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
                Sending…
              </>
            ) : (
              <>
                <MessageSquareWarning className="size-4.5" strokeWidth={2.2} />
                Send back for changes
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
