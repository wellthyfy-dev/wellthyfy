import { redirect } from "next/navigation";

/** Old student sign-in URL, kept so existing links and bookmarks still work. */
export default async function LegacyLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { next, error } = await searchParams;
  const query = new URLSearchParams();
  if (next) query.set("next", next);
  if (error) query.set("error", error);
  const qs = query.toString();
  redirect(`/student${qs ? `?${qs}` : ""}`);
}
