import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import About from "@/components/sections/About";
import CTABanner from "@/components/sections/CTABanner";
import WhyWellthyfy from "@/components/sections/WhyWellthyfy";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About Us",
  description:
    "Wellthyfy Lifestyle Ventures is a holistic lifestyle company in Puducherry helping individuals and families grow in health, wealth and happiness — and why families keep choosing us.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageHeader
        crumb="About"
        eyebrow="Our story"
        title="Health, Wealth & Happiness —"
        highlight="growing together"
        intro="Wellthyfy Lifestyle Ventures helps individuals and families achieve better health, stronger financial wellbeing, personal growth, and lasting happiness through holistic wellness programs, skill development initiatives, and community support."
        image={{
          src: "/core-services/community-empowerment.webp",
          alt: "Wellthyfy volunteers of all ages planting a sapling together.",
        }}
      />
      <About variant="full" />
      <WhyWellthyfy />
      <CTABanner />
    </>
  );
}
