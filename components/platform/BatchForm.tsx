"use client";

import { AlertCircle, CalendarPlus, Loader2 } from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import { createBatch, type BatchFormState } from "@/app/dashboard/faculty/batches/actions";
import { cn } from "@/lib/accents";
import {
  BATCH_MODE_LABELS,
  DEFAULT_SEATS,
  WEEKDAYS,
  isOnline,
  needsVenue,
  type BatchMode,
} from "@/lib/batches";
import { fieldClass, labelClass } from "./AuthForm";

/** First few class dates for the chosen timetable, so faculty can sanity-check it. */
function preview(start: string, days: number[], count: number) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || days.length === 0 || !(count > 0)) return [];
  const out: string[] = [];
  const d = new Date(`${start}T12:00:00Z`);
  for (let i = 0; i < 800 && out.length < Math.min(count, 4); i++) {
    const iso = ((d.getUTCDay() + 6) % 7) + 1;
    if (days.includes(iso)) {
      out.push(
        d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }),
      );
    }
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

export default function BatchForm({
  courseId,
  modes,
  defaultVenue,
  minDate,
}: {
  courseId: string;
  modes: BatchMode[];
  defaultVenue: string;
  /** Today in IST, "YYYY-MM-DD". */
  minDate: string;
}) {
  const [state, formAction, pending] = useActionState<BatchFormState, FormData>(createBatch, {
    error: null,
  });
  const [mode, setMode] = useState<BatchMode>(modes[0]);
  const [days, setDays] = useState<number[]>([1, 3, 5]);
  const [start, setStart] = useState("");
  const [count, setCount] = useState(12);

  const firstDates = useMemo(() => preview(start, days, count), [start, days, count]);

  const toggle = (d: number) =>
    setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d].sort()));

  return (
    <form action={formAction} className="grid gap-5">
      <input type="hidden" name="course_id" value={courseId} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            Batch name
          </label>
          <input
            id="name"
            name="name"
            required
            minLength={2}
            maxLength={80}
            placeholder="Morning batch — December"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="mode" className={labelClass}>
            How it is taught
          </label>
          <select
            id="mode"
            name="mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as BatchMode)}
            className={fieldClass}
          >
            {modes.map((m) => (
              <option key={m} value={m}>
                {BATCH_MODE_LABELS[m]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset>
        <legend className={labelClass}>Class days</legend>
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((d) => {
            const on = days.includes(d.value);
            return (
              <label
                key={d.value}
                className={cn(
                  "cursor-pointer select-none rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  on
                    ? "border-well-400 bg-well-50 text-well-800"
                    : "border-navy-900/10 bg-white text-ink-soft hover:border-navy-300",
                )}
              >
                <input
                  type="checkbox"
                  name="days"
                  value={d.value}
                  checked={on}
                  onChange={() => toggle(d.value)}
                  className="sr-only"
                />
                {d.short}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="start_date" className={labelClass}>
            First class on or after
          </label>
          <input
            id="start_date"
            name="start_date"
            type="date"
            required
            min={minDate}
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="start_time" className={labelClass}>
            Time (IST)
          </label>
          <input
            id="start_time"
            name="start_time"
            type="time"
            required
            defaultValue="07:00"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="duration_min" className={labelClass}>
            Class length (min)
          </label>
          <input
            id="duration_min"
            name="duration_min"
            type="number"
            required
            min={15}
            max={480}
            step={5}
            defaultValue={60}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="session_count" className={labelClass}>
            Number of classes
          </label>
          <input
            id="session_count"
            name="session_count"
            type="number"
            required
            min={1}
            max={200}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className={fieldClass}
          />
        </div>
      </div>

      {firstDates.length > 0 && (
        <p className="rounded-xl border border-navy-900/7 bg-navy-50/50 px-4 py-3 text-sm text-ink-soft">
          First classes: <span className="font-semibold text-ink">{firstDates.join(" · ")}</span>
          {count > firstDates.length && " …"}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-[10rem_minmax(0,1fr)]">
        <div>
          <label htmlFor="seats" className={labelClass}>
            Seats
          </label>
          <input
            id="seats"
            name="seats"
            type="number"
            required
            min={1}
            max={500}
            defaultValue={DEFAULT_SEATS}
            className={fieldClass}
          />
        </div>

        {isOnline(mode) && (
          <div>
            <label htmlFor="meeting_url" className={labelClass}>
              Class link (Zoom or Google Meet) — optional now
            </label>
            <input
              id="meeting_url"
              name="meeting_url"
              type="url"
              inputMode="url"
              placeholder="https://zoom.us/j/…"
              className={fieldClass}
            />
            <p className="mt-1.5 text-xs text-ink-soft">
              Use one recurring link for the whole batch. Only students with a verified payment
              can see it.
            </p>
          </div>
        )}
      </div>

      {needsVenue(mode) && (
        <div>
          <label htmlFor="venue" className={labelClass}>
            Venue address
          </label>
          <textarea
            id="venue"
            name="venue"
            rows={2}
            required
            maxLength={500}
            defaultValue={defaultVenue}
            className={`${fieldClass} resize-y`}
          />
        </div>
      )}

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
        className="inline-flex items-center justify-center gap-2 justify-self-start rounded-full bg-gradient-to-r from-well-600 to-navy-700 px-6 py-3 text-sm font-semibold text-white shadow-glow-green transition-all duration-300 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-70"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <CalendarPlus className="size-4" />}
        {pending ? "Creating…" : "Create batch"}
      </button>
    </form>
  );
}
