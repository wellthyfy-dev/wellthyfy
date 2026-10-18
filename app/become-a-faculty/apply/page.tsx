import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import FacultyApplyForm from "@/components/platform/FacultyApplyForm";

export const metadata: Metadata = {
  title: "Apply to become a Faculty",
  description: "Apply to teach on Wellthyfy: your details, a government ID, and your course.",
  alternates: { canonical: "/become-a-faculty/apply" },
};

export default function ApplyPage() {
  return (
    <div className="relative pb-24 pt-32 md:pt-40">
      <div className="container-page">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/become-a-faculty"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-ink-soft transition-colors hover:text-well-700"
          >
            <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Back
          </Link>

          <h1 className="mt-7 text-3xl font-semibold leading-[1.12] sm:text-4xl lg:text-5xl">
            Apply to become a <span className="text-gradient-brand">faculty</span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">
            Three short sections: who you are, a government ID, and the course you want to teach.
            When you submit, our team is notified straight away.
          </p>

          <div className="mt-10">
            <FacultyApplyForm />
          </div>
        </div>
      </div>
    </div>
  );
}
