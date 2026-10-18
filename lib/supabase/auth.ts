import { notFound, redirect } from "next/navigation";
import { isFacultyEmail } from "@/lib/faculty";
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
export async function requireProfile({ completed = true }: { completed?: boolean } = {}) {
  const { supabase, user, profile } = await getSessionProfile();
  if (!user || !profile) redirect("/login");
  if (completed && !profile.profile_completed) redirect("/onboarding");
  return { supabase, user, profile };
}

/**
 * Faculty-only areas. Faculty accounts must sit on a @wellthyfy.in mail id, so a
 * faculty profile on any other address is sent to an explanatory page rather
 * than into the dashboard.
 */
export async function requireFaculty() {
  const ctx = await requireProfile();
  if (ctx.profile.role !== "faculty") redirect("/dashboard");
  if (!isFacultyEmail(ctx.profile.email)) redirect("/faculty/restricted");
  return ctx;
}

/**
 * Admin-only areas. Signed-out visitors go to sign-in; signed-in non-admins get
 * a plain 404 so the panel's existence is not confirmed to them.
 */
export async function requireAdmin() {
  const { supabase, user, profile } = await getSessionProfile();
  if (!user) redirect("/login?next=/admin");
  if (!profile?.is_admin) notFound();
  return { supabase, user, profile };
}
