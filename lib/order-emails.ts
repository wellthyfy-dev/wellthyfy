import { GOLD, GREEN, INK, NAVY, SOFT, escapeHtml, row, shell } from "./email-templates";
import { BATCH_MODE_LABELS, formatStartDate, mapsLink, scheduleSummary, type Batch } from "./batches";
import { formatINR } from "./platform";
import { siteConfig } from "./site";

const button = (href: string, label: string, bg = GREEN) =>
  `<a href="${escapeHtml(href)}" style="display:inline-block;background:${bg};color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:999px;">${label}</a>`;

const para = (html: string) =>
  `<p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:${SOFT};">${html}</p>`;

const eyebrow = (text: string, color = GREEN) =>
  `<p style="margin:0 0 8px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:${color};font-weight:700;">${text}</p>`;

const heading = (html: string) =>
  `<h1 style="margin:0 0 14px;font-size:24px;line-height:1.3;color:${INK};">${html}</h1>`;

const firstName = (name: string | null) => escapeHtml((name ?? "").split(" ")[0] || "there");

const amount = (inr: number) => (inr === 0 ? "Free" : formatINR(inr));

export type OrderMailData = {
  id: string;
  course_title: string;
  amount_inr: number;
  utr: string | null;
  payer_note?: string | null;
  student_name: string | null;
  student_email: string | null;
  student_whatsapp: string | null;
  /** The live batch the student chose, if the course runs in batches. */
  batch?: Pick<Batch, "name" | "mode" | "start_date" | "days" | "start_time" | "duration_min" | "venue"> | null;
};

const batchRows = (b: OrderMailData["batch"]) =>
  b
    ? `${row("Batch", escapeHtml(b.name))}
        ${row("Timetable", escapeHtml(`${scheduleSummary(b)}`))}
        ${row("Starts", escapeHtml(formatStartDate(b.start_date)))}
        ${row("Mode", escapeHtml(BATCH_MODE_LABELS[b.mode]))}
        ${b.venue ? row("Venue", `<a href="${escapeHtml(mapsLink(b.venue))}" style="color:${NAVY};">${escapeHtml(b.venue)}</a>`) : ""}`
    : "";

const batchText = (b: OrderMailData["batch"]) =>
  b
    ? [
        `Batch: ${b.name}`,
        `Timetable: ${scheduleSummary(b)}`,
        `Starts: ${formatStartDate(b.start_date)}`,
        `Mode: ${BATCH_MODE_LABELS[b.mode]}`,
        ...(b.venue ? [`Venue: ${b.venue}`] : []),
        "",
      ].join("\n")
    : "";

function details(o: OrderMailData) {
  return `
    <tr><td style="padding:8px 28px 4px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${row("Course", escapeHtml(o.course_title))}
        ${batchRows(o.batch)}
        ${row("Amount", escapeHtml(amount(o.amount_inr)))}
        ${o.utr ? row("UTR / reference", `<span style="font-family:monospace;">${escapeHtml(o.utr)}</span>`) : ""}
      </table>
    </td></tr>`;
}

// ── When a student submits a payment ─────────────────────────────────────────

/** To the Wellthyfy team: a payment is waiting to be checked. */
export function newEnrollmentAdminEmail(o: OrderMailData, origin: string) {
  const link = `${origin}/admin/payments`;
  const inner = `
    <tr><td style="padding:28px 28px 8px;">
      ${eyebrow("Payment to verify", GOLD)}
      <h1 style="margin:0;font-size:22px;line-height:1.3;color:${INK};">${escapeHtml(o.student_name ?? "A student")} enrolled in ${escapeHtml(o.course_title)}</h1>
    </td></tr>
    <tr><td style="padding:12px 28px 4px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${row("Student", escapeHtml(o.student_name ?? "—"))}
        ${row("Email", o.student_email ? `<a href="mailto:${escapeHtml(o.student_email)}" style="color:${NAVY};">${escapeHtml(o.student_email)}</a>` : "—")}
        ${row("WhatsApp", escapeHtml(o.student_whatsapp ?? "—"))}
        ${row("Course", escapeHtml(o.course_title))}
        ${o.batch ? row("Batch", escapeHtml(`${o.batch.name} · ${scheduleSummary(o.batch)}`)) : ""}
        ${row("Amount", escapeHtml(amount(o.amount_inr)))}
        ${row("UTR / reference", `<span style="font-family:monospace;">${escapeHtml(o.utr ?? "—")}</span>`)}
        ${o.payer_note ? row("Note", escapeHtml(o.payer_note)) : ""}
      </table>
    </td></tr>
    <tr><td style="padding:22px 28px 26px;">
      ${para("Check the UTR against your UPI account, then verify or reject it in the admin panel.")}
      ${button(link, "Open payments")}
    </td></tr>`;
  return {
    subject: `Payment to verify — ${o.student_name ?? "Student"} · ${o.course_title}`,
    html: shell(inner),
    text:
      `Payment to verify\n\n${o.student_name ?? "A student"} (${o.student_email ?? "—"}, WhatsApp ${o.student_whatsapp ?? "—"})\n` +
      `Course: ${o.course_title}\n` +
      batchText(o.batch) +
      `Amount: ${amount(o.amount_inr)}\nUTR: ${o.utr ?? "—"}\n` +
      (o.payer_note ? `Note: ${o.payer_note}\n` : "") +
      `\nVerify it: ${link}\n`,
  };
}

/** To the Wellthyfy team: a student paid through Razorpay and is enrolled. */
export function razorpayPaidAdminEmail(o: OrderMailData, origin: string) {
  const link = `${origin}/admin/payments`;
  const inner = `
    <tr><td style="padding:28px 28px 8px;">
      ${eyebrow("Paid online")}
      <h1 style="margin:0;font-size:22px;line-height:1.3;color:${INK};">${escapeHtml(o.student_name ?? "A student")} enrolled in ${escapeHtml(o.course_title)}</h1>
    </td></tr>
    <tr><td style="padding:12px 28px 4px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${row("Student", escapeHtml(o.student_name ?? "—"))}
        ${row("Email", o.student_email ? `<a href="mailto:${escapeHtml(o.student_email)}" style="color:${NAVY};">${escapeHtml(o.student_email)}</a>` : "—")}
        ${row("WhatsApp", escapeHtml(o.student_whatsapp ?? "—"))}
        ${row("Course", escapeHtml(o.course_title))}
        ${o.batch ? row("Batch", escapeHtml(`${o.batch.name} · ${scheduleSummary(o.batch)}`)) : ""}
        ${row("Amount", escapeHtml(amount(o.amount_inr)))}
        ${row("Razorpay payment", `<span style="font-family:monospace;">${escapeHtml(o.utr ?? "—")}</span>`)}
      </table>
    </td></tr>
    <tr><td style="padding:22px 28px 26px;">
      ${para("The payment was confirmed by Razorpay and the enrolment is already verified. Nothing to do.")}
      ${button(link, "Open payments")}
    </td></tr>`;
  return {
    subject: `Paid online — ${o.student_name ?? "Student"} · ${o.course_title}`,
    html: shell(inner),
    text:
      `Paid online (Razorpay)\n\n${o.student_name ?? "A student"} (${o.student_email ?? "—"}, WhatsApp ${o.student_whatsapp ?? "—"})\n` +
      `Course: ${o.course_title}\n` +
      batchText(o.batch) +
      `Amount: ${amount(o.amount_inr)}\nPayment: ${o.utr ?? "—"}\n\nPayments: ${link}\n`,
  };
}

/** To the Wellthyfy team: a Razorpay payment couldn't become an enrolment. */
export function razorpayRefundedAdminEmail(
  r: {
    paymentId: string;
    orderId: string;
    reason: string;
    refunded: boolean;
    /** Refund id when refunded, otherwise Razorpay's error. */
    detail: string;
    courseTitle: string;
  },
  origin: string,
) {
  const link = `${origin}/admin/payments`;
  const title = r.refunded ? "Payment refunded automatically" : "Refund needed — automatic refund failed";
  const inner = `
    <tr><td style="padding:28px 28px 8px;">
      ${eyebrow(r.refunded ? "Refunded" : "Action needed", r.refunded ? GREEN : GOLD)}
      <h1 style="margin:0;font-size:22px;line-height:1.3;color:${INK};">${escapeHtml(title)}</h1>
    </td></tr>
    <tr><td style="padding:12px 28px 4px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${row("Course", escapeHtml(r.courseTitle || "—"))}
        ${row("Why", escapeHtml(r.reason))}
        ${row("Razorpay payment", `<span style="font-family:monospace;">${escapeHtml(r.paymentId)}</span>`)}
        ${row("Razorpay order", `<span style="font-family:monospace;">${escapeHtml(r.orderId)}</span>`)}
        ${row(r.refunded ? "Refund" : "Error", `<span style="font-family:monospace;">${escapeHtml(r.detail)}</span>`)}
      </table>
    </td></tr>
    <tr><td style="padding:22px 28px 26px;">
      ${para(
        r.refunded
          ? "The student paid but couldn't be enrolled, so the full amount was refunded. No enrolment was created. You may want to offer them another batch."
          : "The student paid but couldn't be enrolled, and the automatic refund failed. Refund this payment from the Razorpay dashboard.",
      )}
      ${button(link, "Open payments")}
    </td></tr>`;
  return {
    subject: `${title} — ${r.paymentId}`,
    html: shell(inner),
    text:
      `${title}\n\nCourse: ${r.courseTitle || "—"}\nWhy: ${r.reason}\nPayment: ${r.paymentId}\nOrder: ${r.orderId}\n` +
      `${r.refunded ? "Refund" : "Error"}: ${r.detail}\n\n` +
      (r.refunded ? "" : "Refund it from the Razorpay dashboard.\n") +
      `Payments: ${link}\n`,
  };
}

/** To the student: we have your payment details. */
export function enrollmentReceivedEmail(o: OrderMailData, origin: string) {
  const dashboard = `${origin}/dashboard/student`;
  const inner = `
    <tr><td style="padding:30px 28px 6px;">
      ${eyebrow("Enrolment received")}
      ${heading(`Thank you, ${firstName(o.student_name)} — we have your payment details.`)}
      ${para(`We received your enrolment for <strong style="color:${INK};">${escapeHtml(o.course_title)}</strong>. Our team will check your payment and email you as soon as it is verified.${o.batch ? " Your seat in the batch is held meanwhile." : ""}`)}
    </td></tr>
    ${details(o)}
    <tr><td style="padding:20px 28px 26px;">
      ${para("You can follow the status any time from your dashboard.")}
      ${button(dashboard, "View my learning")}
    </td></tr>`;
  return {
    subject: `We received your enrolment — ${o.course_title}`,
    html: shell(inner),
    text:
      `Thank you, ${o.student_name ?? ""}.\n\nWe received your enrolment for ${o.course_title}.\n` +
      batchText(o.batch) +
      `Amount: ${amount(o.amount_inr)}\nUTR: ${o.utr ?? "—"}\n\n` +
      `Our team will check your payment and email you once it is verified.\nYour dashboard: ${dashboard}\n`,
  };
}

// ── When the payment is decided ──────────────────────────────────────────────

/** To the student: payment verified, you are enrolled. */
export function paymentVerifiedEmail(o: OrderMailData, origin: string, courseUrl: string | null) {
  const dashboard = `${origin}/dashboard/student`;
  const inner = `
    <tr><td style="padding:30px 28px 6px;">
      ${eyebrow("Payment verified")}
      ${heading(`You're enrolled, ${firstName(o.student_name)}!`)}
      ${para(`Your payment for <strong style="color:${INK};">${escapeHtml(o.course_title)}</strong> has been verified. Welcome aboard.`)}
    </td></tr>
    ${details(o)}
    <tr><td style="padding:20px 28px 26px;">
      ${para(
        o.batch
          ? `Your classes are now in <strong style="color:${INK};">My classes</strong> on your dashboard${o.batch.mode === "offline" ? "" : ", with a Join button that opens 15 minutes before each class"}. We'll also email you a reminder the day before and just before each class, and every recording is added there as a recap.`
          : "Our team will be in touch with your class details. If you have any questions, simply reply to this email.",
      )}
      <p style="margin:0;">${button(dashboard, o.batch ? "See my classes" : "Go to my learning")}${courseUrl ? `&nbsp;&nbsp;${button(courseUrl, "View course", NAVY)}` : ""}</p>
    </td></tr>`;
  return {
    subject: `You're enrolled — ${o.course_title}`,
    html: shell(inner),
    text:
      `You're enrolled, ${o.student_name ?? ""}!\n\nYour payment for ${o.course_title} has been verified.\n` +
      batchText(o.batch) +
      (o.batch
        ? `Your timetable, join links and recordings are in My classes on your dashboard.\n`
        : `Our team will be in touch with your class details.\n`) +
      `\nYour dashboard: ${dashboard}\n` +
      (courseUrl ? `Course: ${courseUrl}\n` : ""),
  };
}

/** To the student: the payment could not be verified. */
export function paymentRejectedEmail(o: OrderMailData, origin: string) {
  const contact = `${origin}/contact`;
  const inner = `
    <tr><td style="padding:30px 28px 6px;">
      ${eyebrow("Payment not verified", "#B42318")}
      ${heading(`We couldn't verify your payment, ${firstName(o.student_name)}.`)}
      ${para(`We were not able to match your payment for <strong style="color:${INK};">${escapeHtml(o.course_title)}</strong> with the UTR you entered.`)}
    </td></tr>
    ${details(o)}
    <tr><td style="padding:20px 28px 26px;">
      ${para(`Please check the UTR / reference number in your UPI app. If money was debited, reply to this email with a screenshot of the payment, or call us on ${escapeHtml(siteConfig.phone)} — we'll sort it out.`)}
      ${button(contact, "Contact us", NAVY)}
    </td></tr>`;
  return {
    subject: `We couldn't verify your payment — ${o.course_title}`,
    html: shell(inner),
    text:
      `We couldn't verify your payment, ${o.student_name ?? ""}.\n\nCourse: ${o.course_title}\nUTR: ${o.utr ?? "—"}\n\n` +
      `Please check the UTR in your UPI app. If money was debited, reply with a screenshot or call ${siteConfig.phone}.\n${contact}\n`,
  };
}

/** To the course's faculty: a new student is confirmed. */
export function newStudentFacultyEmail(
  o: OrderMailData,
  facultyName: string | null,
  origin: string,
) {
  const dashboard = `${origin}/dashboard/faculty`;
  const inner = `
    <tr><td style="padding:30px 28px 6px;">
      ${eyebrow("New student")}
      ${heading(`${escapeHtml(o.student_name ?? "A new student")} joined ${escapeHtml(o.course_title)}`)}
      ${para(`Hi ${firstName(facultyName)}, a student's payment has been verified and they are now enrolled in your course.`)}
    </td></tr>
    <tr><td style="padding:8px 28px 4px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${row("Student", escapeHtml(o.student_name ?? "—"))}
        ${row("Email", escapeHtml(o.student_email ?? "—"))}
        ${row("WhatsApp", escapeHtml(o.student_whatsapp ?? "—"))}
        ${o.batch ? row("Batch", escapeHtml(o.batch.name)) : ""}
      </table>
    </td></tr>
    <tr><td style="padding:20px 28px 26px;">${button(dashboard, "See your students")}</td></tr>`;
  return {
    subject: `New student — ${o.course_title}`,
    html: shell(inner),
    text:
      `${o.student_name ?? "A new student"} joined ${o.course_title}.\n` +
      `Email: ${o.student_email ?? "—"} · WhatsApp: ${o.student_whatsapp ?? "—"}\n\nYour students: ${dashboard}\n`,
  };
}
