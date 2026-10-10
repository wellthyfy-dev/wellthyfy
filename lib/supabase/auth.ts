import { redirect } from "next/navigation";
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
