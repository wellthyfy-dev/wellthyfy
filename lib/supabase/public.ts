import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Anonymous, cookie-free client for public reads (published course listings).
 *
 * Deliberately separate from the cookie-bound server client: touching cookies
 * forces a route to render dynamically, and these listings should stay
 * cacheable. RLS still restricts this to `status = 'published'` rows.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

/** Published courses, newest first. Returns [] if Supabase is unreachable. */
export async function listPublishedCourses(limit = 24) {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit);
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}
