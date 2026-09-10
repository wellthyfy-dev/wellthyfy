import { NextResponse } from "next/server";
import { Resend } from "resend";
import { adminEmail, confirmationEmail, type Enquiry } from "@/lib/email-templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LIMITS = { name: 100, email: 200, phone: 40, interest: 120, message: 4000 };

/**
 * Best-effort in-process throttle. Resets on redeploy and is per-instance, so
 * it slows casual abuse rather than guaranteeing a global limit — put a real
 * limiter (Upstash, WAF) in front if the form starts attracting bots.
 */
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  // Must be on a Resend-verified domain (info.wellthyfy.in).
  const from = process.env.CONTACT_FROM_EMAIL ?? "Wellthyfy <hello@info.wellthyfy.in>";

  if (!apiKey || !to) {
    console.error("[contact] RESEND_API_KEY or CONTACT_TO_EMAIL is not configured");
    return NextResponse.json(
      { ok: false, error: "Email is not configured on the server." },
      { status: 500 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real people never fill a hidden field.
  if (clean(body.company, 100)) {
    return NextResponse.json({ ok: true });
  }

  const enquiry: Enquiry = {
    name: clean(body.name, LIMITS.name),
    email: clean(body.email, LIMITS.email),
    phone: clean(body.phone, LIMITS.phone),
    interest: clean(body.interest, LIMITS.interest),
    message: clean(body.message, LIMITS.message),
  };

  const missing = (["name", "email", "phone", "interest"] as const).filter((k) => !enquiry[k]);
  if (missing.length) {
    return NextResponse.json(
      { ok: false, error: `Please fill in: ${missing.join(", ")}.` },
      { status: 400 },
    );
  }
  if (!isEmail(enquiry.email)) {
    return NextResponse.json(
      { ok: false, error: "That email address does not look right." },
      { status: 400 },
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many messages just now. Please try again shortly." },
      { status: 429 },
    );
  }

  const resend = new Resend(apiKey);
  const forTeam = adminEmail(enquiry);
  const forVisitor = confirmationEmail(enquiry);

  // The enquiry itself must land; the visitor's confirmation is best-effort so
  // a bounced receipt never costs the business a lead.
  const [teamResult, visitorResult] = await Promise.allSettled([
    resend.emails.send({
      from,
      to,
      replyTo: enquiry.email,
      subject: forTeam.subject,
      html: forTeam.html,
      text: forTeam.text,
    }),
    resend.emails.send({
      from,
      to: enquiry.email,
      // The sender is a no-reply-style address, so send replies to the team.
      replyTo: to,
      subject: forVisitor.subject,
      html: forVisitor.html,
      text: forVisitor.text,
    }),
  ]);

  const teamFailed =
    teamResult.status === "rejected" || Boolean(teamResult.value?.error);
  if (teamFailed) {
    const reason =
      teamResult.status === "rejected" ? teamResult.reason : teamResult.value.error;
    console.error("[contact] enquiry delivery failed:", reason);
    return NextResponse.json(
      { ok: false, error: "We could not send your message. Please call or email us instead." },
      { status: 502 },
    );
  }

  const visitorFailed =
    visitorResult.status === "rejected" || Boolean(visitorResult.value?.error);
  if (visitorFailed) {
    // Sender domain must stay verified in Resend for this to deliver.
    const reason =
      visitorResult.status === "rejected" ? visitorResult.reason : visitorResult.value.error;
    console.warn("[contact] confirmation to visitor failed:", reason);
  }

  return NextResponse.json({ ok: true, confirmationSent: !visitorFailed });
}
