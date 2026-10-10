import type { Metadata } from "next";
import Link from "next/link";
import AuthForm from "@/components/platform/AuthForm";
import { AuthShell } from "@/components/platform/AuthShell";
import type { UserRole } from "@/lib/platform";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

function readRole(value: string | undefined): UserRole {
  return value === "faculty" ? "faculty" : "student";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; next?: string }>;
}) {
  const params = await searchParams;
  const role = readRole(params.role);
  const next = params.next;
  const otherRole: UserRole = role === "faculty" ? "student" : "faculty";

  return (
    <AuthShell
      role={role}
      title={`${role === "faculty" ? "Faculty" : "Student"} sign in`}
      subtitle="Welcome back. Enter your details to continue."
      footer={
        <>
          <p>
            New here?{" "}
            <Link
              href={`/signup?role=${role}${next ? `&next=${encodeURIComponent(next)}` : ""}`}
              className="font-semibold text-navy-800 underline decoration-gold-400 decoration-2 underline-offset-4 hover:text-well-700"
            >
              Create an account
            </Link>
          </p>
          <p className="mt-2">
            <Link
              href={`/login?role=${otherRole}`}
              className="text-xs font-medium text-ink-soft underline underline-offset-4 hover:text-navy-800"
            >
              Sign in as {otherRole === "faculty" ? "faculty" : "a student"} instead
            </Link>
          </p>
        </>
      }
    >
      <AuthForm mode="login" role={role} next={next} />
    </AuthShell>
  );
}
