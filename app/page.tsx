import type { Metadata } from "next";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import About from "@/components/sections/About";
import Courses from "@/components/sections/Courses";
import CTABanner from "@/components/sections/CTABanner";
import Hero from "@/components/sections/Hero";
import LiveCourses from "@/components/sections/LiveCourses";
import Services from "@/components/sections/Services";
import Testimonials from "@/components/sections/Testimonials";
import WhoCanJoin from "@/components/sections/WhoCanJoin";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Wellthyfy Lifestyle Ventures | Official Website, Puducherry",
  absoluteTitle: true,
  description:
    "Wellthyfy Lifestyle Ventures in Puducherry: wellness and yoga programs, financial education, skill development courses and a community that helps you grow.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <OrganizationJsonLd />
      <Hero />
      {/* Short previews; each links to its full page */}
      <About variant="teaser" />
      <Services />
      <Courses />
      <LiveCourses />
      <WhoCanJoin />
      <Testimonials />
      <CTABanner />
    </>
  );
}
