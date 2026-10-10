import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublishedCourseCard } from "@/components/platform/PublishedCourseCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import type { Course } from "@/lib/platform";
import { listPublishedCourses } from "@/lib/supabase/public";

/**
 * Courses published by faculty. Renders nothing while the catalogue is empty,
 * so the landing page never shows a hollow section.
 */
export default async function LiveCourses({ embedded = false }: { embedded?: boolean }) {
  const courses = (await listPublishedCourses(embedded ? 24 : 6)) as Course[];
  if (courses.length === 0) return null;

  const Wrapper = embedded
    ? ({ children }: { children: React.ReactNode }) => (
        <section id="live-courses" className="scroll-mt-32 pt-20 lg:pt-24">
          {children}
        </section>
      )
    : ({ children }: { children: React.ReactNode }) => (
        <section id="live-courses" className="relative scroll-mt-28 py-20 sm:py-24 lg:py-28">
          <div className="container-page">{children}</div>
        </section>
      );

  return (
    <Wrapper>
      <>
        <SectionHeading
          eyebrow="Now enrolling"
          title="Courses from our"
          highlight="faculty"
          description="Published by Wellthyfy faculty and open for enrolment today."
        />

        <StaggerGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {courses.map((course) => (
            <StaggerItem key={course.id} className="h-full">
              <PublishedCourseCard course={course} />
            </StaggerItem>
          ))}
        </StaggerGroup>

        {!embedded && (
          <div className="mt-12 text-center">
            <Link
              href="/courses"
              className="group inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white/80 px-7 py-3.5 text-sm font-semibold text-navy-800 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft"
            >
              See every course
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </>
    </Wrapper>
  );
}
