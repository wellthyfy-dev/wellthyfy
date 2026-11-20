import { redirect } from "next/navigation";
import { dashboardHomeFor, requireProfile } from "@/lib/supabase/auth";

/** Sends each signed-in user to the right place for their account. */
export default async function DashboardIndex() {
  const { profile } = await requireProfile({ completed: false });

  // Admins never fill in the student/faculty profile form.
  if (profile.is_admin) redirect("/admin");
  if (!profile.profile_completed) redirect("/onboarding");

  redirect(dashboardHomeFor(profile));
}
