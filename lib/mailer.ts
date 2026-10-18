import { Resend } from "resend";

export type MailResult = { ok: true } | { ok: false; error: string };

/** Everyone who should hear about new applications (same list as contact enquiries). */
export function adminRecipients() {
  return (process.env.CONTACT_TO_EMAIL ?? "")
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);
}

/** Send one email through Resend. Never throws; callers decide what a failure means. */
export async function sendMail({
  to,
  subject,
  html,
  text,
  replyTo,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string | string[];
}): Promise<MailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY is not configured" };

  const from = process.env.CONTACT_FROM_EMAIL ?? "Wellthyfy <hello@info.wellthyfy.in>";
  try {
    const { error } = await new Resend(apiKey).emails.send({
      from,
      to,
      replyTo,
      subject,
      html,
      text,
    });
    return error ? { ok: false, error: error.message } : { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown mail error" };
  }
}
