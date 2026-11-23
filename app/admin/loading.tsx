import { DashboardSkeleton } from "@/components/platform/DashboardSkeleton";

/** Inside the admin layout, which already draws the header and tabs. */
export default function AdminLoading() {
  return <DashboardSkeleton withHeader={false} />;
}
