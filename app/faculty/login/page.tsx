import { redirect } from "next/navigation";

/** Old faculty sign-in URL (sent in earlier approval emails). */
export default async function LegacyFacultyLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  redirect(`/faculty${next ? `?next=${encodeURIComponent(next)}` : ""}`);
}
