import type { Metadata } from "next";
import Link from "next/link";
import AuthForm from "@/components/platform/AuthForm";
import { AuthShell } from "@/components/platform/AuthShell";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false, follow: false },
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <AuthShell
      role="student"
      title="Create a student account"
      subtitle="One account for every course you enrol in."
      footer={
        <p>
          Already registered?{" "}
          <Link
            href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="font-semibold text-navy-800 underline decoration-gold-400 decoration-2 underline-offset-4 hover:text-well-700"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <AuthForm mode="signup" role="student" next={next} />
    </AuthShell>
  );
}
