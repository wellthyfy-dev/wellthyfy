import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CourseForm from "@/components/platform/CourseForm";
import { requireFaculty } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Create a course",
  robots: { index: false, follow: false },
};

export default async function NewCoursePage() {
  await requireFaculty();

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

          <h1 className="mt-7 text-3xl font-semibold leading-[1.12] sm:text-4xl">
            Create a <span className="text-gradient-brand">course</span>
          </h1>
          <p className="mt-3 text-base text-ink-soft">
            Fill in your course and submit it for review. Once the Wellthyfy team approves it, it
            appears on the site where students can enrol.
          </p>

          <div className="mt-9 rounded-3xl border border-navy-900/7 bg-white/90 p-6 shadow-lift backdrop-blur-md sm:p-8">
            <CourseForm />
          </div>
        </div>
      </div>
    </div>
  );
}
