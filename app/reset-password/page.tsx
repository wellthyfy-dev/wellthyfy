import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ResetPasswordForm from "@/components/platform/ResetPasswordForm";
import { AuthShell } from "@/components/platform/AuthShell";
import { getSessionProfile } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Set a new password",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage() {
  // Reaching here requires the session created by the emailed recovery link.
  const { user, profile } = await getSessionProfile();
  if (!user) redirect("/forgot-password");

  return (
    <AuthShell
      role={profile?.role ?? "student"}
      title="Set a new password"
      subtitle="Choose something you have not used before."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
