import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";
import Courses from "@/components/sections/Courses";
import CTABanner from "@/components/sections/CTABanner";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import Testimonials from "@/components/sections/Testimonials";
import WhoCanJoin from "@/components/sections/WhoCanJoin";
import WhyWellthyfy from "@/components/sections/WhyWellthyfy";

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <Courses />
      <WhyWellthyfy />
      <WhoCanJoin />
      <Testimonials />
      <CTABanner />
      <Contact />
    </>
  );
}
