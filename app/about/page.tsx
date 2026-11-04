import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import About from "@/components/sections/About";
import CTABanner from "@/components/sections/CTABanner";
import MissionVision from "@/components/sections/MissionVision";
import WhyWellthyfy from "@/components/sections/WhyWellthyfy";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About Us – Our Mission & Vision",
  description:
    "Wellthyfy Lifestyle Ventures is a community-driven lifestyle transformation company in Puducherry. Learn about our mission, vision and approach.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageHeader
        crumb="About"
        path="/about"
        eyebrow="About Us"
        title="Building healthier, more confident and"
        highlight="fulfilling lives"
        intro="Wellthyfy Lifestyle Ventures is a community-driven lifestyle transformation company committed to helping individuals and families build a healthier, more confident, and fulfilling life. We bring together wellness services, holistic health support, financial education, skill development, and personal growth under one integrated platform. Through programs led by qualified professionals, experienced therapists, trainers, and coaches, we create opportunities for people to learn, grow, connect, and make meaningful progress in their everyday lives."
        image={{
          src: "/about/hero.webp",
          alt: "A multi-generational family gathered around a globe with rising coins and a wellness symbol — health, wealth and happiness growing together.",
          cutout: { width: 1100, height: 956 },
        }}
      />
      <About variant="full" />
      <MissionVision />
      <WhyWellthyfy />
      <CTABanner />
    </>
  );
}
