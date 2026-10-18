import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import FacultyJoinForm from "@/components/platform/FacultyJoinForm";
import { AuthShell } from "@/components/platform/AuthShell";
import { createPublicClient } from "@/lib/supabase/public";

// Private invitation page: not linked anywhere, never indexed, and useless
// without the token that is emailed to an approved applicant.
export const metadata: Metadata = {
  title: "Create your faculty account",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function FacultyJoinPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  let invite: { email: string; full_name: string } | null = null;
  if (token && /^[0-9a-f]{48}$/.test(token)) {
    const { data } = await createPublicClient().rpc("get_faculty_invite", { p_token: token });
    invite = (data as { email: string; full_name: string }[] | null)?.[0] ?? null;
  }

  if (!invite || !token) {
    return (
      <AuthShell
        role="faculty"
        title="Invitation not valid"
        subtitle="This link is incorrect, has expired, or has already been used."
        footer={
          <p>
            Already created your account?{" "}
            <Link
              href="/faculty/login"
              className="font-semibold text-navy-800 underline decoration-gold-400 decoration-2 underline-offset-4 hover:text-well-700"
            >
              Faculty sign in
            </Link>
          </p>
        }
      >
        <div className="rounded-2xl border border-gold-200 bg-gold-50 p-5">
          <KeyRound className="size-6 text-gold-700" />
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Faculty accounts are created from the private link in your approval email. If you
            think this is a mistake, reply to that email and we will help.
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      role="faculty"
      title="Create your faculty account"
      subtitle="You have been approved. Set a password to get started."
    >
      <FacultyJoinForm token={token} email={invite.email} fullName={invite.full_name} />
    </AuthShell>
  );
}
