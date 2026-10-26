import type { Metadata } from "next";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";
import Courses from "@/components/sections/Courses";
import CTABanner from "@/components/sections/CTABanner";
import Hero from "@/components/sections/Hero";
import LiveCourses from "@/components/sections/LiveCourses";
import Services from "@/components/sections/Services";
import Testimonials from "@/components/sections/Testimonials";
import WhoCanJoin from "@/components/sections/WhoCanJoin";
import WhyWellthyfy from "@/components/sections/WhyWellthyfy";
import { COMPANY_DESCRIPTION, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Wellthyfy | Official Website",
  absoluteTitle: true,
  description: COMPANY_DESCRIPTION,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <OrganizationJsonLd />
      <Hero />
      <About />
      <Services />
      <Courses />
      <LiveCourses />
      <WhyWellthyfy />
      <WhoCanJoin />
      <Testimonials />
      <CTABanner />
      <Contact />
    </>
  );
}
