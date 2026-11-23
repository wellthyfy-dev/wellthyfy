import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "@/components/platform/AuthForm";
import { AuthShell } from "@/components/platform/AuthShell";
import { canUseFacultyArea, FACULTY_DOMAIN } from "@/lib/faculty";
import { getSessionProfile } from "@/lib/supabase/auth";
import { siteConfig } from "@/lib/site";

// Faculty sign-in. Not linked from the public site and kept out of search
// results. Faculty get this address in their approval email.
export const metadata: Metadata = {
  title: "Faculty sign in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function FacultyLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  // Already signed in as faculty: straight to the faculty dashboard.
  const { profile } = await getSessionProfile();
  if (profile && canUseFacultyArea(profile)) redirect(next ?? "/dashboard/faculty");

  return (
    <AuthShell
      role="faculty"
      title="Faculty sign in"
      subtitle={`Sign in with your @${FACULTY_DOMAIN} mail id.`}
      footer={
        <p>
          First time here? Open the <span className="font-semibold text-ink">Create my faculty
          account</span> link in your approval email to set your password. Lost it? Write to{" "}
          <a
            href={siteConfig.emailHref}
            className="font-semibold text-navy-800 underline decoration-gold-400 decoration-2 underline-offset-4 hover:text-well-700"
          >
            {siteConfig.email}
          </a>
          .
        </p>
      }
    >
      <AuthForm mode="login" role="faculty" next={next} requiredDomain={FACULTY_DOMAIN} />
    </AuthShell>
  );
}
