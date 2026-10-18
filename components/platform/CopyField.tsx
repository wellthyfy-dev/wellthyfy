"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

/** A read-only value with a copy button. */
export default function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-700/60">
        {label}
      </p>
      <div className="mt-1.5 flex items-center gap-2">
        <input
          readOnly
          value={value}
          onFocus={(e) => e.currentTarget.select()}
          aria-label={label}
          className="min-w-0 flex-1 truncate rounded-xl border border-navy-900/10 bg-navy-50/50 px-3 py-2 font-mono text-xs text-ink-soft outline-none"
        />
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          }}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-navy-200 bg-white px-3 py-2 text-xs font-semibold text-navy-800 transition-colors hover:bg-navy-50"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-well-600" strokeWidth={2.6} />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
