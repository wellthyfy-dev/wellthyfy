"use client";

import { AlertCircle, Crop, ImagePlus, Loader2, RefreshCw, X, ZoomIn, ZoomOut } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { createClient } from "@/lib/supabase/client";
import { labelClass } from "./AuthForm";

/** Source images can be large — they are re-encoded at banner size after cropping. */
const MAX_SOURCE_BYTES = 15 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const OUT_W = 1200;
const OUT_H = 600;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("That image could not be read."));
    img.src = src;
  });
}

/** Draws the chosen area onto a 1200×600 canvas and returns it as a JPEG. */
async function cropToBlob(src: string, area: Area) {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = OUT_W;
  canvas.height = OUT_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser could not crop the image.");
  ctx.fillStyle = "#ffffff"; // transparent PNGs would otherwise turn black
  ctx.fillRect(0, 0, OUT_W, OUT_H);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, OUT_W, OUT_H);
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not crop the image."))),
      "image/jpeg",
      0.88,
    ),
  );
}

/**
 * Course banner picker with a crop step.
 *
 * The chosen image opens in a 2:1 cropper; the cropped 1200×600 result is
 * uploaded straight from the browser to the public `course-covers` bucket and
 * its URL travels in a hidden input. Going direct avoids pushing image bytes
 * through a Server Action, which has a 1 MB body limit by default.
 */
export default function BannerUpload({ initialUrl = "" }: { initialUrl?: string }) {
  const [url, setUrl] = useState(initialUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Crop dialog state
  const [source, setSource] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const closeCropper = useCallback(() => {
    setSource((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  // Esc closes the dialog; the page behind it should not scroll.
  useEffect(() => {
    if (!source) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) closeCropper();
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [source, busy, closeCropper]);

  function pickFile(file: File) {
    setError(null);
    if (!ACCEPTED.includes(file.type)) {
      setError("Use a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > MAX_SOURCE_BYTES) {
      setError("That image is over 15 MB. Please choose a smaller one.");
      return;
    }
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setArea(null);
    setSource(URL.createObjectURL(file));
  }

  async function confirmCrop() {
    if (!source || !area) return;
    if (!userId) {
      setError("Still signing you in — try again in a moment.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const blob = await cropToBlob(source, area);
      const supabase = createClient();
      // First path segment must be the user id — the storage policy keys on it.
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("course-covers")
        .upload(path, blob, { upsert: false, contentType: "image/jpeg" });
      if (uploadError) throw new Error(`Could not upload the banner: ${uploadError.message}`);

      setUrl(supabase.storage.from("course-covers").getPublicUrl(path).data.publicUrl);
      closeCropper();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload the banner.");
    } finally {
      setBusy(false);
    }
  }

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept={ACCEPTED.join(",")}
      className="sr-only"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) pickFile(file);
      }}
    />
  );

  return (
    <div className="sm:col-span-2">
      <span className={labelClass}>Banner image</span>
      <input type="hidden" name="cover_url" value={url} />

      {url ? (
        <div className="relative overflow-hidden rounded-2xl border border-navy-900/10">
          <Image
            src={url}
            alt="Course banner preview"
            width={OUT_W}
            height={OUT_H}
            className="aspect-[2/1] w-full object-cover"
            unoptimized
          />
          <div className="absolute right-3 top-3 flex gap-2">
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-navy-800 shadow-sm backdrop-blur-sm transition-colors hover:bg-white">
              <RefreshCw className="size-3.5" strokeWidth={2.6} />
              Change
              {fileInput}
            </label>
            <button
              type="button"
              onClick={() => {
                setUrl("");
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-navy-800 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
            >
              <X className="size-3.5" strokeWidth={2.6} />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-navy-900/20 bg-white px-4 py-9 text-center transition-colors hover:border-well-400 hover:bg-well-50/50">
          <ImagePlus className="size-6 text-navy-600" strokeWidth={1.9} />
          <span className="text-sm font-semibold text-ink">Choose a banner image</span>
          <span className="text-xs text-ink-soft">
            JPG, PNG or WebP · you can crop it before uploading
          </span>
          {fileInput}
        </label>
      )}

      {error && !source && (
        <p role="alert" className="mt-2 flex items-start gap-2 text-xs font-medium text-red-700">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          {error}
        </p>
      )}

      {source && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="crop-title"
          className="fixed inset-0 z-[80] flex items-end justify-center bg-navy-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-t-3xl bg-white shadow-lift sm:rounded-3xl">
            <div className="flex items-center justify-between gap-3 border-b border-navy-900/8 px-5 py-4 sm:px-6">
              <div>
                <h2 id="crop-title" className="text-lg font-semibold">
                  Crop your banner
                </h2>
                <p className="text-xs text-ink-soft">
                  Drag to position, zoom to fit. Banners are shown at 2:1.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCropper}
                disabled={busy}
                aria-label="Cancel cropping"
                className="grid size-9 shrink-0 place-items-center rounded-full border border-navy-200 text-navy-800 transition-colors hover:bg-navy-50 disabled:opacity-50"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="relative aspect-[4/3] w-full bg-navy-950 sm:aspect-[16/10]">
              <Cropper
                image={source}
                crop={crop}
                zoom={zoom}
                minZoom={1}
                maxZoom={4}
                aspect={2}
                objectFit="contain"
                showGrid
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, pixels) => setArea(pixels)}
              />
            </div>

            <div className="grid gap-4 px-5 py-5 sm:px-6">
              <label className="flex items-center gap-3">
                <ZoomOut className="size-4 shrink-0 text-ink-soft" aria-hidden="true" />
                <span className="sr-only">Zoom</span>
                <input
                  type="range"
                  min={1}
                  max={4}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer accent-well-600"
                />
                <ZoomIn className="size-4 shrink-0 text-ink-soft" aria-hidden="true" />
              </label>

              {error && (
                <p role="alert" className="flex items-start gap-2 text-xs font-medium text-red-700">
                  <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                  {error}
                </p>
              )}

              <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeCropper}
                  disabled={busy}
                  className="rounded-full border border-navy-200 bg-white px-5 py-2.5 text-sm font-semibold text-navy-800 transition-colors hover:bg-navy-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmCrop}
                  disabled={busy || !area}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-well-600 to-navy-700 px-5 py-2.5 text-sm font-semibold text-white shadow-glow-green transition-all duration-300 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-70"
                >
                  {busy ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <Crop className="size-4" />
                      Crop &amp; use image
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
