import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
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
  searchParams: Promise<{ role?: string; error?: string }>;
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
            href={role === "faculty" ? "/faculty" : "/student"}
            className="font-semibold text-navy-800 underline decoration-gold-400 decoration-2 underline-offset-4 hover:text-well-700"
          >
            Back to sign in
          </Link>
        </p>
      }
    >
      {params.error === "link" && (
        <p
          role="alert"
          className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
        >
          <AlertCircle className="mt-0.5 size-4.5 shrink-0 text-red-600" />
          That reset link has expired or was already used. Enter your email to get a new one.
        </p>
      )}
      <ForgotPasswordForm />
    </AuthShell>
  );
}
