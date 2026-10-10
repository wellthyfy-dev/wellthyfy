import type { Metadata } from "next";
import Link from "next/link";
import AuthForm from "@/components/platform/AuthForm";
import { AuthShell } from "@/components/platform/AuthShell";
import type { UserRole } from "@/lib/platform";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false, follow: false },
};

function readRole(value: string | undefined): UserRole {
  return value === "faculty" ? "faculty" : "student";
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; next?: string }>;
}) {
  const params = await searchParams;
  const role = readRole(params.role);
  const next = params.next;

  return (
    <AuthShell
      role={role}
      title={`Create a ${role} account`}
      subtitle={
        role === "faculty"
          ? "Publish your courses to the Wellthyfy community."
          : "One account for every course you enrol in."
      }
      footer={
        <p>
          Already registered?{" "}
          <Link
            href={`/login?role=${role}${next ? `&next=${encodeURIComponent(next)}` : ""}`}
            className="font-semibold text-navy-800 underline decoration-gold-400 decoration-2 underline-offset-4 hover:text-well-700"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <AuthForm mode="signup" role={role} next={next} />
    </AuthShell>
  );
}
