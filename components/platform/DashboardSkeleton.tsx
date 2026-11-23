import { cn } from "@/lib/accents";

/** One grey placeholder block. */
function Bone({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-full bg-navy-900/[0.07]", className)} />;
}

function CardBones() {
  return (
    <div className="rounded-2xl border border-navy-900/7 bg-white/85 p-5 shadow-soft backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="size-12 shrink-0 animate-pulse rounded-xl bg-navy-900/[0.07]" />
          <div className="min-w-0 flex-1 space-y-2.5">
            <Bone className="h-4 w-3/5 max-w-72" />
            <Bone className="h-3 w-2/5 max-w-52" />
          </div>
        </div>
        <Bone className="h-8 w-24" />
      </div>
    </div>
  );
}

/**
 * Placeholder that mirrors the dashboard layout (header, stat cards, list),
 * shown by loading.tsx while a dashboard page fetches its data.
 */
export function DashboardSkeleton({
  withHeader = true,
  withTabs = false,
}: {
  /** Off inside the admin panel, whose layout already draws the header. */
  withHeader?: boolean;
  withTabs?: boolean;
}) {
  const body = (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading your dashboard…</span>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-navy-900/7 bg-white/85 p-5 shadow-soft backdrop-blur-sm"
          >
            <Bone className="h-3 w-24" />
            <Bone className="mt-4 h-7 w-16" />
          </div>
        ))}
      </div>

      <Bone className="mt-12 h-6 w-48" />
      <div className="mt-5 grid gap-4">
        {Array.from({ length: 3 }, (_, i) => (
          <CardBones key={i} />
        ))}
      </div>
    </div>
  );

  if (!withHeader) return body;

  return (
    <div className="relative pb-24 pt-28 md:pt-36">
      <div className="container-page">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0 flex-1">
            <Bone className="h-7 w-28" />
            <Bone className="mt-5 h-9 w-full max-w-sm" />
            <Bone className="mt-3 h-4 w-full max-w-md" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Bone className="h-10 w-32" />
            <Bone className="h-10 w-28" />
          </div>
        </div>
        <Bone className="mt-7 h-3.5 w-64 max-w-full" />

        {withTabs && (
          <div className="mt-6 flex flex-wrap gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <Bone key={i} className="h-9 w-24" />
            ))}
          </div>
        )}

        <div className="mt-10">{body}</div>
      </div>
    </div>
  );
}
