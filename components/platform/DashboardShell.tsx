import Link from "next/link";
import { GraduationCap, LogOut, Users } from "lucide-react";
import { cn } from "@/lib/accents";
import type { Profile } from "@/lib/platform";

export function DashboardShell({
  profile,
  tabs,
  active,
  title,
  subtitle,
  action,
  children,
}: {
  profile: Profile;
  tabs: { href: string; label: string }[];
  active: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const isFaculty = profile.role === "faculty";
  const RoleIcon = isFaculty ? Users : GraduationCap;
  const firstName = profile.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="relative pb-24 pt-28 md:pt-36">
      <div className="container-page">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0">
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white",
                isFaculty
                  ? "bg-gradient-to-r from-navy-600 to-navy-800"
                  : "bg-gradient-to-r from-well-500 to-well-700",
              )}
            >
              <RoleIcon className="size-3.5" strokeWidth={2.4} />
              {isFaculty ? "Faculty" : "Student"}
            </span>
            <h1 className="mt-4 text-3xl font-semibold leading-[1.12] sm:text-4xl">{title}</h1>
            {subtitle && <p className="mt-2 text-base text-ink-soft">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-3">
            {action}
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white/80 px-4 py-2.5 text-sm font-semibold text-navy-800 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-navy-300 hover:shadow-soft"
              >
                <LogOut className="size-4" strokeWidth={2.2} />
                Sign out
              </button>
            </form>
          </div>
        </div>

        {/* Greeting + tabs */}
        <p className="mt-6 text-sm text-ink-soft">
          Signed in as <span className="font-semibold text-ink">{firstName}</span> · {profile.email}
        </p>

        {tabs.length > 1 && (
          <nav aria-label="Dashboard sections" className="mt-6 flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={tab.href === active ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  tab.href === active
                    ? "bg-well-50 text-navy-800 ring-1 ring-well-200"
                    : "text-ink-soft hover:bg-white/70 hover:text-navy-800",
                )}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="mt-10">{children}</div>
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  tone = "navy",
}: {
  label: string;
  value: string | number;
  tone?: "green" | "navy" | "gold";
}) {
  const bar = {
    green: "from-well-400 to-well-600",
    navy: "from-navy-500 to-navy-800",
    gold: "from-gold-400 to-gold-600",
  }[tone];

  return (
    <div className="overflow-hidden rounded-2xl border border-navy-900/7 bg-white/85 shadow-soft backdrop-blur-sm">
      <div className={cn("h-1 w-full bg-gradient-to-r", bar)} />
      <div className="p-5">
        <p className="font-display text-3xl font-semibold tabular-nums text-ink">{value}</p>
        <p className="mt-1 text-sm text-ink-soft">{label}</p>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-navy-900/15 bg-white/60 p-10 text-center backdrop-blur-sm">
      <p className="font-display text-xl font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">{body}</p>
      {cta && <div className="mt-6">{cta}</div>}
    </div>
  );
}
