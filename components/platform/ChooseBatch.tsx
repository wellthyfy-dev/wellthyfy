"use client";

import { CalendarDays, Loader2, MapPin, Video } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/accents";
import type { BatchChoice } from "./EnrollPanel";

function JoinButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-well-600 to-navy-700 px-5 py-2.5 text-sm font-semibold text-white shadow-glow-green transition-all duration-300 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      Join this batch
    </button>
  );
}

/** Batch picker for an enrolment that has no batch yet. */
export default function ChooseBatch({
  orderId,
  choices,
  action,
}: {
  orderId: string;
  choices: BatchChoice[];
  action: (formData: FormData) => Promise<void>;
}) {
  const firstOpen = choices.find((c) => c.seatsLeft > 0)?.id ?? "";
  const [batchId, setBatchId] = useState(choices.length === 1 ? firstOpen : "");

  return (
    <form action={action} className="mt-4 rounded-2xl border border-well-200 bg-well-50/70 p-4 sm:p-5">
      <input type="hidden" name="order_id" value={orderId} />
      <input type="hidden" name="batch_id" value={batchId} />
      <p className="text-sm font-semibold text-ink">Choose your live batch</p>
      <p className="mt-0.5 text-xs text-ink-soft">
        Pick a timetable to get your classes, Join button and reminders.
      </p>

      <fieldset className="mt-3 grid gap-2.5">
        <legend className="sr-only">Batches</legend>
        {choices.map((b) => {
          const full = b.seatsLeft === 0;
          const on = batchId === b.id;
          return (
            <label
              key={b.id}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border bg-white px-4 py-3 transition-colors",
                on ? "border-well-400 ring-2 ring-well-500/20" : "border-navy-900/10 hover:border-well-300",
                full && "cursor-not-allowed opacity-60",
              )}
            >
              <input
                type="radio"
                name={`batch_${orderId}`}
                value={b.id}
                checked={on}
                disabled={full}
                onChange={() => setBatchId(b.id)}
                className="mt-1 accent-well-600"
              />
              <span className="min-w-0 text-sm">
                <span className="block font-semibold text-ink">{b.name}</span>
                <span className="mt-0.5 flex items-center gap-1.5 text-ink-soft">
                  <CalendarDays className="size-3.5 shrink-0" />
                  {b.schedule} · starts {b.starts}
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-soft">
                  {b.online ? <Video className="size-3.5" /> : <MapPin className="size-3.5" />}
                  {b.mode} · {full ? "Full" : `${b.seatsLeft} seat${b.seatsLeft === 1 ? "" : "s"} left`}
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>

      <div className="mt-3">
        <JoinButton disabled={!batchId} />
      </div>
    </form>
  );
}
