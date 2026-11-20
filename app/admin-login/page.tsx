import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "@/components/platform/AuthForm";
import { AuthShell } from "@/components/platform/AuthShell";
import { getSessionProfile } from "@/lib/supabase/auth";

// Lives outside /admin because the admin layout gates everything under it.
// Not linked from the public site and kept out of search results.
export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const { profile } = await getSessionProfile();
  if (profile?.is_admin) redirect("/admin");

  return (
    <AuthShell
      role="admin"
      title="Admin sign in"
      subtitle="For the Wellthyfy team only."
    >
      <AuthForm mode="login" role="admin" />
    </AuthShell>
  );
}
