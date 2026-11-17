/**
 * Live-class batches: a group of students on one timetable for a course.
 * All times are shown and entered in India Standard Time.
 */

export type BatchMode = "online" | "offline" | "hybrid";
export type BatchStatus = "open" | "closed" | "cancelled" | "completed";
export type SessionStatus = "scheduled" | "cancelled";

export type Batch = {
  id: string;
  course_id: string;
  faculty_id: string;
  name: string;
  mode: BatchMode;
  start_date: string;
  /** ISO weekdays, 1 = Monday … 7 = Sunday. */
  days: number[];
  /** "HH:MM:SS" in IST. */
  start_time: string;
  duration_min: number;
  session_count: number;
  seats: number;
  venue: string | null;
  status: BatchStatus;
  created_at: string;
};

export type BatchSession = {
  id: string;
  batch_id: string;
  seq: number;
  starts_at: string;
  ends_at: string;
  status: SessionStatus;
};

export const DEFAULT_SEATS = 20;
export const TIME_ZONE = "Asia/Kolkata";
/** The Join / Start button opens this many minutes before a class. */
export const JOIN_OPENS_MIN = 15;

export const BATCH_MODE_LABELS: Record<BatchMode, string> = {
  online: "Online (live)",
  offline: "At the institute",
  hybrid: "Hybrid (institute + online)",
};

export const BATCH_STATUS_LABELS: Record<BatchStatus, string> = {
  open: "Open for enrolment",
  closed: "Enrolment closed",
  cancelled: "Cancelled",
  completed: "Completed",
};

export const BATCH_STATUS_TONE: Record<BatchStatus, string> = {
  open: "bg-well-50 text-well-800 border-well-200",
  closed: "bg-navy-50 text-navy-800 border-navy-200",
  cancelled: "bg-red-50 text-red-800 border-red-200",
  completed: "bg-navy-50 text-ink-soft border-navy-900/10",
};

export const WEEKDAYS = [
  { value: 1, short: "Mon", long: "Monday" },
  { value: 2, short: "Tue", long: "Tuesday" },
  { value: 3, short: "Wed", long: "Wednesday" },
  { value: 4, short: "Thu", long: "Thursday" },
  { value: 5, short: "Fri", long: "Friday" },
  { value: 6, short: "Sat", long: "Saturday" },
  { value: 7, short: "Sun", long: "Sunday" },
] as const;

/** Which batch modes a course's delivery mode allows. */
export function modesForCourse(courseMode: string): BatchMode[] {
  if (courseMode === "online_live") return ["online"];
  if (courseMode === "offline") return ["offline"];
  if (courseMode === "hybrid") return ["hybrid", "online", "offline"];
  return [];
}

export const isOnline = (mode: BatchMode) => mode === "online" || mode === "hybrid";
export const needsVenue = (mode: BatchMode) => mode === "offline" || mode === "hybrid";

// ── Formatting (always IST, whatever the server's clock) ─────────────────────

const fmt = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: TIME_ZONE, ...opts });

const dateFmt = fmt({ weekday: "short", day: "numeric", month: "short", year: "numeric" });
const shortDateFmt = fmt({ weekday: "short", day: "numeric", month: "short" });
const timeFmt = fmt({ hour: "numeric", minute: "2-digit", hour12: true });

export const formatDate = (iso: string) => dateFmt.format(new Date(iso));
export const formatShortDate = (iso: string) => shortDateFmt.format(new Date(iso));
export const formatTime = (iso: string) => timeFmt.format(new Date(iso)).toUpperCase();

/** "Fri, 20 Nov · 7:00 AM – 8:00 AM IST" */
export function formatSlot(startsAt: string, endsAt: string) {
  return `${formatShortDate(startsAt)} · ${formatTime(startsAt)} – ${formatTime(endsAt)} IST`;
}

/** "07:00:00" → "7:00 AM" */
export function formatClock(time: string) {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** "Mon, Wed & Fri · 7:00 AM · 60 min" */
export function scheduleSummary(b: Pick<Batch, "days" | "start_time" | "duration_min">) {
  const names = [...b.days].sort().map((d) => WEEKDAYS[d - 1]?.short ?? "");
  const days =
    names.length === 7
      ? "Every day"
      : names.length > 1
        ? `${names.slice(0, -1).join(", ")} & ${names.at(-1)}`
        : names[0];
  return `${days} · ${formatClock(b.start_time)} IST · ${b.duration_min} min`;
}

/** "Starts Fri, 20 Nov 2026" from a plain date. */
export function formatStartDate(date: string) {
  return dateFmt.format(new Date(`${date}T12:00:00+05:30`));
}

/** A `datetime-local` value (entered in IST) as an ISO timestamp. */
export function istLocalToIso(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const d = new Date(`${value}:00+05:30`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** An ISO timestamp as a `datetime-local` value in IST. */
export function isoToIstLocal(iso: string) {
  const parts = Object.fromEntries(
    fmt({
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date(iso))
      .map((p) => [p.type, p.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

/** Where a session stands relative to `now`. */
export function sessionPhase(s: Pick<BatchSession, "starts_at" | "ends_at" | "status">, now = Date.now()) {
  if (s.status === "cancelled") return "cancelled" as const;
  const start = new Date(s.starts_at).getTime();
  const end = new Date(s.ends_at).getTime();
  if (now >= end) return "past" as const;
  if (now >= start - JOIN_OPENS_MIN * 60_000) return "joinable" as const;
  return "upcoming" as const;
}

export function mapsLink(venue: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue)}`;
}
