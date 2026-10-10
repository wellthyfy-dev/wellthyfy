"use client";

import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import PasswordField from "./PasswordField";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");

    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }

    setBusy(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <PasswordField
        label="New password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        minLength={8}
      />
      <PasswordField
        name="confirm"
        label="Confirm new password"
        autoComplete="new-password"
        placeholder="Type it again"
        minLength={8}
      />

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
        >
          <AlertCircle className="mt-0.5 size-4.5 shrink-0 text-red-600" />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-well-600 via-well-500 to-navy-700 px-7 py-3.5 text-base font-semibold text-white shadow-glow-green transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift disabled:translate-y-0 disabled:opacity-70"
      >
        {busy ? (
          <>
            <Loader2 className="size-4.5 animate-spin" />
            Updating…
          </>
        ) : (
          <>
            Set new password
            <ShieldCheck className="size-4.5" />
          </>
        )}
      </button>
    </form>
  );
}
