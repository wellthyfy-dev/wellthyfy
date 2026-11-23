"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/supabase/auth";

const UUID = /^[0-9a-f-]{36}$/i;

/** Attach a batch to one of the student's batch-less enrolments. */
export async function chooseBatch(formData: FormData) {
  const orderId = String(formData.get("order_id") ?? "");
  const batchId = String(formData.get("batch_id") ?? "");
  if (!UUID.test(orderId) || !UUID.test(batchId)) redirect("/dashboard/student?batch=missing");

  const { supabase } = await requireProfile();
  const { error } = await supabase.rpc("choose_batch", { p_order: orderId, p_batch: batchId });

  if (error) {
    const reason = /full/i.test(error.message)
      ? "full"
      : /not taking/i.test(error.message)
        ? "closed"
        : "failed";
    redirect(`/dashboard/student?batch=${reason}`);
  }

  revalidatePath("/dashboard/student");
  redirect("/dashboard/student?batch=joined#classes");
}
