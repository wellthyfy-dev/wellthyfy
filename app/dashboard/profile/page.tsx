import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthShell } from "@/components/platform/AuthShell";
import ProfileForm from "@/components/platform/ProfileForm";
import { requireProfile } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Edit profile",
  robots: { index: false, follow: false },
};

/** Update contact details and Aadhaar after onboarding. */
export default async function EditProfilePage() {
  const { profile } = await requireProfile();

  return (
    <div className="relative px-5 py-28 md:py-32">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href="/dashboard"
          className="group mb-6 inline-flex items-center gap-2 text-sm font-semibold text-ink-soft transition-colors hover:text-well-700"
        >
          <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Back to dashboard
        </Link>
        <AuthShell
          role={profile.role}
          title="Edit your profile"
          subtitle={`Signed in as ${profile.email}. Upload new Aadhaar images only if you need to replace them.`}
        >
          <ProfileForm profile={profile} mode="edit" />
        </AuthShell>
      </div>
    </div>
  );
}
