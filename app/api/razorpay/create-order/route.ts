import { NextResponse, type NextRequest } from "next/server";
import { MIN_AMOUNT_PAISE, razorpay, razorpayConfigured, razorpayError } from "@/lib/razorpay";
import { getSessionProfile } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/**
 * Opens a Razorpay order for the signed-in student and course.
 *
 * Amount, course and student come from the database, never the request body;
 * they are also stamped into the order's `notes`, which verify-payment reads
 * back from Razorpay. Nothing is written to our database yet, so a checkout
 * the student abandons holds no seat.
 */
export async function POST(request: NextRequest) {
  if (!razorpayConfigured()) return fail("Online payment is not available right now.", 503);

  const { supabase, user, profile } = await getSessionProfile();
  if (!user || !profile) return fail("Please sign in to enrol.", 401);
  if (!profile.profile_completed) return fail("Finish your profile before enrolling.", 403);

  const body = (await request.json().catch(() => null)) as
    | { course_id?: unknown; batch_id?: unknown }
    | null;
  const courseId = typeof body?.course_id === "string" ? body.course_id : "";
  const batchId = typeof body?.batch_id === "string" && body.batch_id ? body.batch_id : null;
  if (!courseId) return fail("Missing course.", 400);

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, price_inr, faculty_id, status")
    .eq("id", courseId)
    .maybeSingle();
  if (!course) return fail("That course is no longer available.", 404);
  if (course.status !== "published") return fail("That course is not open for enrolment.", 400);
  if (course.faculty_id === profile.id) return fail("You cannot enrol in your own course.", 400);

  const amount = Math.round(Number(course.price_inr) * 100);
  if (!Number.isFinite(amount) || amount < MIN_AMOUNT_PAISE) {
    return fail("This course cannot be paid for online.", 400);
  }

  const { data: existing } = await supabase
    .from("orders")
    .select("status")
    .eq("course_id", course.id)
    .eq("student_id", profile.id)
    .maybeSingle();
  if (existing?.status === "verified") return fail("You are already enrolled in this course.", 409);
  if (existing?.status === "pending") {
    return fail("Your UPI payment for this course is already waiting to be verified.", 409);
  }

  // Courses that run in batches need an open batch with a seat left. The
  // database re-checks seats when the payment is recorded.
  const { data: openBatches } = await supabase
    .from("batches")
    .select("id, seats")
    .eq("course_id", course.id)
    .eq("status", "open");
  const batches = openBatches ?? [];
  const batch = batchId ? batches.find((b) => b.id === batchId) : null;
  if (batches.length > 0 && !batch) return fail("Choose the batch you want to join.", 400);
  if (batch) {
    const { data: taken } = await supabase.rpc("batch_seats_taken", { p_batches: [batch.id] });
    const used = ((taken ?? []) as { taken: number }[])[0]?.taken ?? 0;
    if (used >= batch.seats) return fail("Sorry, that batch is full. Please pick another batch.", 409);
  }

  try {
    const order = await razorpay().orders.create({
      amount,
      currency: "INR",
      // Receipt is capped at 40 characters.
      receipt: `wf_${Date.now().toString(36)}_${profile.id.slice(0, 8)}`,
      notes: {
        course_id: course.id,
        batch_id: batch?.id ?? "",
        student_id: profile.id,
        course_title: course.title.slice(0, 200),
      },
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
      course_title: course.title,
      prefill: {
        name: profile.full_name ?? "",
        email: profile.email ?? "",
        contact: profile.whatsapp ?? "",
      },
    });
  } catch (err) {
    const { status, description } = razorpayError(err);
    console.error("[razorpay] order create failed:", status, description);
    // 401 from Razorpay means our keys are wrong, not that the student is.
    return fail(
      status === 401
        ? "Online payment is misconfigured. Please try UPI or contact us."
        : "We couldn't start the payment. Please try again.",
      500,
    );
  }
}
