import { GOLD, GREEN, INK, NAVY, SOFT, escapeHtml, row, shell } from "./email-templates";
import { idSummary, type FacultyApplication } from "./faculty";
import { CATEGORY_META, MODE_LABELS, formatINR, type Course } from "./platform";
import { siteConfig } from "./site";

const button = (href: string, label: string, bg = GREEN) =>
  `<a href="${escapeHtml(href)}" style="display:inline-block;background:${bg};color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:999px;">${label}</a>`;

const para = (html: string) =>
  `<p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:${SOFT};">${html}</p>`;

const eyebrow = (text: string) =>
  `<p style="margin:0 0 8px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:${GREEN};font-weight:700;">${text}</p>`;

const heading = (html: string) =>
  `<h1 style="margin:0 0 14px;font-size:24px;line-height:1.3;color:${INK};">${html}</h1>`;

const firstName = (name: string) => escapeHtml(name.split(" ")[0] || name);

type App = Pick<
  FacultyApplication,
  "id" | "full_name" | "contact_email" | "phone" | "qualification" | "id_type" | "pan_path"
>;

// ── Stage 1: the application ─────────────────────────────────────────────────

/** To the Wellthyfy team: a new application is waiting. */
export function newApplicationEmail(a: App, origin: string) {
  const link = `${origin}/admin/applications/${a.id}`;
  const inner = `
    <tr><td style="padding:28px 28px 8px;">
      ${eyebrow("New faculty application")}
      <h1 style="margin:0;font-size:22px;line-height:1.3;color:${INK};">${escapeHtml(a.full_name)} wants to teach on Wellthyfy</h1>
    </td></tr>
    <tr><td style="padding:12px 28px 4px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${row("Applicant", escapeHtml(a.full_name))}
        ${row("Contact", `<a href="mailto:${escapeHtml(a.contact_email)}" style="color:${NAVY};">${escapeHtml(a.contact_email)}</a> · ${escapeHtml(a.phone)}`)}
        ${row("Qualification", escapeHtml(a.qualification ?? "—"))}
        ${row("Verification", escapeHtml(idSummary(a)))}
      </table>
    </td></tr>
    <tr><td style="padding:22px 28px 26px;">${button(link, "Review application")}</td></tr>`;

  return {
    subject: `New faculty application — ${a.full_name}`,
    html: shell(inner),
    text:
      `New faculty application\n\n${a.full_name} (${a.contact_email}, ${a.phone})\n` +
      `Qualification: ${a.qualification ?? "—"}\n\nReview it: ${link}\n`,
  };
}

/** To the applicant: we have it. */
export function applicationReceivedEmail(a: Pick<App, "full_name">) {
  const inner = `
    <tr><td style="padding:30px 28px 10px;">
      ${eyebrow("Wellthyfy Faculty")}
      ${heading(`Thank you, ${firstName(a.full_name)} — we have your application.`)}
      ${para("Our team will review your details, qualification and ID.")}
      ${para("There is nothing more you need to do right now. We will email you at this address as soon as there is a decision.")}
    </td></tr>
    <tr><td style="padding:6px 28px 26px;">${button(siteConfig.url, "Visit wellthyfy.in", GOLD)}</td></tr>`;
  return {
    subject: "We received your faculty application — Wellthyfy",
    html: shell(inner),
    text: `Thank you, ${a.full_name}.\n\nWe received your faculty application and will email you as soon as there is a decision.\n\n${siteConfig.url}\n`,
  };
}

/** To the applicant: approved, with the private join link and the new mail id. */
export function applicationApprovedEmail({
  fullName,
  facultyEmail,
  joinUrl,
  loginUrl,
  note,
}: {
  fullName: string;
  facultyEmail: string;
  joinUrl: string;
  loginUrl: string;
  note?: string | null;
}) {
  const inner = `
    <tr><td style="padding:30px 28px 10px;">
      ${eyebrow("You are approved")}
      ${heading(`Welcome to the faculty, ${firstName(fullName)}.`)}
      ${para("Your application has been approved. Here is your Wellthyfy faculty mail id — you will use it to sign in.")}
      ${note ? para(`<em>${escapeHtml(note)}</em>`) : ""}
    </td></tr>
    <tr><td style="padding:8px 28px 4px;">
      <div style="background:#f5f9f7;border:1px solid #dcebe2;border-radius:14px;padding:18px 20px;">
        <p style="margin:0 0 4px;font-size:12px;color:${SOFT};">Your Wellthyfy faculty mail id</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:${NAVY};word-break:break-all;">${escapeHtml(facultyEmail)}</p>
      </div>
    </td></tr>
    <tr><td style="padding:18px 28px 4px;">
      ${para("<strong>Next steps</strong>")}
      ${para(`1. Create your faculty account <strong>using that mail id</strong>. The confirmation email arrives in that mailbox, so make sure you can open it first.<br>2. From your faculty dashboard, create your course — details, banner, modules PDF and fee.<br>3. Submit it for review. Once our team approves it, it goes live on wellthyfy.in.`)}
      <p style="margin:0 0 6px;">${button(joinUrl, "Create my faculty account")}</p>
      ${para(`<span style="font-size:13px;">This link is private to you and works once — please do not share it. If it ever stops working, reply to this email.</span>`)}
    </td></tr>
    <tr><td style="padding:6px 28px 26px;">
      ${para(`Already created your account? <a href="${escapeHtml(loginUrl)}" style="color:${NAVY};font-weight:600;">Faculty sign in</a>`)}
    </td></tr>`;
  return {
    subject: "You are approved — welcome to the Wellthyfy faculty",
    html: shell(inner),
    text:
      `Welcome to the faculty, ${fullName}.\n\n` +
      `Your Wellthyfy faculty mail id: ${facultyEmail}\n\n` +
      `1. Create your faculty account with that mail id (private link, works once):\n${joinUrl}\n` +
      `2. Create your course from your faculty dashboard.\n` +
      `3. Submit it for review. Once approved, it goes live on wellthyfy.in.\n\n` +
      `Faculty sign in: ${loginUrl}\n` +
      (note ? `\nNote from the team: ${note}\n` : ""),
  };
}

/** To the applicant: not this time. */
export function applicationRejectedEmail({
  fullName,
  note,
}: {
  fullName: string;
  note?: string | null;
}) {
  const inner = `
    <tr><td style="padding:30px 28px 22px;">
      ${eyebrow("Wellthyfy Faculty")}
      ${heading(`Thank you for applying, ${firstName(fullName)}.`)}
      ${para("After review, we are not able to take your faculty application forward at this time.")}
      ${note ? para(`<strong style="color:${INK};">From our team:</strong> ${escapeHtml(note)}`) : ""}
      ${para("You are welcome to apply again in future. If you have questions, simply reply to this email.")}
    </td></tr>`;
  return {
    subject: "Your Wellthyfy faculty application",
    html: shell(inner),
    text:
      `Thank you for applying, ${fullName}.\n\nAfter review, we are not able to take your faculty application forward at this time.\n` +
      (note ? `\nFrom our team: ${note}\n` : "") +
      `\nYou are welcome to apply again in future.\n`,
  };
}

// ── Stage 2: each course ─────────────────────────────────────────────────────

type CourseLite = Pick<
  Course,
  "id" | "title" | "faculty_name" | "category" | "subcategory" | "mode" | "price_inr"
>;

/** To the Wellthyfy team: a faculty member submitted a course for review. */
export function courseSubmittedEmail(c: CourseLite, origin: string, facultyEmail: string) {
  const link = `${origin}/admin/courses/${c.id}`;
  const inner = `
    <tr><td style="padding:28px 28px 8px;">
      ${eyebrow("Course awaiting review")}
      <h1 style="margin:0;font-size:22px;line-height:1.3;color:${INK};">${escapeHtml(c.title)}</h1>
    </td></tr>
    <tr><td style="padding:12px 28px 4px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${row("Faculty", `${escapeHtml(c.faculty_name ?? "—")} · <a href="mailto:${escapeHtml(facultyEmail)}" style="color:${NAVY};">${escapeHtml(facultyEmail)}</a>`)}
        ${row("Category", `${escapeHtml(CATEGORY_META[c.category].label)} · ${escapeHtml(c.subcategory)}`)}
        ${row("Mode", escapeHtml(MODE_LABELS[c.mode]))}
        ${row("Fee", escapeHtml(c.price_inr === 0 ? "Free" : formatINR(c.price_inr)))}
      </table>
    </td></tr>
    <tr><td style="padding:22px 28px 26px;">${button(link, "Review course")}</td></tr>`;
  return {
    subject: `Course to review — ${c.title}`,
    html: shell(inner),
    text: `Course awaiting review: ${c.title}\nFaculty: ${c.faculty_name ?? "—"} (${facultyEmail})\n\nReview it: ${link}\n`,
  };
}

/** To the faculty: their course is live. */
export function courseApprovedEmail({
  fullName,
  title,
  courseUrl,
}: {
  fullName: string;
  title: string;
  courseUrl: string;
}) {
  const inner = `
    <tr><td style="padding:30px 28px 10px;">
      ${eyebrow("Course approved")}
      ${heading(`${escapeHtml(title)} is live, ${firstName(fullName)}.`)}
      ${para("Our team has approved your course. It is now on wellthyfy.in and open for enrolment.")}
    </td></tr>
    <tr><td style="padding:6px 28px 26px;">${button(courseUrl, "View your course")}</td></tr>`;
  return {
    subject: `Approved — ${title} is live on Wellthyfy`,
    html: shell(inner),
    text: `${title} is live, ${fullName}.\n\nOur team has approved your course. View it: ${courseUrl}\n`,
  };
}

/** To the faculty: changes needed before it can go live. */
export function courseRejectedEmail({
  fullName,
  title,
  note,
  dashboardUrl,
}: {
  fullName: string;
  title: string;
  note?: string | null;
  dashboardUrl: string;
}) {
  const inner = `
    <tr><td style="padding:30px 28px 10px;">
      ${eyebrow("Changes requested")}
      ${heading(`${escapeHtml(title)} needs a few changes.`)}
      ${para(`Hi ${firstName(fullName)}, our team reviewed your course and it is not ready to go live yet.`)}
      ${note ? para(`<strong style="color:${INK};">From our team:</strong> ${escapeHtml(note)}`) : ""}
      ${para("Edit the course from your dashboard and submit it again — we will review it straight away.")}
    </td></tr>
    <tr><td style="padding:6px 28px 26px;">${button(dashboardUrl, "Open my dashboard")}</td></tr>`;
  return {
    subject: `Changes requested — ${title}`,
    html: shell(inner),
    text:
      `Hi ${fullName}, our team reviewed "${title}" and it is not ready to go live yet.\n` +
      (note ? `\nFrom our team: ${note}\n` : "") +
      `\nEdit it and submit again: ${dashboardUrl}\n`,
  };
}
