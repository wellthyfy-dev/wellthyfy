import { GOLD, GREEN, INK, NAVY, SOFT, escapeHtml, row, shell } from "./email-templates";
import { ID_TYPE_LABELS, type FacultyApplication } from "./faculty";
import { CATEGORY_META, MODE_LABELS, formatINR } from "./platform";
import { siteConfig } from "./site";

const button = (href: string, label: string, bg = GREEN) =>
  `<a href="${escapeHtml(href)}" style="display:inline-block;background:${bg};color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:999px;">${label}</a>`;

const para = (html: string) =>
  `<p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:${SOFT};">${html}</p>`;

type App = Pick<
  FacultyApplication,
  | "id"
  | "full_name"
  | "contact_email"
  | "phone"
  | "id_type"
  | "course_title"
  | "category"
  | "subcategory"
  | "mode"
  | "fee_inr"
>;

/** To the Wellthyfy team: a new application is waiting. */
export function newApplicationEmail(a: App, origin: string) {
  const link = `${origin}/admin/applications/${a.id}`;
  const inner = `
    <tr><td style="padding:28px 28px 8px;">
      <p style="margin:0 0 6px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:${GREEN};font-weight:700;">New faculty application</p>
      <h1 style="margin:0;font-size:22px;line-height:1.3;color:${INK};">${escapeHtml(a.full_name)} wants to teach ${escapeHtml(a.course_title)}</h1>
    </td></tr>
    <tr><td style="padding:12px 28px 4px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${row("Applicant", escapeHtml(a.full_name))}
        ${row("Contact", `<a href="mailto:${escapeHtml(a.contact_email)}" style="color:${NAVY};">${escapeHtml(a.contact_email)}</a> · ${escapeHtml(a.phone)}`)}
        ${row("Course", escapeHtml(a.course_title))}
        ${row("Category", `${escapeHtml(CATEGORY_META[a.category].label)} · ${escapeHtml(a.subcategory)}`)}
        ${row("Mode", escapeHtml(MODE_LABELS[a.mode]))}
        ${row("Proposed fee", escapeHtml(formatINR(a.fee_inr)))}
        ${row("Government ID", escapeHtml(ID_TYPE_LABELS[a.id_type]))}
      </table>
    </td></tr>
    <tr><td style="padding:22px 28px 26px;">${button(link, "Review application")}</td></tr>`;

  return {
    subject: `New faculty application — ${a.full_name} · ${a.course_title}`,
    html: shell(inner),
    text:
      `New faculty application\n\n${a.full_name} (${a.contact_email}, ${a.phone})\n` +
      `Course: ${a.course_title}\nFee: ${formatINR(a.fee_inr)}\n\nReview it: ${link}\n`,
  };
}

/** To the applicant: we have it. */
export function applicationReceivedEmail(a: Pick<App, "full_name" | "course_title">) {
  const first = escapeHtml(a.full_name.split(" ")[0] || a.full_name);
  const inner = `
    <tr><td style="padding:30px 28px 10px;">
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:${GREEN};font-weight:700;">Wellthyfy Faculty</p>
      <h1 style="margin:0 0 14px;font-size:24px;line-height:1.3;color:${INK};">Thank you, ${first} — we have your application.</h1>
      ${para(`We received your application to teach <strong style="color:${INK};">${escapeHtml(a.course_title)}</strong>. Our team will review your details, your ID and your course.`)}
      ${para("There is nothing more you need to do right now. We will email you at this address as soon as there is a decision.")}
    </td></tr>
    <tr><td style="padding:6px 28px 26px;">${button(siteConfig.url, "Visit wellthyfy.in", GOLD)}</td></tr>`;
  return {
    subject: "We received your faculty application — Wellthyfy",
    html: shell(inner),
    text: `Thank you, ${a.full_name}.\n\nWe received your application to teach ${a.course_title}. We will email you as soon as there is a decision.\n\n${siteConfig.url}\n`,
  };
}

/** To the applicant: approved, with the private join link and the new mail id. */
export function applicationApprovedEmail({
  fullName,
  courseTitle,
  facultyEmail,
  joinUrl,
  loginUrl,
  courseUrl,
  note,
}: {
  fullName: string;
  courseTitle: string;
  facultyEmail: string;
  joinUrl: string;
  loginUrl: string;
  courseUrl: string;
  note?: string | null;
}) {
  const first = escapeHtml(fullName.split(" ")[0] || fullName);
  const inner = `
    <tr><td style="padding:30px 28px 10px;">
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:${GREEN};font-weight:700;">You are approved</p>
      <h1 style="margin:0 0 14px;font-size:24px;line-height:1.3;color:${INK};">Welcome to the faculty, ${first}.</h1>
      ${para(`Your course <strong style="color:${INK};">${escapeHtml(courseTitle)}</strong> is now live on Wellthyfy and open for enrolment.`)}
      ${note ? para(`<em>${escapeHtml(note)}</em>`) : ""}
    </td></tr>
    <tr><td style="padding:8px 28px 4px;">
      <div style="background:#f5f9f7;border:1px solid #dcebe2;border-radius:14px;padding:18px 20px;">
        <p style="margin:0 0 4px;font-size:12px;color:${SOFT};">Your Wellthyfy faculty mail id</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:${NAVY};word-break:break-all;">${escapeHtml(facultyEmail)}</p>
      </div>
    </td></tr>
    <tr><td style="padding:18px 28px 4px;">
      ${para("To manage your course and see your students, create your faculty account <strong>using that mail id</strong>. The confirmation email will arrive in that mailbox, so make sure you can open it first.")}
      <p style="margin:0 0 6px;">${button(joinUrl, "Create my faculty account")}</p>
      ${para(`<span style="font-size:13px;">This link is private to you and works once — please do not share it. If it ever stops working, reply to this email.</span>`)}
    </td></tr>
    <tr><td style="padding:6px 28px 26px;">
      ${para(`Already created your account? <a href="${escapeHtml(loginUrl)}" style="color:${NAVY};font-weight:600;">Faculty sign in</a> &nbsp;·&nbsp; <a href="${escapeHtml(courseUrl)}" style="color:${NAVY};font-weight:600;">View your live course</a>`)}
    </td></tr>`;
  return {
    subject: `You are approved — ${courseTitle} is live on Wellthyfy`,
    html: shell(inner),
    text:
      `Welcome to the faculty, ${fullName}.\n\nYour course "${courseTitle}" is live: ${courseUrl}\n\n` +
      `Your Wellthyfy faculty mail id: ${facultyEmail}\n\n` +
      `Create your faculty account with that mail id (private link, works once):\n${joinUrl}\n\n` +
      `Faculty sign in: ${loginUrl}\n` +
      (note ? `\nNote from the team: ${note}\n` : ""),
  };
}

/** To the applicant: not this time. */
export function applicationRejectedEmail({
  fullName,
  courseTitle,
  note,
}: {
  fullName: string;
  courseTitle: string;
  note?: string | null;
}) {
  const first = escapeHtml(fullName.split(" ")[0] || fullName);
  const inner = `
    <tr><td style="padding:30px 28px 22px;">
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:${GREEN};font-weight:700;">Wellthyfy Faculty</p>
      <h1 style="margin:0 0 14px;font-size:24px;line-height:1.3;color:${INK};">Thank you for applying, ${first}.</h1>
      ${para(`After review, we are not able to take <strong style="color:${INK};">${escapeHtml(courseTitle)}</strong> forward at this time.`)}
      ${note ? para(`<strong style="color:${INK};">From our team:</strong> ${escapeHtml(note)}`) : ""}
      ${para("You are welcome to apply again with an updated course. If you have questions, simply reply to this email.")}
    </td></tr>`;
  return {
    subject: "Your Wellthyfy faculty application",
    html: shell(inner),
    text:
      `Thank you for applying, ${fullName}.\n\nAfter review, we are not able to take "${courseTitle}" forward at this time.\n` +
      (note ? `\nFrom our team: ${note}\n` : "") +
      `\nYou are welcome to apply again with an updated course.\n`,
  };
}
