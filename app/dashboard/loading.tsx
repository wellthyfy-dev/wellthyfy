import { DashboardSkeleton } from "@/components/platform/DashboardSkeleton";

/** Shown instantly while any /dashboard page loads its data. */
export default function DashboardLoading() {
  return <DashboardSkeleton />;
}
