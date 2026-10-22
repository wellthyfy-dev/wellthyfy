"use client";

import {
  AlertCircle,
  CheckCircle2,
  FileCheck2,
  GraduationCap,
  Loader2,
  Send,
  UserRound,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ID_UPLOAD } from "@/lib/faculty";
import { createClient } from "@/lib/supabase/client";
import { fieldClass, labelClass } from "./AuthForm";
const ACCEPT = Object.keys(ID_UPLOAD.types).join(",");

function Section({
  icon: Icon,
  title,
  hint,
  children,
}: {
  icon: typeof UserRound;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-navy-900/7 bg-white/90 p-6 shadow-soft backdrop-blur-md sm:p-8">
      <div className="flex items-start gap-3.5">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-well-400 to-navy-700 text-white">
          <Icon className="size-5" strokeWidth={2} />
        </span>
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          {hint && <p className="mt-1 text-sm leading-relaxed text-ink-soft">{hint}</p>}
        </div>
      </div>
      <div className="mt-7 grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function FileInput({
  name,
  label,
  hint,
  accept = ACCEPT,
}: {
  name: string;
  label: string;
  hint: string;
  accept?: string;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div>
      <span className={labelClass}>{label}</span>
      <label
        htmlFor={name}
        className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-navy-900/20 bg-white px-4 py-3.5 text-sm transition-colors hover:border-well-400 hover:bg-well-50/50"
      >
        <Upload className="size-4.5 shrink-0 text-navy-600" strokeWidth={2} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-ink">{picked ?? "Choose a file"}</span>
          <span className="block text-xs text-ink-soft">{hint}</span>
        </span>
        {picked && <CheckCircle2 className="size-4.5 shrink-0 text-well-600" />}
      </label>
      <input
        id={name}
        name={name}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => setPicked(e.target.files?.[0]?.name ?? null)}
      />
    </div>
  );
}

export default function FacultyApplyForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);

    // Both PAN and Aadhaar (front and back) are required for verification.
    const file = (key: string) => {
      const v = form.get(key);
      return v instanceof File && v.size > 0 ? v : null;
    };
    const panFile = file("pan_card");
    const frontFile = file("id_front");
    const backFile = file("id_back");

    if (!panFile) {
      setError("Please upload your PAN card.");
      return;
    }
    if (!frontFile || !backFile) {
      setError("Please upload both the front and the back of your Aadhaar card.");
      return;
    }
    for (const f of [panFile, frontFile, backFile]) {
      if (!(f.type in ID_UPLOAD.types)) {
        setError("ID files must be a JPG, PNG, WebP or PDF.");
        return;
      }
      if (f.size > ID_UPLOAD.maxBytes) {
        setError("Each ID file must be under 5 MB.");
        return;
      }
    }
    setBusy(true);
    try {
      // The application id doubles as the storage folder, so the files and the
      // row are tied together before the applicant has an account.
      const id = crypto.randomUUID();
      const supabase = createClient();

      const upload = async (file: File, name: "id-front" | "id-back" | "pan") => {
        const ext = ID_UPLOAD.types[file.type as keyof typeof ID_UPLOAD.types];
        const path = `${id}/${name}.${ext}`;
        const { error } = await supabase.storage
          .from("applications")
          .upload(path, file, { upsert: false, contentType: file.type });
        if (error) throw new Error(`Could not upload your ID (${error.message}).`);
        return path;
      };

      const panPath = await upload(panFile, "pan");
      const frontPath = await upload(frontFile, "id-front");
      const backPath = await upload(backFile, "id-back");

      const text = (k: string) => String(form.get(k) ?? "");
      const res = await fetch("/api/faculty-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          company: text("company"),
          full_name: text("full_name"),
          contact_email: text("contact_email"),
          phone: text("phone"),
          whatsapp: text("whatsapp"),
          address: text("address"),
          qualification: text("qualification"),
          experience: text("experience"),
          pan_path: panPath,
          id_front_path: frontPath,
          id_back_path: backPath,
          consent: form.get("consent") === "on",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }
      setDone(text("contact_email"));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-well-200 bg-well-50 p-8 text-center sm:p-12">
        <CheckCircle2 className="mx-auto size-12 text-well-600" />
        <h2 className="mt-5 text-2xl font-semibold sm:text-3xl">Application received</h2>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-ink-soft">
          Thank you. Our team will review your details and ID, and we will email you
          at <span className="font-semibold text-ink">{done}</span> as soon as there is a
          decision.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white px-6 py-3 text-sm font-semibold text-navy-800 transition-colors hover:bg-navy-50"
        >
          Back to the website
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-7">
      {/* Honeypot: hidden from people, irresistible to bots */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] size-0 opacity-0"
      />

      <Section
        icon={UserRound}
        title="About you"
        hint="We use these details to contact you about your application."
      >
        <div>
          <label htmlFor="full_name" className={labelClass}>
            Full name
          </label>
          <input id="full_name" name="full_name" required autoComplete="name" maxLength={120} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="contact_email" className={labelClass}>
            Email
          </label>
          <input
            id="contact_email"
            name="contact_email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={fieldClass}
          />
          <p className="mt-1.5 text-xs text-ink-soft">
            We will send our decision here. A Wellthyfy mail id is issued after approval.
          </p>
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone number
          </label>
          <input id="phone" name="phone" type="tel" required inputMode="tel" autoComplete="tel" placeholder="+91 00000 00000" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="whatsapp" className={labelClass}>
            WhatsApp number
          </label>
          <input id="whatsapp" name="whatsapp" type="tel" inputMode="tel" placeholder="If different from above" className={fieldClass} />
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
            maxLength={500}
            placeholder="House / street, area, city, state, PIN"
            className={`${fieldClass} resize-y`}
          />
        </div>
      </Section>

      <Section
        icon={GraduationCap}
        title="Qualification"
        hint="Tell us what qualifies you to teach. You will add your course after you are approved."
      >
        <div className="sm:col-span-2">
          <label htmlFor="qualification" className={labelClass}>
            Your qualification
          </label>
          <textarea
            id="qualification"
            name="qualification"
            required
            rows={3}
            maxLength={1000}
            placeholder="Degrees, diplomas and certifications — e.g. B.Sc. Nutrition; RYT-200 certified yoga teacher."
            className={`${fieldClass} resize-y`}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="experience" className={labelClass}>
            Teaching experience <span className="font-normal text-ink-soft">(optional)</span>
          </label>
          <textarea
            id="experience"
            name="experience"
            rows={4}
            maxLength={3000}
            placeholder="Where and what you have taught, and for how long."
            className={`${fieldClass} resize-y`}
          />
        </div>
      </Section>

      <Section
        icon={FileCheck2}
        title="PAN & Aadhaar verification"
        hint="Both are required. Used only to verify who you are. It is stored privately and visible to Wellthyfy administrators only — never shown on the website."
      >
        <div className="sm:col-span-2">
          <FileInput name="pan_card" label="PAN card" hint="JPG, PNG, WebP or PDF · max 5 MB" />
        </div>
        <FileInput name="id_front" label="Aadhaar card — front" hint="JPG, PNG, WebP or PDF · max 5 MB" />
        <FileInput name="id_back" label="Aadhaar card — back" hint="JPG, PNG, WebP or PDF · max 5 MB" />
      </Section>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-well-200 bg-well-50/60 p-5">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-0.5 size-4.5 shrink-0 rounded border-navy-300 text-well-600 focus:ring-well-500"
        />
        <span className="text-sm leading-relaxed text-ink-soft">
          I confirm the details above are true and that the PAN and Aadhaar cards I have uploaded are mine. I agree to
          Wellthyfy processing my information to review this application, as described in the{" "}
          <Link
            href="/privacy-policy"
            target="_blank"
            className="font-semibold text-navy-800 underline underline-offset-4"
          >
            Privacy Policy
          </Link>
          .
        </span>
      </label>

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
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-well-600 via-well-500 to-navy-700 px-7 py-4 text-base font-semibold text-white shadow-glow-green transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift disabled:translate-y-0 disabled:opacity-70"
      >
        {busy ? (
          <>
            <Loader2 className="size-4.5 animate-spin" />
            Submitting…
          </>
        ) : (
          <>
            Submit application
            <Send className="size-4.5" />
          </>
        )}
      </button>
    </form>
  );
}
