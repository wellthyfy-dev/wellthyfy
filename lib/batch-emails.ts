import { BATCH_MODE_LABELS, formatSlot, isOnline, mapsLink, type BatchMode } from "./batches";
import { GOLD, GREEN, INK, NAVY, SOFT, escapeHtml, row, shell } from "./email-templates";

const button = (href: string, label: string, bg = GREEN) =>
  `<a href="${escapeHtml(href)}" style="display:inline-block;background:${bg};color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:999px;">${label}</a>`;

const para = (html: string) =>
  `<p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:${SOFT};">${html}</p>`;

const firstName = (name: string | null) => escapeHtml((name ?? "").split(" ")[0] || "there");

export type ClassMailData = {
  studentName: string | null;
  courseTitle: string;
  batchName: string;
  mode: BatchMode;
  venue: string | null;
  seq: number;
  startsAt: string;
  endsAt: string;
};

function classTable(c: ClassMailData) {
  return `
    <tr><td style="padding:8px 28px 4px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${row("Course", escapeHtml(c.courseTitle))}
        ${row("Batch", escapeHtml(c.batchName))}
        ${row("Class", `Session ${c.seq}`)}
        ${row("When", escapeHtml(formatSlot(c.startsAt, c.endsAt)))}
        ${row("Mode", escapeHtml(BATCH_MODE_LABELS[c.mode]))}
        ${c.venue ? row("Venue", `<a href="${escapeHtml(mapsLink(c.venue))}" style="color:${NAVY};">${escapeHtml(c.venue)}</a>`) : ""}
      </table>
    </td></tr>`;
}

function classText(c: ClassMailData) {
  return [
    `Course: ${c.courseTitle}`,
    `Batch: ${c.batchName}`,
    `Class: Session ${c.seq}`,
    `When: ${formatSlot(c.startsAt, c.endsAt)}`,
    `Mode: ${BATCH_MODE_LABELS[c.mode]}`,
    ...(c.venue ? [`Venue: ${c.venue}`] : []),
  ].join("\n");
}

/** Sent the day before, and again just before, each class. */
export function classReminderEmail(c: ClassMailData, kind: "day" | "soon", origin: string) {
  const classes = `${origin}/dashboard/student#classes`;
  const online = isOnline(c.mode);
  const soon = kind === "soon";
  const headline = soon
    ? `Your class starts soon, ${firstName(c.studentName)}`
    : `Reminder: class tomorrow, ${firstName(c.studentName)}`;
  const action = online
    ? soon
      ? "Open My classes and press <strong>Join class</strong>. Please join a couple of minutes early with your camera and microphone ready."
      : "The <strong>Join class</strong> button appears in My classes 15 minutes before the start."
    : "Please reach the institute a few minutes early.";

  const inner = `
    <tr><td style="padding:30px 28px 6px;">
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:${soon ? GOLD : GREEN};font-weight:700;">${soon ? "Starting soon" : "Class reminder"}</p>
      <h1 style="margin:0 0 14px;font-size:24px;line-height:1.3;color:${INK};">${headline}</h1>
    </td></tr>
    ${classTable(c)}
    <tr><td style="padding:20px 28px 26px;">
      ${para(action)}
      ${button(classes, online ? "Go to My classes" : "View my timetable")}
    </td></tr>`;

  return {
    subject: soon
      ? `Starting soon — ${c.courseTitle}, session ${c.seq}`
      : `Tomorrow — ${c.courseTitle}, session ${c.seq}`,
    html: shell(inner),
    text: `${soon ? "Your class starts soon." : "Reminder: you have a class coming up."}\n\n${classText(c)}\n\nMy classes: ${classes}\n`,
  };
}

/** Sent to every verified student when a class is moved or cancelled. */
export function classChangedEmail(
  c: ClassMailData,
  change: { kind: "moved"; previousStartsAt: string; previousEndsAt: string } | { kind: "cancelled" } | { kind: "restored" },
  origin: string,
) {
  const classes = `${origin}/dashboard/student#classes`;
  const title =
    change.kind === "moved"
      ? `Session ${c.seq} has a new time`
      : change.kind === "cancelled"
        ? `Session ${c.seq} is cancelled`
        : `Session ${c.seq} is back on`;
  const body =
    change.kind === "moved"
      ? `It was planned for ${escapeHtml(formatSlot(change.previousStartsAt, change.previousEndsAt))}. The new time is below.`
      : change.kind === "cancelled"
        ? "This class will not take place. Your faculty will share any make-up class in your timetable."
        : "This class is going ahead as shown below.";

  const inner = `
    <tr><td style="padding:30px 28px 6px;">
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:${change.kind === "cancelled" ? "#B42318" : GOLD};font-weight:700;">Timetable update</p>
      <h1 style="margin:0 0 14px;font-size:24px;line-height:1.3;color:${INK};">${title}</h1>
      ${para(`Hi ${firstName(c.studentName)}, ${body}`)}
    </td></tr>
    ${classTable(c)}
    <tr><td style="padding:20px 28px 26px;">${button(classes, "See my timetable", NAVY)}</td></tr>`;

  return {
    subject: `${title} — ${c.courseTitle}`,
    html: shell(inner),
    text:
      `${title}.\n\n` +
      (change.kind === "moved"
        ? `Previously: ${formatSlot(change.previousStartsAt, change.previousEndsAt)}\n`
        : "") +
      `${classText(c)}\n\nMy classes: ${classes}\n`,
  };
}
