"use client";

import { AlertCircle, ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { labelClass } from "./AuthForm";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

/**
 * Course banner picker.
 *
 * Uploads straight from the browser to the public `course-covers` bucket as
 * soon as a file is chosen, then carries the resulting URL in a hidden input.
 * Going direct avoids pushing image bytes through a Server Action, which has a
 * 1 MB body limit by default.
 */
export default function BannerUpload({ initialUrl = "" }: { initialUrl?: string }) {
  const [url, setUrl] = useState(initialUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  async function handleFile(file: File) {
    setError(null);

    if (!ACCEPTED.includes(file.type)) {
      setError("Use a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("The banner must be under 5 MB.");
      return;
    }
    if (!userId) {
      setError("Still signing you in — try again in a moment.");
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    // First path segment must be the user id — the storage policy keys on it.
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("course-covers")
      .upload(path, file, { upsert: false, contentType: file.type });

    if (uploadError) {
      setError(`Could not upload the banner: ${uploadError.message}`);
      setBusy(false);
      return;
    }

    const { data } = supabase.storage.from("course-covers").getPublicUrl(path);
    setUrl(data.publicUrl);
    setBusy(false);
  }

  return (
    <div className="sm:col-span-2">
      <span className={labelClass}>Banner image</span>
      <input type="hidden" name="cover_url" value={url} />

      {url ? (
        <div className="relative overflow-hidden rounded-2xl border border-navy-900/10">
          <Image
            src={url}
            alt="Course banner preview"
            width={1200}
            height={600}
            className="h-44 w-full object-cover"
            unoptimized
          />
          <button
            type="button"
            onClick={() => {
              setUrl("");
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-navy-800 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
          >
            <X className="size-3.5" strokeWidth={2.6} />
            Remove
          </button>
        </div>
      ) : (
        <label
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-navy-900/20 bg-white px-4 py-9 text-center transition-colors hover:border-well-400 hover:bg-well-50/50 ${
            busy ? "pointer-events-none opacity-70" : ""
          }`}
        >
          {busy ? (
            <Loader2 className="size-6 animate-spin text-navy-600" />
          ) : (
            <ImagePlus className="size-6 text-navy-600" strokeWidth={1.9} />
          )}
          <span className="text-sm font-semibold text-ink">
            {busy ? "Uploading…" : "Choose a banner image"}
          </span>
          <span className="text-xs text-ink-soft">
            JPG, PNG or WebP · max 5 MB · looks best at 1200×600
          </span>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>
      )}

      {error && (
        <p
          role="alert"
          className="mt-2 flex items-start gap-2 text-xs font-medium text-red-700"
        >
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
