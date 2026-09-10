import { ArrowUpRight, Globe, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import SocialLinks from "./SocialLinks";
import { navLinks, siteConfig } from "@/lib/site";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-well-100 bg-white/70 backdrop-blur-sm">
      {/* Top accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-well-600 via-navy-700 to-gold-500" />

      <div className="container-page py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1.2fr] lg:gap-10">
          {/* Brand */}
          <div>
            <Logo variant="footer" />
            <p className="mt-5 max-w-sm font-display text-lg font-medium text-navy-800">
              {siteConfig.tagline}
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
              A holistic lifestyle company helping individuals, families and communities grow in
              health, wealth and happiness — together.
            </p>

            <div className="mt-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy-700/70">
                Follow us
              </p>
              <SocialLinks />
            </div>
          </div>

          {/* Links */}
          <nav aria-label="Footer">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy-700/70">
              Explore
            </p>
            <ul className="mt-4 space-y-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 py-1.5 text-[0.95rem] text-ink-soft transition-colors hover:text-well-700"
                  >
                    <span className="h-px w-0 bg-well-600 transition-all duration-300 group-hover:w-4" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy-700/70">
              Get in touch
            </p>
            <ul className="mt-4 space-y-4 text-[0.95rem]">
              <li>
                <a
                  href={siteConfig.phoneHref}
                  className="group flex items-start gap-3 text-ink-soft transition-colors hover:text-well-700"
                >
                  <Phone className="mt-0.5 size-4.5 shrink-0 text-well-600" strokeWidth={2} />
                  {siteConfig.phone}
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.emailHref}
                  className="group flex items-start gap-3 text-ink-soft transition-colors hover:text-well-700"
                >
                  <Mail className="mt-0.5 size-4.5 shrink-0 text-navy-600" strokeWidth={2} />
                  {siteConfig.email}
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.url}
                  className="group flex items-start gap-3 text-ink-soft transition-colors hover:text-well-700"
                >
                  <Globe className="mt-0.5 size-4.5 shrink-0 text-gold-600" strokeWidth={2} />
                  {siteConfig.website}
                  <ArrowUpRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              </li>
              <li className="flex items-start gap-3 text-ink-soft">
                <MapPin className="mt-0.5 size-4.5 shrink-0 text-well-600" strokeWidth={2} />
                <address className="not-italic leading-relaxed">
                  {siteConfig.address.line1}
                  <br />
                  {siteConfig.address.line2}
                  <br />
                  {siteConfig.address.line3}
                </address>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-navy-900/8 pt-7 text-sm text-ink-soft sm:flex-row">
          <p>
            © {year} {siteConfig.legalName} All rights reserved.
          </p>
          <p className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-well-500" aria-hidden="true" />
            <span>
              Made by{" "}
              <a
                href="https://rooban.info"
                target="_blank"
                rel="noopener noreferrer"
                className="group/rvn inline-flex items-center gap-0.5 font-semibold text-navy-800 underline decoration-gold-400 decoration-2 underline-offset-4 transition-colors hover:text-well-700"
              >
                RVN
                <ArrowUpRight
                  className="size-3.5 transition-transform duration-300 group-hover/rvn:-translate-y-0.5 group-hover/rvn:translate-x-0.5"
                  strokeWidth={2.4}
                />
              </a>{" "}
              in Puducherry, India
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
