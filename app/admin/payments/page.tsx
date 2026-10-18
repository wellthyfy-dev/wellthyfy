import { BadgeCheck, X } from "lucide-react";
import { EmptyState } from "@/components/platform/DashboardShell";
import { cn } from "@/lib/accents";
import { STATUS_LABELS, formatINR, type Order } from "@/lib/platform";
import { requireAdmin } from "@/lib/supabase/auth";
import { setOrderStatusAdmin } from "../actions";

const TONE: Record<string, string> = {
  pending: "bg-gold-50 text-gold-800 border-gold-200",
  verified: "bg-well-50 text-well-800 border-well-200",
  rejected: "bg-red-50 text-red-800 border-red-200",
};

function OrdersTable({ orders, actions }: { orders: Order[]; actions: boolean }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-navy-900/7 bg-white/85 shadow-soft backdrop-blur-sm">
      <table className="w-full min-w-[52rem] text-left text-sm">
        <thead className="border-b border-navy-900/7 text-[11px] uppercase tracking-[0.14em] text-navy-700/60">
          <tr>
            <th className="px-5 py-3.5 font-semibold">Student</th>
            <th className="px-5 py-3.5 font-semibold">Course</th>
            <th className="px-5 py-3.5 font-semibold">Amount</th>
            <th className="px-5 py-3.5 font-semibold">UTR</th>
            <th className="px-5 py-3.5 font-semibold">Status</th>
            {actions && <th className="px-5 py-3.5 font-semibold">Action</th>}
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-navy-900/5 last:border-0">
              <td className="px-5 py-4">
                <p className="font-medium text-ink">{o.student_name ?? "Student"}</p>
                {o.student_email && <p className="mt-0.5 text-xs text-ink-soft">{o.student_email}</p>}
              </td>
              <td className="px-5 py-4">
                <p className="font-medium text-ink">{o.course_title}</p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  {new Date(o.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </td>
              <td className="px-5 py-4 font-semibold text-navy-800">{formatINR(o.amount_inr)}</td>
              <td className="px-5 py-4 font-mono text-xs text-ink-soft">{o.utr}</td>
              <td className="px-5 py-4">
                <span
                  className={cn(
                    "inline-block rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                    TONE[o.status],
                  )}
                >
                  {STATUS_LABELS[o.status]}
                </span>
              </td>
              {actions && (
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <form action={setOrderStatusAdmin}>
                      <input type="hidden" name="id" value={o.id} />
                      <input type="hidden" name="status" value="verified" />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-well-600 to-well-700 px-3.5 py-1.5 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5"
                      >
                        <BadgeCheck className="size-3.5" strokeWidth={2.4} />
                        Verify
                      </button>
                    </form>
                    <form action={setOrderStatusAdmin}>
                      <input type="hidden" name="id" value={o.id} />
                      <input type="hidden" name="status" value="rejected" />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50"
                      >
                        <X className="size-3.5" strokeWidth={2.6} />
                        Reject
                      </button>
                    </form>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function PaymentsPage() {
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);

  const orders = (data ?? []) as Order[];
  const pending = orders.filter((o) => o.status === "pending");
  const settled = orders.filter((o) => o.status !== "pending");

  return (
    <>
      <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
        Students pay Wellthyfy by UPI and submit the UTR. Match each UTR against your bank
        statement, then verify it. Faculty can see their students but cannot change a payment.
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold sm:text-2xl">To verify</h2>
        <div className="mt-5">
          {pending.length === 0 ? (
            <EmptyState title="Nothing to verify" body="New payment references show up here." />
          ) : (
            <OrdersTable orders={pending} actions />
          )}
        </div>
      </section>

      {settled.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold sm:text-2xl">History</h2>
          <div className="mt-5">
            <OrdersTable orders={settled} actions={false} />
          </div>
        </section>
      )}
    </>
  );
}
