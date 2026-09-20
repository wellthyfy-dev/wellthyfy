import { siteConfig } from "./site";

export type Enquiry = {
  name: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
};

/** User input is interpolated into HTML email bodies, so escape it. */
export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const GREEN = "#2E8B57";
const NAVY = "#0A4D9D";
const GOLD = "#D4A017";
const INK = "#0E2233";
const SOFT = "#44576A";

const shell = (inner: string) => `
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px 12px;background:#f1f6f3;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${INK};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 28px rgba(14,34,51,.08);">
    <tr><td style="height:5px;background:linear-gradient(90deg,${GREEN},${NAVY} 60%,${GOLD});font-size:0;line-height:0;">&nbsp;</td></tr>
    ${inner}
    <tr><td style="padding:20px 28px 26px;border-top:1px solid #eaeff2;color:${SOFT};font-size:12px;line-height:1.6;">
      ${siteConfig.legalName}<br>
      ${siteConfig.address.full}<br>
      <a href="tel:${siteConfig.phone.replace(/\s/g, "")}" style="color:${NAVY};text-decoration:none;">${siteConfig.phone}</a>
      &nbsp;·&nbsp;
      <a href="mailto:${siteConfig.email}" style="color:${NAVY};text-decoration:none;">${siteConfig.email}</a>
    </td></tr>
  </table>
</body></html>`;

const row = (label: string, value: string) => `
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #eef3f6;color:${SOFT};font-size:13px;width:34%;vertical-align:top;">${label}</td>
    <td style="padding:10px 0;border-bottom:1px solid #eef3f6;font-size:14px;font-weight:600;color:${INK};">${value}</td>
  </tr>`;

/** Sent to the Wellthyfy inbox — this is the lead. */
export function adminEmail(e: Enquiry) {
  const n = escapeHtml(e.name);
  const inner = `
    <tr><td style="padding:28px 28px 8px;">
      <p style="margin:0 0 6px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:${GREEN};font-weight:700;">New website enquiry</p>
      <h1 style="margin:0;font-size:22px;line-height:1.3;color:${INK};">${n} is interested in ${escapeHtml(e.interest)}</h1>
    </td></tr>
    <tr><td style="padding:12px 28px 4px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${row("Name", n)}
        ${row("Email", `<a href="mailto:${escapeHtml(e.email)}" style="color:${NAVY};">${escapeHtml(e.email)}</a>`)}
        ${row("Phone", `<a href="tel:${escapeHtml(e.phone.replace(/\s/g, ""))}" style="color:${NAVY};">${escapeHtml(e.phone)}</a>`)}
        ${row("Interested in", escapeHtml(e.interest))}
      </table>
    </td></tr>
    ${
      e.message
        ? `<tr><td style="padding:18px 28px 4px;">
            <p style="margin:0 0 8px;color:${SOFT};font-size:13px;">Message</p>
            <div style="background:#f5f9f7;border-left:3px solid ${GREEN};border-radius:8px;padding:14px 16px;font-size:14px;line-height:1.65;white-space:pre-wrap;">${escapeHtml(e.message)}</div>
          </td></tr>`
        : ""
    }
    <tr><td style="padding:22px 28px 26px;">
      <a href="mailto:${escapeHtml(e.email)}" style="display:inline-block;background:${GREEN};color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:999px;">Reply to ${n}</a>
    </td></tr>`;
  return {
    subject: `New enquiry — ${e.name} · ${e.interest}`,
    html: shell(inner),
    text:
      `New website enquiry\n\n` +
      `Name: ${e.name}\nEmail: ${e.email}\nPhone: ${e.phone}\nInterested in: ${e.interest}\n` +
      (e.message ? `\nMessage:\n${e.message}\n` : ""),
  };
}

/** Sent to the visitor so they know it landed. */
export function confirmationEmail(e: Enquiry) {
  const first = escapeHtml(e.name.split(" ")[0] || e.name);
  const inner = `
    <tr><td style="padding:30px 28px 10px;">
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:${GREEN};font-weight:700;">Wellthyfy Lifestyle Ventures</p>
      <h1 style="margin:0 0 14px;font-size:24px;line-height:1.3;color:${INK};">Thank you, ${first} — we have your message.</h1>
      <p style="margin:0;font-size:15px;line-height:1.7;color:${SOFT};">
        Our team will get back to you shortly about
        <strong style="color:${INK};">${escapeHtml(e.interest)}</strong>.
        If it is urgent, call us on
        <a href="tel:${siteConfig.phone.replace(/\s/g, "")}" style="color:${NAVY};font-weight:600;text-decoration:none;">${siteConfig.phone}</a>.
      </p>
    </td></tr>
    <tr><td style="padding:20px 28px 4px;">
      <p style="margin:0 0 10px;color:${SOFT};font-size:13px;">What you sent us</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${row("Interested in", escapeHtml(e.interest))}
        ${row("Phone", escapeHtml(e.phone))}
        ${e.message ? row("Message", escapeHtml(e.message).replace(/\n/g, "<br>")) : ""}
      </table>
    </td></tr>
    <tr><td style="padding:24px 28px 8px;">
      <div style="background:linear-gradient(120deg,#14402a,${NAVY});border-radius:14px;padding:22px 24px;color:#fff;">
        <p style="margin:0 0 6px;font-size:17px;font-weight:700;">Live Healthy. Live Wealthy. Live Happy.</p>
        <p style="margin:0;font-size:13px;line-height:1.6;color:rgba(255,255,255,.82);">
          Wellness programmes, practical money skills and courses that turn learning into real opportunity.
        </p>
      </div>
    </td></tr>
    <tr><td style="padding:20px 28px 26px;">
      <a href="${siteConfig.url}" style="display:inline-block;background:${GOLD};color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:999px;">Visit wellthyfy.in</a>
    </td></tr>`;
  return {
    subject: "We received your message — Wellthyfy Lifestyle Ventures",
    html: shell(inner),
    text:
      `Thank you, ${e.name}.\n\n` +
      `We have received your message about ${e.interest} and will get back to you shortly.\n` +
      `If it is urgent, call ${siteConfig.phone}.\n\n` +
      `Live Healthy. Live Wealthy. Live Happy.\n${siteConfig.url}\n`,
  };
}
