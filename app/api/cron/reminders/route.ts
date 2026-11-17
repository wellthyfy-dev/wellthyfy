import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { classReminderEmail } from "@/lib/batch-emails";
import type { BatchMode } from "@/lib/batches";
import { adminRecipients, sendMail } from "@/lib/mailer";
import { siteOrigin } from "@/lib/site-origin";
import { createPublicClient } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";

type Due = {
  session_id: string;
  seq: number;
  starts_at: string;
  ends_at: string;
  batch_name: string;
  batch_mode: BatchMode;
  venue: string | null;
  course_title: string;
  course_slug: string;
  student_name: string | null;
  student_email: string;
};

function authorised(request: NextRequest, secret: string) {
  const given = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Class reminder emails. Call every 10 minutes with
 * `Authorization: Bearer <CRON_SECRET>` (Vercel Cron sends this automatically).
 *
 * The database claims each reminder exactly once, so a missed or doubled run
 * never sends twice; it does not need a service key — the secret is checked
 * against a hash stored in `cron_tokens`.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET is not set" }, { status: 503 });
  if (!authorised(request, secret)) return NextResponse.json({ error: "unauthorised" }, { status: 401 });

  const supabase = createPublicClient();
  const origin = await siteOrigin();
  const summary: Record<string, { due: number; sent: number }> = {};

  for (const kind of ["soon", "day"] as const) {
    const { data, error } = await supabase.rpc("claim_class_reminders", {
      p_token: secret,
      p_kind: kind,
    });
    if (error) {
      console.error(`[cron] ${kind} reminders:`, error.message);
      return NextResponse.json({ error: "database error" }, { status: 500 });
    }
    const due = (data ?? []) as Due[];
    const results = await Promise.all(
      due.map((d) =>
        sendMail({
          to: d.student_email,
          replyTo: adminRecipients(),
          ...classReminderEmail(
            {
              studentName: d.student_name,
              courseTitle: d.course_title,
              batchName: d.batch_name,
              mode: d.batch_mode,
              venue: d.venue,
              seq: d.seq,
              startsAt: d.starts_at,
              endsAt: d.ends_at,
            },
            kind,
            origin,
          ),
        }),
      ),
    );
    for (const r of results) if (!r.ok) console.warn(`[cron] ${kind} reminder failed:`, r.error);
    summary[kind] = { due: due.length, sent: results.filter((r) => r.ok).length };
  }

  return NextResponse.json({ ok: true, ...summary });
}
