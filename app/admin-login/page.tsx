import { redirect } from "next/navigation";

/** Admin sign-in now lives at /admin itself. */
export default function LegacyAdminLoginPage() {
  redirect("/admin");
}
