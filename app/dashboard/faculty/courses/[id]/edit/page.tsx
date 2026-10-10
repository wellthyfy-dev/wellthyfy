import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import CourseForm from "@/components/platform/CourseForm";
import type { Course } from "@/lib/platform";
import { requireProfile } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Edit course",
  robots: { index: false, follow: false },
};

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, profile } = await requireProfile();
  if (profile.role !== "faculty") redirect("/dashboard/student");

  // RLS already limits this to the signed-in faculty, but scope it explicitly
  // so a wrong id reads as "not found" rather than an empty form.
  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .eq("faculty_id", profile.id)
    .maybeSingle();

  const course = (data as Course | null) ?? null;
  if (!course) notFound();

  return (
    <div className="relative pb-24 pt-28 md:pt-36">
      <div className="container-page">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/dashboard/faculty"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-ink-soft transition-colors hover:text-well-700"
          >
            <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Back to dashboard
          </Link>

          <div className="mt-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold leading-[1.12] sm:text-4xl">
                Edit <span className="text-gradient-brand">course</span>
              </h1>
              <p className="mt-3 text-base text-ink-soft">
                Changes go live as soon as you save.
              </p>
            </div>

            {course.status === "published" && (
              <Link
                href={`/courses/${course.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-navy-200 bg-white/80 px-4 py-2 text-sm font-semibold text-navy-800 transition-colors hover:bg-white"
              >
                View live page
                <ExternalLink className="size-3.5" strokeWidth={2.2} />
              </Link>
            )}
          </div>

          <div className="mt-9 rounded-3xl border border-navy-900/7 bg-white/90 p-6 shadow-lift backdrop-blur-md sm:p-8">
            <CourseForm course={course} />
          </div>
        </div>
      </div>
    </div>
  );
}
