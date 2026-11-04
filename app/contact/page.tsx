import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import Contact from "@/components/sections/Contact";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact Wellthyfy Lifestyle Ventures, Puducherry",
  absoluteTitle: true,
  description:
    "Call +91 97519 45999, email info@wellthyfy.in or visit Wellthyfy Lifestyle Ventures at Kasthuribai Nagar, Puducherry. Send us a message online.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHeader
        crumb="Contact"
        path="/contact"
        eyebrow="Contact"
        title="Let us start"
        highlight="something good"
        intro="Call, write or visit us in Puducherry — we would love to hear where you want to grow. Send us a message and our team will get back to you."
      />
      <Contact showHeading={false} />
    </>
  );
}
