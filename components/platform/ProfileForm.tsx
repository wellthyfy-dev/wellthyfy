"use client";

import { AlertCircle, CheckCircle2, Loader2, ShieldCheck, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/platform";
import { fieldClass, labelClass } from "./AuthForm";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

function FileField({
  id,
  label,
  hint,
  existing,
}: {
  id: string;
  label: string;
  hint: string;
  existing: string | null;
}) {
  const [name, setName] = useState<string | null>(null);

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <label
        htmlFor={id}
        className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-navy-900/20 bg-white px-4 py-3.5 text-sm transition-colors hover:border-well-400 hover:bg-well-50/50"
      >
        <Upload className="size-4.5 shrink-0 text-navy-600" strokeWidth={2} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-ink">
            {name ?? (existing ? "Replace uploaded file" : "Choose a file")}
          </span>
          <span className="block text-xs text-ink-soft">{hint}</span>
        </span>
        {existing && !name && (
          <CheckCircle2 className="size-4.5 shrink-0 text-well-600" aria-label="Already uploaded" />
        )}
      </label>
      <input
        id={id}
        name={id}
        type="file"
        accept={ACCEPTED.join(",")}
        className="sr-only"
        onChange={(e) => setName(e.target.files?.[0]?.name ?? null)}
      />
    </div>
  );
}

export default function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);

    const supabase = createClient();

    try {
      const uploadIfPresent = async (field: string, slot: "front" | "back") => {
        const file = form.get(field);
        if (!(file instanceof File) || file.size === 0) return null;
        if (file.size > MAX_BYTES) throw new Error(`${slot} image must be under 5 MB.`);
        if (!ACCEPTED.includes(file.type)) throw new Error("Use a JPG, PNG, WebP or PDF file.");

        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        // First path segment must be the user id — the storage RLS policy keys on it.
        const path = `${profile.id}/aadhaar-${slot}.${ext}`;
        const { error } = await supabase.storage
          .from("kyc")
          .upload(path, file, { upsert: true, contentType: file.type });
        if (error) throw new Error(`Could not upload the ${slot} image: ${error.message}`);
        return path;
      };

      const frontPath = (await uploadIfPresent("aadhaar_front", "front")) ?? profile.aadhaar_front_path;
      const backPath = (await uploadIfPresent("aadhaar_back", "back")) ?? profile.aadhaar_back_path;

      const payload = {
        full_name: String(form.get("full_name") ?? "").trim(),
        phone: String(form.get("phone") ?? "").trim(),
        whatsapp: String(form.get("whatsapp") ?? "").trim(),
        address: String(form.get("address") ?? "").trim(),
        aadhaar_front_path: frontPath,
        aadhaar_back_path: backPath,
        profile_completed: true,
      };

      const { error: updateError } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", profile.id);

      if (updateError) throw new Error(updateError.message);

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor="full_name" className={labelClass}>
          Full name
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          defaultValue={profile.full_name ?? ""}
          autoComplete="name"
          className={fieldClass}
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          type="email"
          value={profile.email}
          readOnly
          className={`${fieldClass} cursor-not-allowed bg-navy-50/60 text-ink-soft`}
        />
        <p className="mt-1.5 text-xs text-ink-soft">This is the address you signed in with.</p>
      </div>

      <div>
        <label htmlFor="phone" className={labelClass}>
          Phone number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          inputMode="tel"
          defaultValue={profile.phone ?? ""}
          placeholder="+91 00000 00000"
          autoComplete="tel"
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="whatsapp" className={labelClass}>
          WhatsApp number
        </label>
        <input
          id="whatsapp"
          name="whatsapp"
          type="tel"
          required
          inputMode="tel"
          defaultValue={profile.whatsapp ?? ""}
          placeholder="+91 00000 00000"
          className={fieldClass}
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="address" className={labelClass}>
          Address
        </label>
        <textarea
          id="address"
          name="address"
          required
          rows={3}
          defaultValue={profile.address ?? ""}
          placeholder="House / street, area, city, state, PIN"
          className={`${fieldClass} resize-y`}
        />
      </div>

      {/* KYC */}
      <div className="sm:col-span-2">
        <div className="rounded-2xl border border-navy-900/7 bg-navy-50/40 p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <ShieldCheck className="size-4.5 text-navy-700" strokeWidth={2} />
            Aadhaar card
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
            Upload a clear photo of the front and back. These files go to a private bucket that
            only you and Wellthyfy administrators can open — they are never shown publicly and are
            not readable by other users.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FileField
              id="aadhaar_front"
              label="Front side"
              hint="JPG, PNG, WebP or PDF · max 5 MB"
              existing={profile.aadhaar_front_path}
            />
            <FileField
              id="aadhaar_back"
              label="Back side"
              hint="JPG, PNG, WebP or PDF · max 5 MB"
              existing={profile.aadhaar_back_path}
            />
          </div>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 sm:col-span-2"
        >
          <AlertCircle className="mt-0.5 size-4.5 shrink-0 text-red-600" />
          {error}
        </p>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-well-600 via-well-500 to-navy-700 px-7 py-4 text-base font-semibold text-white shadow-glow-green transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift disabled:translate-y-0 disabled:opacity-70"
        >
          {busy ? (
            <>
              <Loader2 className="size-4.5 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              Save and continue
              <CheckCircle2 className="size-4.5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
