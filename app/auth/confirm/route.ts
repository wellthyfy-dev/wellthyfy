import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const TYPES: EmailOtpType[] = ["recovery", "signup", "email", "invite", "magiclink", "email_change"];

/** Only same-site paths, never an open redirect. */
function safeNext(next: string | null, fallback: string) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

/**
 * Target of the links in Supabase auth emails (token_hash flow). Unlike the
 * PKCE code exchange in /auth/callback, this works in ANY browser, so a reset
 * link opened from the Gmail app or on another device still signs the user in.
 *
 * Email template link, e.g. Reset Password:
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const isRecovery = type === "recovery";
  const next = safeNext(searchParams.get("next"), isRecovery ? "/reset-password" : "/onboarding");

  if (tokenHash && type && TYPES.includes(type)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  // Expired, already used, or malformed.
  return NextResponse.redirect(
    isRecovery ? `${origin}/forgot-password?error=link` : `${origin}/student?error=link`,
  );
}
