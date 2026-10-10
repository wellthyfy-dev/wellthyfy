"use client";

import { AlertCircle, Loader2, Plus, Save } from "lucide-react";
import { useActionState, useState } from "react";
import {
  createCourse,
  updateCourse,
  type CourseFormState,
} from "@/app/dashboard/faculty/actions";
import { cn } from "@/lib/accents";
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  MODE_LABELS,
  OTHER_SUBCATEGORY,
  SUBCATEGORIES,
  type Course,
  type CourseCategory,
  type CourseMode,
} from "@/lib/platform";
import { fieldClass, labelClass } from "./AuthForm";
import BannerUpload from "./BannerUpload";

const MODES = Object.keys(MODE_LABELS) as CourseMode[];

export default function CourseForm({ course }: { course?: Course }) {
  const editing = Boolean(course);
  const initialCategory: CourseCategory = course?.category ?? "wellness";
  // A saved subcategory that is not in the suggested list came from "Other".
  const knownSub = course
    ? SUBCATEGORIES[initialCategory].includes(course.subcategory)
    : false;

  const [category, setCategory] = useState<CourseCategory>(initialCategory);
  const [subcategory, setSubcategory] = useState(
    course ? (knownSub ? course.subcategory : OTHER_SUBCATEGORY) : "",
  );
  const [state, formAction, pending] = useActionState<CourseFormState, FormData>(
    editing ? updateCourse : createCourse,
    { error: null },
  );

  return (
    <form action={formAction} className="grid gap-5 sm:grid-cols-2">
      {course && <input type="hidden" name="id" value={course.id} />}
      {/* Category picker */}
      <fieldset className="sm:col-span-2">
        <legend className={labelClass}>Category</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {CATEGORY_ORDER.map((key) => {
            const meta = CATEGORY_META[key];
            const selected = category === key;
            return (
              <label
                key={key}
                className={cn(
                  "cursor-pointer rounded-2xl border p-4 transition-all duration-300",
                  selected
                    ? "border-transparent bg-gradient-to-br text-white shadow-lift " +
                        (key === "wellness"
                          ? "from-well-400 to-well-600"
                          : key === "wealth"
                            ? "from-navy-500 to-navy-800"
                            : "from-gold-400 to-gold-600")
                    : "border-navy-900/10 bg-white hover:border-navy-300",
                )}
              >
                <input
                  type="radio"
                  name="category"
                  value={key}
                  checked={selected}
                  onChange={() => {
                    setCategory(key);
                    setSubcategory("");
                  }}
                  className="sr-only"
                />
                <span className="block font-display text-lg font-semibold">{meta.label}</span>
                <span
                  className={cn("mt-1 block text-xs", selected ? "text-white/85" : "text-ink-soft")}
                >
                  {meta.blurb}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Subcategory */}
      <div>
        <label htmlFor="subcategory" className={labelClass}>
          Subcategory
        </label>
        <select
          id="subcategory"
          name="subcategory"
          required
          value={subcategory}
          onChange={(e) => setSubcategory(e.target.value)}
          className={fieldClass}
        >
          <option value="" disabled>
            Choose a subcategory
          </option>
          {SUBCATEGORIES[category].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
          <option value={OTHER_SUBCATEGORY}>{OTHER_SUBCATEGORY} (type your own)</option>
        </select>
      </div>

      <div>
        <label htmlFor="subcategory_other" className={labelClass}>
          If Other, specify
        </label>
        <input
          id="subcategory_other"
          name="subcategory_other"
          type="text"
          disabled={subcategory !== OTHER_SUBCATEGORY}
          required={subcategory === OTHER_SUBCATEGORY}
          defaultValue={course && !knownSub ? course.subcategory : ""}
          placeholder="e.g. Sound Healing"
          className={cn(
            fieldClass,
            subcategory !== OTHER_SUBCATEGORY && "cursor-not-allowed bg-navy-50/60",
          )}
        />
      </div>

      <BannerUpload initialUrl={course?.cover_url ?? ""} />

      <div className="sm:col-span-2">
        <label htmlFor="title" className={labelClass}>
          Course title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={140}
          defaultValue={course?.title ?? ""}
          placeholder="e.g. Foundations of Mindful Investing"
          className={fieldClass}
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="summary" className={labelClass}>
          Short summary
        </label>
        <input
          id="summary"
          name="summary"
          type="text"
          maxLength={200}
          defaultValue={course?.summary ?? ""}
          placeholder="One line shown on the course card"
          className={fieldClass}
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={7}
          defaultValue={course?.description ?? ""}
          placeholder="What the course covers, who it is for, and what students walk away with."
          className={`${fieldClass} resize-y`}
        />
      </div>

      <div>
        <label htmlFor="mode" className={labelClass}>
          Mode of delivery
        </label>
        <select id="mode" name="mode" required defaultValue={course?.mode ?? ""} className={fieldClass}>
          <option value="" disabled>
            Choose a mode
          </option>
          {MODES.map((m) => (
            <option key={m} value={m}>
              {MODE_LABELS[m]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="price_inr" className={labelClass}>
          Price (INR)
        </label>
        <input
          id="price_inr"
          name="price_inr"
          type="number"
          min={0}
          step={1}
          defaultValue={course?.price_inr ?? 0}
          required
          className={fieldClass}
        />
        <p className="mt-1.5 text-xs text-ink-soft">Enter 0 to offer it free.</p>
      </div>

      <div>
        <label htmlFor="duration" className={labelClass}>
          Duration
        </label>
        <input
          id="duration"
          name="duration"
          type="text"
          maxLength={60}
          defaultValue={course?.duration ?? ""}
          placeholder="e.g. 6 weeks · 12 sessions"
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="level" className={labelClass}>
          Level
        </label>
        <select id="level" name="level" defaultValue={course?.level ?? ""} className={fieldClass}>
          <option value="">Not specified</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
          <option value="All levels">All levels</option>
        </select>
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="language" className={labelClass}>
          Language
        </label>
        <input
          id="language"
          name="language"
          type="text"
          maxLength={40}
          defaultValue={course?.language ?? ""}
          placeholder="e.g. English, Tamil"
          className={fieldClass}
        />
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-well-200 bg-well-50/60 p-4 sm:col-span-2">
        <input
          type="checkbox"
          name="publish"
          defaultChecked={course ? course.status === "published" : true}
          className="mt-0.5 size-4.5 rounded border-navy-300 text-well-600 focus:ring-well-500"
        />
        <span>
          <span className="block text-sm font-semibold text-ink">
            {editing ? "Keep this course published" : "Publish immediately"}
          </span>
          <span className="mt-0.5 block text-xs leading-relaxed text-ink-soft">
            {editing
              ? "Untick to pull it off the site and keep it as a draft."
              : "The course goes live on the Wellthyfy site straight away. Untick to save it as a draft you can publish later from your dashboard."}
          </span>
        </span>
      </label>

      {state.error && (
        <p
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 sm:col-span-2"
        >
          <AlertCircle className="mt-0.5 size-4.5 shrink-0 text-red-600" />
          {state.error}
        </p>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-well-600 via-well-500 to-navy-700 px-7 py-4 text-base font-semibold text-white shadow-glow-green transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift disabled:translate-y-0 disabled:opacity-70"
        >
          {pending ? (
            <>
              <Loader2 className="size-4.5 animate-spin" />
              Saving…
            </>
          ) : editing ? (
            <>
              Save changes
              <Save className="size-4.5" strokeWidth={2.2} />
            </>
          ) : (
            <>
              Create course
              <Plus className="size-4.5" strokeWidth={2.6} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
