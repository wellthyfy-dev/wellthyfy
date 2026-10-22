import { NextResponse } from "next/server";
import { ID_UPLOAD } from "@/lib/faculty";
import { applicationReceivedEmail, newApplicationEmail } from "@/lib/faculty-emails";
import { adminRecipients, sendMail } from "@/lib/mailer";
import { siteOrigin } from "@/lib/site-origin";
import { createPublicClient } from "@/lib/supabase/public";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const EXTENSIONS = Object.values(ID_UPLOAD.types).join("|");

/** Best-effort, per-instance throttle: slows casual abuse, is not a global limit. */
const hits = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 3;

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const bad = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return bad("Invalid request.");
  }

  // Honeypot: real people never fill a hidden field.
  if (str(body.company, 100)) return NextResponse.json({ ok: true });

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return bad("Too many applications from this connection. Please try again later.", 429);
  }

  const id = str(body.id, 40);
  if (!UUID.test(id)) return bad("Invalid request.");

  const panPath = str(body.pan_path, 200);
  const frontPath = str(body.id_front_path, 200);
  const backPath = str(body.id_back_path, 200);
  // Uploads are made by the browser straight to storage; confirm the paths are
  // the ones that folder is allowed to contain and belong to THIS application.
  const pathOk = (p: string, name: "id-front" | "id-back" | "pan") =>
    new RegExp(`^${id}/${name}\\.(${EXTENSIONS})$`).test(p);

  const row = {
    id,
    full_name: str(body.full_name, 120),
    contact_email: str(body.contact_email, 200).toLowerCase(),
    phone: str(body.phone, 30),
    whatsapp: str(body.whatsapp, 30) || null,
    address: str(body.address, 500),
    qualification: str(body.qualification, 1000),
    experience: str(body.experience, 3000) || null,
    // PAN and Aadhaar are both required; Aadhaar sits in the id_* columns.
    id_type: "aadhaar",
    id_front_path: frontPath,
    id_back_path: backPath,
    pan_path: panPath,
  };

  if (row.full_name.length < 2) return bad("Please enter your full name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(row.contact_email)) {
    return bad("That email address does not look right.");
  }
  if (row.phone.length < 7) return bad("Please enter a phone number we can reach you on.");
  if (row.address.length < 5) return bad("Please enter your address.");
  if (row.qualification.length < 2) return bad("Tell us your qualification.");
  if (!pathOk(panPath, "pan")) return bad("Please upload your PAN card.");
  if (!pathOk(frontPath, "id-front")) return bad("Please upload the front of your Aadhaar card.");
  if (!pathOk(backPath, "id-back")) return bad("Please upload the back of your Aadhaar card.");
  if (body.consent !== true) return bad("Please confirm the declaration to continue.");

  // Anonymous insert, constrained by RLS to a clean "pending" row.
  const { error } = await createPublicClient().from("faculty_applications").insert(row);
  if (error) {
    console.error("[faculty-apply] insert failed:", error.message);
    return bad(
      error.code === "23514" || error.code === "22P02"
        ? "Some details look incorrect. Please check the form and try again."
        : "We could not save your application. Please try again.",
      error.code === "23514" || error.code === "22P02" ? 400 : 500,
    );
  }

  // The application is saved; email is a courtesy and must never fail the request.
  const origin = await siteOrigin();
  const alert = newApplicationEmail(row as never, origin);
  const recipients = adminRecipients();
  const [adminMail, ackMail] = await Promise.all([
    recipients.length
      ? sendMail({ to: recipients, replyTo: row.contact_email, ...alert })
      : Promise.resolve({ ok: false as const, error: "no admin recipients configured" }),
    sendMail({ to: row.contact_email, replyTo: recipients, ...applicationReceivedEmail(row) }),
  ]);
  if (!adminMail.ok) console.warn("[faculty-apply] admin alert not sent:", adminMail.error);
  if (!ackMail.ok) console.warn("[faculty-apply] acknowledgement not sent:", ackMail.error);

  return NextResponse.json({ ok: true });
}
