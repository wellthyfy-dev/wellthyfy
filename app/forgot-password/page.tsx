import type { Metadata } from "next";
import Link from "next/link";
import ForgotPasswordForm from "@/components/platform/ForgotPasswordForm";
import { AuthShell } from "@/components/platform/AuthShell";
import type { UserRole } from "@/lib/platform";

export const metadata: Metadata = {
  title: "Reset your password",
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const params = await searchParams;
  const role: UserRole = params.role === "faculty" ? "faculty" : "student";

  return (
    <AuthShell
      role={role}
      title="Reset your password"
      subtitle="We will email you a link to set a new one."
      footer={
        <p>
          Remembered it?{" "}
          <Link
            href={`/login?role=${role}`}
            className="font-semibold text-navy-800 underline decoration-gold-400 decoration-2 underline-offset-4 hover:text-well-700"
          >
            Back to sign in
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
