import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import AdminTabs from "@/components/platform/AdminTabs";
import { requireAdmin } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { supabase, profile } = await requireAdmin();

  const [apps, payments] = await Promise.all([
    supabase
      .from("faculty_applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  return (
    <div className="relative pb-24 pt-28 md:pt-36">
      <div className="container-page">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-navy-700 to-navy-900 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
              <ShieldCheck className="size-3.5" strokeWidth={2.4} />
              Admin
            </span>
            <h1 className="mt-4 text-3xl font-semibold leading-[1.12] sm:text-4xl">
              Wellthyfy admin
            </h1>
            <p className="mt-2 text-sm text-ink-soft">
              Signed in as{" "}
              <span className="font-semibold text-ink" title={profile.email}>
                {profile.full_name?.trim() || profile.email}
              </span>
            </p>
          </div>

          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-full border border-navy-200 bg-white/80 px-4 py-2.5 text-sm font-semibold text-navy-800 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft"
            >
              Sign out
            </button>
          </form>
        </div>

        <AdminTabs
          tabs={[
            { href: "/admin", label: "Overview" },
            { href: "/admin/applications", label: "Applications", badge: apps.count ?? 0 },
            { href: "/admin/payments", label: "Payments", badge: payments.count ?? 0 },
            { href: "/admin/courses", label: "Courses" },
          ]}
        />

        <div className="mt-10">{children}</div>
      </div>
    </div>
  );
}
