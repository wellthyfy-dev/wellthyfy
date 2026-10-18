import type { Metadata } from "next";
import Link from "next/link";
import AuthForm from "@/components/platform/AuthForm";
import { AuthShell } from "@/components/platform/AuthShell";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <AuthShell
      role="student"
      title="Student sign in"
      subtitle="Welcome back. Enter your details to continue."
      footer={
        <p>
          New here?{" "}
          <Link
            href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="font-semibold text-navy-800 underline decoration-gold-400 decoration-2 underline-offset-4 hover:text-well-700"
          >
            Create an account
          </Link>
        </p>
      }
    >
      <AuthForm mode="login" role="student" next={next} />
    </AuthShell>
  );
}
