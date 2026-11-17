"use client";

import { Clock, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { JOIN_OPENS_MIN } from "@/lib/batches";

function until(ms: number) {
  const mins = Math.max(0, Math.round(ms / 60_000));
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours} h ${mins % 60} min`;
  return `${Math.floor(hours / 24)} days`;
}

/**
 * Join button for one class. It counts down until the room opens
 * (15 minutes before the start) and stays usable until the class ends.
 */
export default function JoinClassButton({
  sessionId,
  startsAt,
  endsAt,
}: {
  sessionId: string;
  startsAt: string;
  endsAt: string;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 20_000);
    return () => clearInterval(t);
  }, []);

  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  const opens = start - JOIN_OPENS_MIN * 60_000;

  if (now !== null && now > end) {
    return <span className="text-xs font-semibold text-ink-soft">Class ended</span>;
  }

  if (now !== null && now >= opens) {
    return (
      <a
        href={`/classes/${sessionId}/join`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-well-600 to-well-700 px-5 py-2.5 text-sm font-semibold text-white shadow-glow-green transition-transform hover:-translate-y-0.5"
      >
        <PlayCircle className="size-4.5" />
        {now >= start ? "Join class — live now" : "Join class"}
      </a>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-navy-900/10 bg-white px-4 py-2 text-xs font-semibold text-ink-soft">
      <Clock className="size-3.5" />
      {now === null ? "Join opens 15 min before" : `Starts in ${until(start - now)}`}
    </span>
  );
}
