import { NextResponse } from "next/server";
import { ID_TYPES, ID_UPLOAD } from "@/lib/faculty";
import { applicationReceivedEmail, newApplicationEmail } from "@/lib/faculty-emails";
import { adminRecipients, sendMail } from "@/lib/mailer";
import {
  OTHER_SUBCATEGORY,
  modulesPdfUrl,
  type CourseCategory,
  type CourseMode,
} from "@/lib/platform";
import { siteOrigin } from "@/lib/site-origin";
import { createPublicClient } from "@/lib/supabase/public";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CATEGORIES: CourseCategory[] = ["wellness", "wealth", "happiness"];
const MODES: CourseMode[] = ["online_live", "recorded", "offline", "hybrid"];
const ID_VALUES = ID_TYPES.map((t) => t.value) as string[];
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

  const chosenSub = str(body.subcategory, 80);
  const subcategory = chosenSub === OTHER_SUBCATEGORY ? str(body.subcategory_other, 80) : chosenSub;
  const category = str(body.category, 20) as CourseCategory;
  const mode = str(body.mode, 20) as CourseMode;
  const idType = str(body.id_type, 30);
  const fee = Number.parseInt(str(body.fee_inr, 12) || "", 10);

  const frontPath = str(body.id_front_path, 200);
  const backPath = str(body.id_back_path, 200);
  // Uploads are made by the browser straight to storage; confirm the paths are
  // the ones that folder is allowed to contain and belong to THIS application.
  const pathOk = (p: string, side: "front" | "back") =>
    new RegExp(`^${id}/id-${side}\\.(${EXTENSIONS})$`).test(p);

  const row = {
    id,
    full_name: str(body.full_name, 120),
    contact_email: str(body.contact_email, 200).toLowerCase(),
    phone: str(body.phone, 30),
    whatsapp: str(body.whatsapp, 30) || null,
    address: str(body.address, 500),
    experience: str(body.experience, 3000),
    id_type: idType,
    id_front_path: frontPath,
    id_back_path: backPath || null,
    course_title: str(body.course_title, 140),
    course_summary: str(body.course_summary, 200) || null,
    course_description: str(body.course_description, 6000),
    modules_pdf_path: str(body.modules_pdf_path, 200),
    category,
    subcategory,
    mode,
    level: str(body.level, 40) || null,
    duration: str(body.duration, 60) || null,
    language: str(body.language, 40) || null,
    fee_inr: fee,
  };

  if (row.full_name.length < 2) return bad("Please enter your full name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(row.contact_email)) {
    return bad("That email address does not look right.");
  }
  if (row.phone.length < 7) return bad("Please enter a phone number we can reach you on.");
  if (row.address.length < 5) return bad("Please enter your address.");
  if (row.experience.length < 10) return bad("Tell us a little about your background.");
  if (!ID_VALUES.includes(idType)) return bad("Choose the type of government ID you are uploading.");
  if (!pathOk(frontPath, "front")) return bad("Please upload the front of your ID.");
  if (backPath && !pathOk(backPath, "back")) return bad("The back-of-ID upload is invalid.");
  if (row.course_title.length < 3) return bad("Give your course a title.");
  if (row.course_description.length < 20) return bad("Describe your course in a little more detail.");
  if (row.modules_pdf_path !== `apply/${id}/modules.pdf`) {
    return bad("Please upload your course modules as a PDF.");
  }
  if (!CATEGORIES.includes(category)) return bad("Choose a category.");
  if (!subcategory) return bad("Choose a subcategory, or type one if you picked Other.");
  if (!MODES.includes(mode)) return bad("Choose how the course is delivered.");
  if (!Number.isFinite(fee) || fee < 0 || fee > 1_000_000) return bad("Enter a valid fee in rupees.");
  if (body.consent !== true) return bad("Please confirm the declaration to continue.");

  // The bucket is public, so a HEAD request proves the upload really landed.
  const pdfUrl = modulesPdfUrl(row.modules_pdf_path);
  const pdfHead = pdfUrl ? await fetch(pdfUrl, { method: "HEAD", cache: "no-store" }).catch(() => null) : null;
  if (!pdfHead?.ok) return bad("We could not find your modules PDF. Please upload it again.");

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
