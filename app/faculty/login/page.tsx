import type { Metadata } from "next";
import AuthForm from "@/components/platform/AuthForm";
import { AuthShell } from "@/components/platform/AuthShell";
import { FACULTY_DOMAIN } from "@/lib/faculty";

// Deliberately not linked from anywhere on the public site and kept out of
// search results. Faculty get this address in their approval email.
export const metadata: Metadata = {
  title: "Faculty sign in",
  robots: { index: false, follow: false },
};

export default async function FacultyLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <AuthShell
      role="faculty"
      title="Faculty sign in"
      subtitle={`Sign in with your @${FACULTY_DOMAIN} mail id.`}
    >
      <AuthForm mode="login" role="faculty" next={next} requiredDomain={FACULTY_DOMAIN} />
    </AuthShell>
  );
}
