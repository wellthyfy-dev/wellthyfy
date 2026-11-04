import type { Metadata } from "next";
import { breadcrumbJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";
import Link from "next/link";
import { ArrowLeft, BadgeCheck } from "lucide-react";
import FacultyApplyForm from "@/components/platform/FacultyApplyForm";

export const metadata: Metadata = pageMetadata({
  title: "Apply Free – Teach & Earn as a Faculty",
  description:
    "Apply free to become a Wellthyfy faculty and start earning by teaching your skills. No registration fee — share your details, qualification, PAN and Aadhaar.",
  path: "/become-a-faculty/apply",
});

export default function ApplyPage() {
  return (
    <div className="relative pb-24 pt-32 md:pt-40">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(breadcrumbJsonLd([{ name: "Become a Faculty", path: "/become-a-faculty" }, { name: "Apply", path: "/become-a-faculty/apply" }])),
        }}
      />
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
            Three short sections: your contact details, your qualification, and your PAN and
            Aadhaar cards for verification. Once you are approved, you get a Wellthyfy mail id to
            sign up and create your course.
          </p>

          <p className="mt-6 inline-flex items-center gap-2.5 rounded-full border-2 border-gold-400 bg-gold-50 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-gold-800 shadow-glow-gold sm:text-sm">
            <BadgeCheck className="size-5 shrink-0 text-gold-600" strokeWidth={2.2} />
            No registration fee<span className="hidden sm:inline"> · 100% free to apply</span>
          </p>

          <div className="mt-10">
            <FacultyApplyForm />
          </div>
        </div>
      </div>
    </div>
  );
}
