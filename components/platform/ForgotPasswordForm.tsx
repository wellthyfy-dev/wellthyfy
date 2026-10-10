"use client";

import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { fieldClass, labelClass } from "./AuthForm";

export default function ForgotPasswordForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();

    setBusy(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setError(
        error.message.toLowerCase().includes("rate limit")
          ? "Too many emails have gone out recently. Please try again shortly."
          : error.message,
      );
      setBusy(false);
      return;
    }

    // Always report success: revealing which addresses exist would leak accounts.
    setSent(true);
    setBusy(false);
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-well-200 bg-well-50 p-5">
        <CheckCircle2 className="size-6 text-well-600" />
        <p className="mt-3 font-semibold text-ink">Check your email</p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
          If an account exists for that address, a password reset link is on its way. Open it and
          you will be able to set a new password.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className={fieldClass}
        />
        <p className="mt-1.5 text-xs text-ink-soft">
          We will send a reset link to the address you signed up with.
        </p>
      </div>

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
            Sending…
          </>
        ) : (
          <>
            Send reset link
            <Send className="size-4.5" />
          </>
        )}
      </button>
    </form>
  );
}
