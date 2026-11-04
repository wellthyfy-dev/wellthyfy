import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import CTABanner from "@/components/sections/CTABanner";
import ServicesDetail from "@/components/sections/ServicesDetail";
import { Icon } from "@/components/ui/Icon";
import { accentStyles, cn } from "@/lib/accents";
import { pageMetadata } from "@/lib/seo";
import { serviceSlug, services } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Wellness, Financial Education & Skill Services",
  description:
    "Wellthyfy's services in Puducherry: health & wellness, yoga, financial education, lifestyle coaching, skill development and community programs.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        crumb="Services"
        path="/services"
        eyebrow="Core Services"
        title="Everything a balanced life needs,"
        highlight="in one place"
        intro="Six connected programs that support the body, the bank balance and the belonging — designed to work together rather than in isolation."
      >
        <nav aria-label="Services on this page" className="mt-9 flex flex-wrap justify-center gap-2.5">
          {services.map((s) => {
            const a = accentStyles[s.accent];
            return (
              <a
                key={s.title}
                href={`#${serviceSlug(s.title)}`}
                className={cn(
                  "group inline-flex items-center gap-2 rounded-full border bg-white/85 px-4 py-2.5 text-sm font-semibold shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft",
                  a.border,
                  a.text,
                )}
              >
                <Icon name={s.icon} className="size-4 transition-transform duration-300 group-hover:-rotate-12" />
                {s.title}
              </a>
            );
          })}
        </nav>
      </PageHeader>
      <div className="pt-8 lg:pt-12">
        <ServicesDetail />
      </div>
      <CTABanner />
    </>
  );
}
