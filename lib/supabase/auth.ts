import { redirect } from "next/navigation";
import { canUseFacultyArea, isFacultyEmail } from "@/lib/faculty";
import type { Profile } from "@/lib/platform";
import { createClient } from "./server";

/** Current user plus their profile row, or nulls when signed out. */
export async function getSessionProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, profile: null as Profile | null };

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return { supabase, user, profile: (data as Profile | null) ?? null };
}

/**
 * Gate a page behind sign-in. By default also requires a completed profile,
 * so every dashboard can assume contact details exist.
 */
export async function requireProfile({
  completed = true,
  signIn = "/student",
}: { completed?: boolean; signIn?: string } = {}) {
  const { supabase, user, profile } = await getSessionProfile();
  if (!user || !profile) redirect(signIn);
  if (completed && !profile.profile_completed) redirect("/onboarding");
  return { supabase, user, profile };
}

/**
 * Where "My dashboard" lands. Only a faculty account on a Wellthyfy mail id goes
 * to the faculty area; everyone else, including legacy faculty rows on other
 * domains, uses the student dashboard.
 */
export function dashboardHomeFor(profile: Pick<Profile, "role" | "email">) {
  return canUseFacultyArea(profile) ? "/dashboard/faculty" : "/dashboard/student";
}

/**
 * Faculty-only areas. Faculty accounts must sit on a @wellthyfy.in mail id, so a
 * faculty profile on any other address is sent to an explanatory page rather
 * than into the dashboard.
 */
export async function requireFaculty() {
  const ctx = await requireProfile({ signIn: "/faculty" });
  if (ctx.profile.role !== "faculty") redirect("/dashboard");
  if (!isFacultyEmail(ctx.profile.email)) redirect("/faculty/restricted");
  return ctx;
}

/**
 * Admin-only areas. Anyone who is not a signed-in admin (signed out, or signed
 * in as a student/faculty) is sent to /admin, which shows the admin sign-in.
 * /admin itself checks with getSessionProfile first, so this never loops.
 */
export async function requireAdmin() {
  const { supabase, user, profile } = await getSessionProfile();
  if (!user || !profile?.is_admin) redirect("/admin");
  return { supabase, user, profile };
}
