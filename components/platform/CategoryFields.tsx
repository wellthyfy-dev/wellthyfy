"use client";

import { useState } from "react";
import { cn } from "@/lib/accents";
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  OTHER_SUBCATEGORY,
  SUBCATEGORIES,
  type CourseCategory,
} from "@/lib/platform";
import { fieldClass, labelClass } from "./AuthForm";

/**
 * Category cards + subcategory select (+ free text for "Other").
 *
 * Returns a fragment so the three controls slot straight into the parent form's
 * two-column grid. Field names are `category`, `subcategory` and
 * `subcategory_other`; pass `category` / `subcategory` to prefill when editing.
 */
export default function CategoryFields({
  category: initialCategory = "wellness",
  subcategory: savedSubcategory,
}: {
  category?: CourseCategory;
  /** A previously saved value; anything outside the suggested list means "Other". */
  subcategory?: string;
}) {
  const known = savedSubcategory
    ? SUBCATEGORIES[initialCategory].includes(savedSubcategory)
    : false;

  const [category, setCategory] = useState<CourseCategory>(initialCategory);
  const [subcategory, setSubcategory] = useState(
    savedSubcategory ? (known ? savedSubcategory : OTHER_SUBCATEGORY) : "",
  );

  return (
    <>
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
          defaultValue={savedSubcategory && !known ? savedSubcategory : ""}
          placeholder="e.g. Sound Healing"
          className={cn(
            fieldClass,
            subcategory !== OTHER_SUBCATEGORY && "cursor-not-allowed bg-navy-50/60",
          )}
        />
      </div>
    </>
  );
}
