import { NextResponse, type NextRequest } from "next/server";
import { JOIN_OPENS_MIN } from "@/lib/batches";
import { createClient } from "@/lib/supabase/server";

/**
 * Join a live class. Students never see the raw meeting link on the page: this
 * route checks they are signed in, that the class is about to start (or
 * running), and that they can read the batch's private link — which RLS allows
 * only for verified students of that batch, its faculty and admins.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const back = (reason: string) =>
    NextResponse.redirect(new URL(`/dashboard/student?class=${reason}#classes`, request.url));

  if (!/^[0-9a-f-]{36}$/i.test(sessionId)) return back("not-found");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `/classes/${sessionId}/join`);
    return NextResponse.redirect(login);
  }

  const { data: session } = await supabase
    .from("batch_sessions")
    .select("batch_id, starts_at, ends_at, status")
    .eq("id", sessionId)
    .maybeSingle();
  if (!session) return back("not-found");
  if (session.status === "cancelled") return back("cancelled");

  const now = Date.now();
  if (now < new Date(session.starts_at).getTime() - JOIN_OPENS_MIN * 60_000) return back("too-early");
  if (now > new Date(session.ends_at).getTime()) return back("ended");

  const { data: priv } = await supabase
    .from("batch_private")
    .select("meeting_url")
    .eq("batch_id", session.batch_id)
    .maybeSingle();
  if (!priv) return back("not-enrolled");
  if (!priv.meeting_url) return back("no-link");

  return NextResponse.redirect(priv.meeting_url);
}
