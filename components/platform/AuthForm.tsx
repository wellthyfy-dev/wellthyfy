"use client";

import { AlertCircle, CheckCircle2, Loader2, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import PasswordField from "./PasswordField";
import type { UserRole } from "@/lib/platform";

export const fieldClass =
  "w-full rounded-xl border border-navy-900/10 bg-white px-4 py-3 text-[0.95rem] text-ink shadow-sm outline-none transition-all duration-200 placeholder:text-ink-soft/55 focus:border-well-400 focus:ring-4 focus:ring-well-500/12";

export const labelClass = "mb-1.5 block text-sm font-medium text-ink";

export default function AuthForm({
  mode,
  role,
  next,
  requiredDomain,
}: {
  mode: "login" | "signup";
  role: UserRole;
  next?: string;
  /** Reject any other mail domain before even calling Supabase. */
  requiredDomain?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const fullName = String(form.get("full_name") ?? "").trim();

    if (requiredDomain && !email.toLowerCase().endsWith(`@${requiredDomain}`)) {
      setError(`Use your Wellthyfy faculty mail id (it ends in @${requiredDomain}).`);
      return;
    }

    setBusy(true);
    setError(null);
    const supabase = createClient();

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Read by the handle_new_user() trigger to seed public.profiles.
          data: { role, full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
            next ?? "/onboarding",
          )}`,
        },
      });

      if (error) {
        setError(error.message);
        setBusy(false);
        return;
      }

      // No session means Supabase is waiting on email confirmation.
      if (!data.session) {
        setCheckEmail(true);
        setBusy(false);
        return;
      }
      router.push(next ?? "/onboarding");
      router.refresh();
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "That email and password do not match an account."
          : error.message,
      );
      setBusy(false);
      return;
    }
    router.push(next ?? "/dashboard");
    router.refresh();
  }

  if (checkEmail) {
    return (
      <div className="rounded-2xl border border-well-200 bg-well-50 p-5">
        <CheckCircle2 className="size-6 text-well-600" />
        <p className="mt-3 font-semibold text-ink">Check your email</p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
          We sent you a confirmation link. Open it to activate your account, then you will be
          taken straight to your profile setup.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {mode === "signup" && (
        <div>
          <label htmlFor="full_name" className={labelClass}>
            Full name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            autoComplete="name"
            placeholder="Your name"
            className={fieldClass}
          />
        </div>
      )}

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
          placeholder={requiredDomain ? `you@${requiredDomain}` : "you@example.com"}
          className={fieldClass}
        />
      </div>

      <PasswordField
        minLength={8}
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
        placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
        rightSlot={
          mode === "login" ? (
            <Link
              href={`/forgot-password?role=${role}`}
              className="text-xs font-medium text-navy-800 underline underline-offset-4 transition-colors hover:text-well-700"
            >
              Forgot password?
            </Link>
          ) : undefined
        }
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
            Please wait…
          </>
        ) : mode === "signup" ? (
          <>
            Create account
            <UserPlus className="size-4.5" />
          </>
        ) : (
          <>
            Sign in
            <LogIn className="size-4.5" />
          </>
        )}
      </button>
    </form>
  );
}
