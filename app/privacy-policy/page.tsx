import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Globe, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import {
  policyIntro,
  policyMeta,
  policySections,
  type PolicyBlock,
} from "@/lib/privacy-policy";
import { siteConfig } from "@/lib/site";

const description =
  "How Wellthyfy Lifestyle Ventures collects, uses, stores and protects your personal information, and the rights available to you under India's data-protection framework.";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description,
  alternates: { canonical: "/privacy-policy" },
  openGraph: {
    title: "Privacy Policy | Wellthyfy Lifestyle Ventures",
    description,
    url: `${siteConfig.url}/privacy-policy`,
  },
};

function Blocks({ blocks }: { blocks: PolicyBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        if (block.kind === "h3") {
          return (
            <h3 key={i} className="mt-8 text-lg font-semibold text-ink sm:text-xl">
              {block.text}
            </h3>
          );
        }

        if (block.kind === "list") {
          return (
            <ul key={i} className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {block.items.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[0.95rem] text-ink-soft">
                  <span
                    className="mt-[0.55rem] size-1.5 shrink-0 rounded-full bg-well-500"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={i} className="mt-4 text-[0.98rem] leading-relaxed text-ink-soft">
            {block.text}
            {block.cite && (
              <>
                {" "}
                <a
                  href={block.cite.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-navy-200 bg-white/70 px-2.5 py-0.5 align-middle text-[11px] font-semibold text-navy-800 transition-colors hover:border-navy-300 hover:bg-navy-50"
                >
                  {block.cite.label}
                  <ExternalLink className="size-3" strokeWidth={2.4} />
                </a>
              </>
            )}
          </p>
        );
      })}
    </>
  );
}

const contactRows = [
  { label: "Email", value: policyMeta.email, href: `mailto:${policyMeta.email}`, icon: Mail },
  { label: "Phone", value: policyMeta.phone, href: policyMeta.phoneHref, icon: Phone },
  {
    label: "Website",
    value: policyMeta.website,
    href: policyMeta.websiteHref,
    icon: Globe,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="relative pb-24 pt-32 md:pt-40">
      <div className="container-page">
        {/* Header */}
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-ink-soft transition-colors hover:text-well-700"
          >
            <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Back to home
          </Link>

          <span className="mt-7 inline-flex items-center gap-2 rounded-full border border-well-200/80 bg-white/80 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-well-700 shadow-sm">
            <ShieldCheck className="size-3.5" strokeWidth={2.4} />
            Legal
          </span>

          <h1 className="mt-5 text-4xl font-semibold leading-[1.1] sm:text-5xl lg:text-[3.4rem]">
            Privacy <span className="text-gradient-brand">Policy</span>
          </h1>

          <p className="mt-5 text-sm font-medium text-navy-800">
            Effective Date: {policyMeta.effectiveDate}
          </p>

          {/* Identity card */}
          <div className="mt-8 rounded-3xl border border-navy-900/7 bg-white/85 p-6 shadow-soft backdrop-blur-sm sm:p-7">
            <p className="font-display text-lg font-semibold text-ink sm:text-xl">
              {policyMeta.legalName}
            </p>
            <address className="mt-2 flex items-start gap-2.5 not-italic leading-relaxed text-ink-soft">
              <MapPin className="mt-1 size-4 shrink-0 text-well-600" strokeWidth={2.2} />
              <span>
                {policyMeta.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </span>
            </address>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-navy-900/7 pt-4 text-sm">
              {contactRows.map((row) => (
                <li key={row.label}>
                  <a
                    href={row.href}
                    target={row.label === "Website" ? "_blank" : undefined}
                    rel={row.label === "Website" ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center gap-2 font-medium text-ink transition-colors hover:text-well-700"
                  >
                    <row.icon className="size-4 text-navy-600" strokeWidth={2.2} />
                    {row.value}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            <Blocks blocks={policyIntro} />
          </div>
        </div>

        {/* Body */}
        <div className="mx-auto mt-14 grid max-w-6xl gap-12 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14">
          {/* Contents */}
          <nav aria-label="Privacy Policy contents" className="lg:sticky lg:top-32 lg:self-start">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy-700/70">
              Contents
            </p>
            <ol className="mt-4 space-y-1">
              {policySections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="group flex gap-2.5 rounded-lg py-1.5 text-sm text-ink-soft transition-colors hover:text-well-700"
                  >
                    <span className="w-5 shrink-0 tabular-nums text-navy-700/50">
                      {section.number}
                    </span>
                    <span>{section.title}</span>
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#contact-us"
                  className="group flex gap-2.5 rounded-lg py-1.5 text-sm text-ink-soft transition-colors hover:text-well-700"
                >
                  <span className="w-5 shrink-0 tabular-nums text-navy-700/50">14</span>
                  <span>Contact Us</span>
                </a>
              </li>
            </ol>
          </nav>

          {/* Sections */}
          <div className="min-w-0">
            {policySections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-32 border-t border-navy-900/8 py-10 first:border-t-0 first:pt-0"
              >
                <h2 className="flex items-baseline gap-3 text-2xl font-semibold sm:text-[1.75rem]">
                  <span className="font-display text-base font-bold tabular-nums text-well-600">
                    {String(section.number).padStart(2, "0")}
                  </span>
                  {section.title}
                </h2>
                <Blocks blocks={section.blocks} />
              </section>
            ))}

            {/* 14. Contact Us */}
            <section
              id="contact-us"
              className="scroll-mt-32 border-t border-navy-900/8 py-10"
            >
              <h2 className="flex items-baseline gap-3 text-2xl font-semibold sm:text-[1.75rem]">
                <span className="font-display text-base font-bold tabular-nums text-well-600">
                  14
                </span>
                Contact Us
              </h2>
              <p className="mt-4 text-[0.98rem] leading-relaxed text-ink-soft">
                If you have any questions, requests or grievances concerning this Privacy Policy
                or your personal information, please contact:
              </p>

              <div className="mt-6 overflow-hidden rounded-3xl border border-navy-900/7 bg-white/85 shadow-soft backdrop-blur-sm">
                <div className="h-1 w-full bg-gradient-to-r from-well-600 via-navy-700 to-gold-500" />
                <div className="p-6 sm:p-7">
                  <p className="font-display text-lg font-semibold text-ink sm:text-xl">
                    {policyMeta.legalName}
                  </p>
                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-700/60">
                    Registered / Corporate Office
                  </p>
                  <address className="mt-1.5 not-italic leading-relaxed text-ink-soft">
                    {policyMeta.addressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>

                  <ul className="mt-6 grid gap-3 border-t border-navy-900/7 pt-5 sm:grid-cols-3">
                    {contactRows.map((row) => (
                      <li key={row.label}>
                        <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-700/60">
                          {row.label}
                        </span>
                        <a
                          href={row.href}
                          target={row.label === "Website" ? "_blank" : undefined}
                          rel={row.label === "Website" ? "noopener noreferrer" : undefined}
                          className="mt-1 inline-flex items-center gap-2 font-medium text-ink transition-colors hover:text-well-700"
                        >
                          <row.icon className="size-4 shrink-0 text-navy-600" strokeWidth={2.2} />
                          <span className="break-all">{row.value}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
