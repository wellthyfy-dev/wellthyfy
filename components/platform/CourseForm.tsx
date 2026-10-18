"use client";

import { AlertCircle, Loader2, Plus, Save } from "lucide-react";
import { useActionState } from "react";
import {
  createCourse,
  updateCourse,
  type CourseFormState,
} from "@/app/dashboard/faculty/actions";
import { MODE_LABELS, type Course, type CourseMode } from "@/lib/platform";
import { fieldClass, labelClass } from "./AuthForm";
import BannerUpload from "./BannerUpload";
import CategoryFields from "./CategoryFields";
import ModulesPdfUpload from "./ModulesPdfUpload";

const MODES = Object.keys(MODE_LABELS) as CourseMode[];

export default function CourseForm({ course }: { course?: Course }) {
  const editing = Boolean(course);
  const [state, formAction, pending] = useActionState<CourseFormState, FormData>(
    editing ? updateCourse : createCourse,
    { error: null },
  );

  return (
    <form action={formAction} className="grid gap-5 sm:grid-cols-2">
      {course && <input type="hidden" name="id" value={course.id} />}
      <CategoryFields category={course?.category} subcategory={course?.subcategory} />

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

      <ModulesPdfUpload initialPath={course?.modules_pdf_path ?? ""} />

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
