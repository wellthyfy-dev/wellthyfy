import Link from "next/link";
import { EmptyState } from "@/components/platform/DashboardShell";
import { cn } from "@/lib/accents";
import {
  APPLICATION_STATUS_LABELS,
  idSummary,
  type ApplicationStatus,
  type FacultyApplication,
} from "@/lib/faculty";
import { requireAdmin } from "@/lib/supabase/auth";

const FILTERS: { key: ApplicationStatus | "all"; label: string }[] = [
  { key: "pending", label: "Awaiting review" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Not approved" },
  { key: "all", label: "All" },
];

const TONE: Record<ApplicationStatus, string> = {
  pending: "border-gold-200 bg-gold-50 text-gold-800",
  approved: "border-well-200 bg-well-50 text-well-800",
  rejected: "border-red-200 bg-red-50 text-red-800",
};

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { status } = await searchParams;
  const active = FILTERS.some((f) => f.key === status) ? (status as string) : "pending";

  let query = supabase
    .from("faculty_applications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (active !== "all") query = query.eq("status", active);

  const { data } = await query;
  const applications = (data ?? []) as FacultyApplication[];

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/applications?status=${f.key}`}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              active === f.key
                ? "border-navy-700 bg-navy-800 text-white"
                : "border-navy-900/10 bg-white/80 text-ink-soft hover:text-navy-800",
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {applications.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Nothing here"
            body="No applications match this filter right now."
          />
        </div>
      ) : (
        <ul className="mt-6 grid gap-3">
          {applications.map((a) => (
            <li key={a.id}>
              <Link
                href={`/admin/applications/${a.id}`}
                className="group flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-navy-900/7 bg-white/85 p-5 shadow-soft backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{a.full_name}</p>
                  <p className="mt-0.5 truncate text-sm text-ink-soft">
                    {a.qualification ?? a.course_title}
                  </p>
                  <p className="mt-1.5 text-xs text-ink-soft">
                    {a.contact_email} · {idSummary(a)} · submitted{" "}
                    {new Date(a.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold",
                    TONE[a.status],
                  )}
                >
                  {APPLICATION_STATUS_LABELS[a.status]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
