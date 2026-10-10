import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/supabase/auth";

/** Sends each signed-in user to the dashboard for their role. */
export default async function DashboardIndex() {
  const { profile } = await requireProfile();
  redirect(profile.role === "faculty" ? "/dashboard/faculty" : "/dashboard/student");
}
