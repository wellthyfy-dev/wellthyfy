"use client";

import { AlertCircle, FileText, FileUp, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MODULES_PDF, modulesPdfUrl } from "@/lib/platform";
import { createClient } from "@/lib/supabase/client";
import { labelClass } from "./AuthForm";

/**
 * Course modules picker: one PDF outlining the modules.
 *
 * Like BannerUpload, the file goes straight from the browser to the public
 * `course-modules` bucket and only its storage path travels with the form.
 */
export default function ModulesPdfUpload({ initialPath = "" }: { initialPath?: string }) {
  const [path, setPath] = useState(initialPath);
  const [fileName, setFileName] = useState<string | null>(null);
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

    if (file.type !== "application/pdf") {
      setError("Upload your modules as a PDF.");
      return;
    }
    if (file.size > MODULES_PDF.maxBytes) {
      setError("The PDF must be under 10 MB.");
      return;
    }
    if (!userId) {
      setError("Still signing you in — try again in a moment.");
      return;
    }

    setBusy(true);
    // First path segment must be the user id — the storage policy keys on it.
    const next = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.pdf`;
    const { error: uploadError } = await createClient()
      .storage.from(MODULES_PDF.bucket)
      .upload(next, file, { upsert: false, contentType: "application/pdf" });

    if (uploadError) {
      setError(`Could not upload the PDF: ${uploadError.message}`);
      setBusy(false);
      return;
    }

    setPath(next);
    setFileName(file.name);
    setBusy(false);
  }

  const url = modulesPdfUrl(path);

  return (
    <div className="sm:col-span-2">
      <span className={labelClass}>Modules (PDF)</span>
      <input type="hidden" name="modules_pdf_path" value={path} />

      {path && url ? (
        <div className="flex items-center gap-3 rounded-2xl border border-well-200 bg-well-50/60 px-4 py-3.5">
          <FileText className="size-5 shrink-0 text-well-700" strokeWidth={2} />
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 truncate text-sm font-semibold text-navy-800 underline underline-offset-4"
          >
            {fileName ?? "Current modules PDF"}
          </a>
          <button
            type="button"
            onClick={() => {
              setPath("");
              setFileName(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-navy-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-800 transition-colors hover:bg-navy-50"
          >
            <X className="size-3.5" strokeWidth={2.6} />
            Remove
          </button>
        </div>
      ) : (
        <label
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-navy-900/20 bg-white px-4 py-8 text-center transition-colors hover:border-well-400 hover:bg-well-50/50 ${
            busy ? "pointer-events-none opacity-70" : ""
          }`}
        >
          {busy ? (
            <Loader2 className="size-6 animate-spin text-navy-600" />
          ) : (
            <FileUp className="size-6 text-navy-600" strokeWidth={1.9} />
          )}
          <span className="text-sm font-semibold text-ink">
            {busy ? "Uploading…" : "Upload your modules PDF"}
          </span>
          <span className="text-xs text-ink-soft">PDF only · max 10 MB</span>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>
      )}

      <p className="mt-1.5 text-xs text-ink-soft">
        Optional. Students can download it from the course page to see what each module covers.
      </p>

      {error && (
        <p role="alert" className="mt-2 flex items-start gap-2 text-xs font-medium text-red-700">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
