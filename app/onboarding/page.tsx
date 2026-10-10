import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/platform/ProfileForm";
import { AuthShell } from "@/components/platform/AuthShell";
import { requireProfile } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Complete your profile",
  robots: { index: false, follow: false },
};

export default async function OnboardingPage() {
  const { profile } = await requireProfile({ completed: false });
  if (profile.profile_completed) redirect("/dashboard");

  return (
    <div className="relative px-5 py-28 md:py-32">
      <div className="mx-auto w-full max-w-2xl">
        <AuthShell
          role={profile.role}
          title="Complete your profile"
          subtitle="A few details before you get to your dashboard."
        >
          <ProfileForm profile={profile} />
        </AuthShell>
      </div>
    </div>
  );
}
