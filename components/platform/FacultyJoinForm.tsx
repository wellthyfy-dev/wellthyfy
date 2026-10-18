"use client";

import { AlertCircle, CheckCircle2, Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { fieldClass, labelClass } from "./AuthForm";
import PasswordField from "./PasswordField";

/**
 * Account creation for an approved faculty member.
 *
 * The invitation token travels in the signup metadata. The database trigger is
 * what actually enforces it: it only creates a faculty profile when the mail id
 * AND the token both match an approved application. This form just carries them.
 */
export default function FacultyJoinForm({
  token,
  email,
  fullName,
}: {
  token: string;
  email: string;
  fullName: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

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

    const { data, error } = await createClient().auth.signUp({
      email,
      password,
      options: {
        data: { role: "faculty", full_name: fullName, invite_token: token },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      setError(
        /database error|invitation/i.test(error.message)
          ? "We could not create this account. Faculty accounts need the approved Wellthyfy mail id and your private invitation link."
          : error.message,
      );
      setBusy(false);
      return;
    }

    if (!data.session) {
      setCheckEmail(true);
      setBusy(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  if (checkEmail) {
    return (
      <div className="rounded-2xl border border-well-200 bg-well-50 p-5">
        <CheckCircle2 className="size-6 text-well-600" />
        <p className="mt-3 font-semibold text-ink">Confirm your Wellthyfy mail</p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
          We sent a confirmation link to{" "}
          <span className="font-semibold text-ink">{email}</span>. Open that mailbox, click the
          link, and you will land in your faculty dashboard.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div>
        <label htmlFor="name" className={labelClass}>
          Name
        </label>
        <input
          id="name"
          type="text"
          value={fullName}
          readOnly
          className={`${fieldClass} cursor-not-allowed bg-navy-50/60 text-ink-soft`}
        />
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Your Wellthyfy mail id
        </label>
        <input
          id="email"
          type="email"
          value={email}
          readOnly
          className={`${fieldClass} cursor-not-allowed bg-navy-50/60 text-ink-soft`}
        />
        <p className="mt-1.5 text-xs text-ink-soft">
          Assigned to you on approval. The confirmation email is sent here.
        </p>
      </div>

      <PasswordField
        label="Choose a password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        minLength={8}
      />
      <PasswordField
        name="confirm"
        label="Confirm password"
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
            Creating account…
          </>
        ) : (
          <>
            Create faculty account
            <UserPlus className="size-4.5" />
          </>
        )}
      </button>
    </form>
  );
}
