"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  OTHER_SUBCATEGORY,
  slugify,
  type CourseCategory,
  type CourseMode,
  type CourseStatus,
} from "@/lib/platform";
import { courseSubmittedEmail } from "@/lib/faculty-emails";
import { adminRecipients, sendMail } from "@/lib/mailer";
import { siteOrigin } from "@/lib/site-origin";
import { requireFaculty } from "@/lib/supabase/auth";

const CATEGORIES: CourseCategory[] = ["wellness", "wealth", "happiness"];
const MODES: CourseMode[] = ["online_live", "recorded", "offline", "hybrid"];

function text(form: FormData, key: string, max = 500) {
  return String(form.get(key) ?? "").trim().slice(0, max);
}

/** A freshly uploaded modules PDF must sit in the faculty's own folder. */
function ownsModulesPdf(path: unknown, userId: string) {
  if (path == null) return true;
  return typeof path === "string" && new RegExp(`^${userId}/[A-Za-z0-9_.-]+\\.pdf$`).test(path);
}

export type CourseFormState = { error: string | null };

type ParsedCourse =
  | { ok: true; values: Record<string, unknown>; submit: boolean }
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
  // Two submit buttons: "Submit for review" and "Save as draft".
  const submit = form.get("intent") === "submit";

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
    submit,
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
      modules_pdf_path: text(form, "modules_pdf_path", 200) || null,
    },
  };
}

export async function createCourse(
  _prev: CourseFormState,
  form: FormData,
): Promise<CourseFormState> {
  const { supabase, profile } = await requireFaculty();

  const parsed = parseCourseForm(form);
  if (!parsed.ok) return { error: parsed.error };
  if (!ownsModulesPdf(parsed.values.modules_pdf_path, profile.id)) {
    return { error: "The modules PDF upload is invalid. Please upload it again." };
  }

  // Nothing a faculty member saves goes live directly: it is either a draft or
  // waiting for an admin. The database enforces this too (courses_review_guard).
  const { data: created, error } = await supabase
    .from("courses")
    .insert({
      ...parsed.values,
      faculty_id: profile.id,
      faculty_name: profile.full_name,
      slug: slugify(parsed.values.title as string),
      status: parsed.submit ? "pending_review" : "draft",
      published_at: null,
    })
    .select("id, title, faculty_name, category, subcategory, mode, price_inr")
    .single();

  if (error) return { error: error.message };
  if (parsed.submit && created) await notifyAdmins(created, profile.email);

  revalidatePath("/dashboard/faculty");
  revalidatePath("/courses");
  revalidatePath("/");
  redirect("/dashboard/faculty");
}

export async function updateCourse(
  _prev: CourseFormState,
  form: FormData,
): Promise<CourseFormState> {
  const { supabase, profile } = await requireFaculty();

  const id = String(form.get("id") ?? "");
  if (!id) return { error: "Missing course." };

  const parsed = parseCourseForm(form);
  if (!parsed.ok) return { error: parsed.error };

  // The slug is left alone on purpose — changing it would break any link
  // already shared for this course.
  const { data: existing } = await supabase
    .from("courses")
    .select("slug, status, modules_pdf_path")
    .eq("id", id)
    .eq("faculty_id", profile.id)
    .maybeSingle();

  if (!existing) return { error: "That course was not found." };
  // Keeping the PDF that came with the approved application is fine too.
  const pdf = parsed.values.modules_pdf_path;
  if (pdf !== existing.modules_pdf_path && !ownsModulesPdf(pdf, profile.id)) {
    return { error: "The modules PDF upload is invalid. Please upload it again." };
  }

  // Saving always lands in draft or review — an edited live course is taken
  // off the site until an admin approves the new version.
  const { data: saved, error } = await supabase
    .from("courses")
    .update({
      ...parsed.values,
      status: parsed.submit ? "pending_review" : "draft",
      published_at: null,
    })
    .eq("id", id)
    .eq("faculty_id", profile.id)
    .select("id, title, faculty_name, category, subcategory, mode, price_inr")
    .single();

  if (error) return { error: error.message };
  if (parsed.submit && saved) await notifyAdmins(saved, profile.email);

  revalidatePath("/dashboard/faculty");
  revalidatePath("/courses");
  revalidatePath("/");
  revalidatePath(`/courses/${existing.slug}`);
  redirect("/dashboard/faculty");
}

/**
 * Dashboard buttons: submit a draft for review, withdraw it from review, or
 * take a live course off the site. Faculty can never publish.
 */
export async function setCourseStatus(formData: FormData) {
  const { supabase, profile } = await requireFaculty();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as CourseStatus;
  if (!id || !["draft", "pending_review"].includes(status)) return;

  const { data } = await supabase
    .from("courses")
    .update({ status, published_at: null })
    .eq("id", id)
    .eq("faculty_id", profile.id)
    .select("id, title, faculty_name, category, subcategory, mode, price_inr, slug")
    .maybeSingle();

  if (data && status === "pending_review") await notifyAdmins(data, profile.email);

  revalidatePath("/dashboard/faculty");
  revalidatePath("/admin", "layout");
  revalidatePath("/courses");
  revalidatePath("/");
  if (data?.slug) revalidatePath(`/courses/${data.slug}`);
}

/** Courses only reach the site through an admin, so tell them one is waiting. */
async function notifyAdmins(
  course: Parameters<typeof courseSubmittedEmail>[0],
  facultyEmail: string,
) {
  const to = adminRecipients();
  if (!to.length) return;
  const result = await sendMail({
    to,
    replyTo: facultyEmail,
    ...courseSubmittedEmail(course, await siteOrigin(), facultyEmail),
  });
  if (!result.ok) console.warn("[faculty] review request email failed:", result.error);
}
