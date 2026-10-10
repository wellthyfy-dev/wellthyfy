"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";
import { fieldClass, labelClass } from "./AuthForm";

/** Password input with a show/hide toggle. */
export default function PasswordField({
  name = "password",
  label = "Password",
  placeholder,
  autoComplete = "current-password",
  minLength,
  rightSlot,
}: {
  name?: string;
  label?: string;
  placeholder?: string;
  autoComplete?: string;
  minLength?: number;
  /** Rendered on the label row — used for the "Forgot password?" link. */
  rightSlot?: React.ReactNode;
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className={`${labelClass} mb-0`}>
          {label}
        </label>
        {rightSlot}
      </div>

      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={`${fieldClass} pr-12`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-xl text-ink-soft transition-colors hover:text-navy-800 focus-visible:outline-navy-700"
        >
          {visible ? (
            <EyeOff className="size-4.5" strokeWidth={2} />
          ) : (
            <Eye className="size-4.5" strokeWidth={2} />
          )}
        </button>
      </div>
    </div>
  );
}
