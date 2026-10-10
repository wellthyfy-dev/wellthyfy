"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  OTHER_SUBCATEGORY,
  slugify,
  type CourseCategory,
  type CourseMode,
  type CourseStatus,
  type OrderStatus,
} from "@/lib/platform";
import { requireProfile } from "@/lib/supabase/auth";

const CATEGORIES: CourseCategory[] = ["wellness", "wealth", "happiness"];
const MODES: CourseMode[] = ["online_live", "recorded", "offline", "hybrid"];

function text(form: FormData, key: string, max = 500) {
  return String(form.get(key) ?? "").trim().slice(0, max);
}

export type CourseFormState = { error: string | null };

type ParsedCourse =
  | { ok: true; values: Record<string, unknown>; publish: boolean }
  | { ok: false; error: string };

function parseCourseForm(form: FormData): ParsedCourse {
  const title = text(form, "title", 140);
  const description = text(form, "description", 6000);
  const category = text(form, "category") as CourseCategory;
  const mode = text(form, "mode") as CourseMode;
  const chosenSub = text(form, "subcategory", 80);
  const otherSub = text(form, "subcategory_other", 80);
  const subcategory = chosenSub === OTHER_SUBCATEGORY ? otherSub : chosenSub;
  const price = Number.parseInt(text(form, "price_inr", 12) || "0", 10);
  const publish = form.get("publish") === "on";

  if (!title) return { ok: false, error: "Give the course a title." };
  if (!description) {
    return { ok: false, error: "Add a description so students know what they get." };
  }
  if (!CATEGORIES.includes(category)) return { ok: false, error: "Choose a category." };
  if (!MODES.includes(mode)) {
    return { ok: false, error: "Choose how the course is delivered." };
  }
  if (!subcategory) {
    return { ok: false, error: "Choose a subcategory, or type one if you picked Other." };
  }
  if (!Number.isFinite(price) || price < 0) {
    return { ok: false, error: "Enter a valid price (0 for free)." };
  }

  return {
    ok: true,
    publish,
    values: {
      title,
      description,
      mode,
      category,
      subcategory,
      summary: text(form, "summary", 200) || null,
      level: text(form, "level", 40) || null,
      duration: text(form, "duration", 60) || null,
      language: text(form, "language", 40) || null,
      price_inr: price,
      cover_url: text(form, "cover_url", 500) || null,
    },
  };
}

export async function createCourse(
  _prev: CourseFormState,
  form: FormData,
): Promise<CourseFormState> {
  const { supabase, profile } = await requireProfile();

  if (profile.role !== "faculty") {
    return { error: "Only faculty accounts can create courses." };
  }

  const parsed = parseCourseForm(form);
  if (!parsed.ok) return { error: parsed.error };

  const { error } = await supabase.from("courses").insert({
    ...parsed.values,
    faculty_id: profile.id,
    faculty_name: profile.full_name,
    slug: slugify(parsed.values.title as string),
    status: parsed.publish ? "published" : "draft",
    published_at: parsed.publish ? new Date().toISOString() : null,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/faculty");
  revalidatePath("/courses");
  revalidatePath("/");
  redirect("/dashboard/faculty");
}

export async function updateCourse(
  _prev: CourseFormState,
  form: FormData,
): Promise<CourseFormState> {
  const { supabase, profile } = await requireProfile();

  const id = String(form.get("id") ?? "");
  if (!id) return { error: "Missing course." };

  const parsed = parseCourseForm(form);
  if (!parsed.ok) return { error: parsed.error };

  // The slug is left alone on purpose — changing it would break any link
  // already shared for this course.
  const { data: existing } = await supabase
    .from("courses")
    .select("slug, status, published_at")
    .eq("id", id)
    .eq("faculty_id", profile.id)
    .maybeSingle();

  if (!existing) return { error: "That course was not found." };

  const wasPublished = existing.status === "published";
  const { error } = await supabase
    .from("courses")
    .update({
      ...parsed.values,
      status: parsed.publish ? "published" : "draft",
      // Keep the original publish date when it was already live.
      published_at: parsed.publish
        ? (wasPublished ? existing.published_at : new Date().toISOString())
        : null,
    })
    .eq("id", id)
    .eq("faculty_id", profile.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/faculty");
  revalidatePath("/courses");
  revalidatePath("/");
  revalidatePath(`/courses/${existing.slug}`);
  redirect("/dashboard/faculty");
}

export async function setCourseStatus(formData: FormData) {
  const { supabase, profile } = await requireProfile();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as CourseStatus;
  if (!id || !["draft", "published", "archived"].includes(status)) return;

  await supabase
    .from("courses")
    .update({
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .eq("faculty_id", profile.id);

  revalidatePath("/dashboard/faculty");
  revalidatePath("/courses");
  revalidatePath("/");
}

export async function setOrderStatus(formData: FormData) {
  const { supabase, profile } = await requireProfile();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  if (!id || !["pending", "verified", "rejected"].includes(status)) return;

  await supabase
    .from("orders")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("faculty_id", profile.id);

  revalidatePath("/dashboard/faculty");
  revalidatePath("/dashboard/student");
}
