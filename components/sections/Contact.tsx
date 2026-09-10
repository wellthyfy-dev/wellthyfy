"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { courses, siteConfig } from "@/lib/site";

const MAPS_QUERY = encodeURIComponent(`${siteConfig.legalName}, ${siteConfig.address.full}`);
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`;

const details = [
  {
    label: "Phone",
    value: siteConfig.phone,
    href: siteConfig.phoneHref,
    icon: Phone,
    tile: "from-well-400 to-well-600",
  },
  {
    label: "Email",
    value: siteConfig.email,
    href: siteConfig.emailHref,
    icon: Mail,
    tile: "from-navy-500 to-navy-700",
  },
];

const fieldClass =
  "w-full rounded-xl border border-navy-900/10 bg-white px-4 py-3 text-[0.95rem] text-ink shadow-sm outline-none transition-all duration-200 placeholder:text-ink-soft/55 focus:border-well-400 focus:ring-4 focus:ring-well-500/12";

function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    setStatus("sending");
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setError(data.error ?? "Something went wrong. Please call or email us instead.");
        setStatus("idle");
        return;
      }

      setStatus("sent");
      form.reset();
    } catch {
      setError("Could not reach the server. Please check your connection and try again.");
      setStatus("idle");
    }
  }

  return (
    <div className="relative rounded-3xl border border-navy-900/7 bg-white/90 p-6 shadow-lift backdrop-blur-md sm:p-8">
      <h3 className="text-xl font-semibold sm:text-2xl">Send us a message</h3>
      <p className="mt-2 text-sm text-ink-soft">
        Tell us what you are looking for and our team will get back to you shortly.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 grid gap-4 sm:grid-cols-2">
        {/* Honeypot — hidden from people, irresistible to bots */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px] size-0 opacity-0"
        />
        <div className="sm:col-span-1">
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Your name"
            className={fieldClass}
          />
        </div>

        <div className="sm:col-span-1">
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-ink">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            inputMode="tel"
            placeholder="+91 00000 00000"
            className={fieldClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={fieldClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="interest" className="mb-1.5 block text-sm font-medium text-ink">
            I am interested in
          </label>
          <select id="interest" name="interest" defaultValue="" className={fieldClass} required>
            <option value="" disabled>
              Choose an option
            </option>
            {courses.map((c) => (
              <option key={c.id} value={c.title}>
                {c.title}
              </option>
            ))}
            <option value="Daily Morning Club">Daily Morning Club</option>
            <option value="Wellness Programs">Wellness Programs</option>
            <option value="Financial Education">Financial Education</option>
            <option value="Partnership">Partnership Opportunity</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-ink">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            placeholder="How can we help?"
            className={`${fieldClass} resize-y`}
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={status === "sending"}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-well-600 via-well-500 to-navy-700 px-7 py-4 text-base font-semibold text-white shadow-glow-green transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift disabled:translate-y-0 disabled:opacity-70"
          >
            {status === "sending" ? (
              <>
                <Loader2 className="size-4.5 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                Send Message
                <Send className="size-4.5 transition-transform duration-300 group-hover:translate-x-1" />
              </>
            )}
          </button>
        </div>
      </form>

      <AnimatePresence mode="wait">
        {status === "sent" && (
          <motion.p
            key="sent"
            role="status"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-5 flex items-start gap-2.5 rounded-xl border border-well-200 bg-well-50 px-4 py-3.5 text-sm font-medium text-well-800"
          >
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-well-600" />
            Thank you — your message is with our team. We have emailed you a confirmation and
            will be in touch soon.
          </motion.p>
        )}

        {error && (
          <motion.p
            key="error"
            role="alert"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-800"
          >
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
            <span>
              {error}{" "}
              <a href={siteConfig.phoneHref} className="underline underline-offset-2">
                {siteConfig.phone}
              </a>
            </span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Live Google Maps embed for the Puducherry office. */
function MapEmbed() {
  return (
    <div className="overflow-hidden rounded-3xl border border-navy-900/7 bg-navy-50 shadow-soft">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d487.9337175015036!2d79.80177684360001!3d11.941944706315676!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a53618b212aea89%3A0xe95f6c75ca61a44f!2sWellthyfy%20lifestyle%20Venture!5e0!3m2!1sen!2sin!4v1789029943512!5m2!1sen!2sin"
        title={`Map showing ${siteConfig.legalName} at ${siteConfig.address.full}`}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="block h-72 w-full border-0 sm:h-80"
      />

      {/* Sits below the map rather than over it, so it never blocks panning */}
      <div className="flex items-center justify-between gap-3 border-t border-navy-900/7 bg-white px-4 py-3.5">
        <span className="min-w-0 text-left text-sm leading-snug">
          <span className="block font-semibold text-ink">Wellthyfy — Puducherry</span>
          <span className="block truncate text-xs text-ink-soft">{siteConfig.address.full}</span>
        </span>
        <a
          href={MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-navy-200 px-3.5 py-2 text-xs font-semibold text-navy-800 transition-colors hover:border-navy-300 hover:bg-navy-50"
        >
          Directions
          <ExternalLink className="size-3.5" strokeWidth={2.2} />
        </a>
      </div>
    </div>
  );
}

export default function Contact() {
  return (
    <section id="contact" className="relative scroll-mt-28 py-20 sm:py-24 lg:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Contact"
          title="Let us start"
          highlight="something good"
          description="Call, write or visit us in Puducherry — we would love to hear where you want to grow."
        />

        <div className="mt-14 grid gap-7 lg:mt-16 lg:grid-cols-[1fr_1.15fr]">
          {/* Details + map */}
          <div className="flex flex-col gap-6">
            <Reveal direction="right">
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {details.map((d) => (
                  <li key={d.label}>
                    <a
                      href={d.href}
                      className="group flex items-center gap-4 rounded-2xl border border-navy-900/7 bg-white/85 p-5 shadow-soft backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                    >
                      <span
                        className={`grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${d.tile} text-white transition-transform duration-300 group-hover:scale-110`}
                      >
                        <d.icon className="size-5.5" strokeWidth={2} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-700/60">
                          {d.label}
                        </span>
                        <span className="mt-0.5 block truncate font-medium text-ink">
                          {d.value}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}

                <li className="sm:col-span-2 lg:col-span-1">
                  <div className="flex items-start gap-4 rounded-2xl border border-navy-900/7 bg-white/85 p-5 shadow-soft backdrop-blur-sm">
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-well-500 to-navy-700 text-white">
                      <MapPin className="size-5.5" strokeWidth={2} />
                    </span>
                    <span>
                      <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-700/60">
                        Address
                      </span>
                      <address className="mt-1 not-italic leading-relaxed text-ink">
                        {siteConfig.address.line1}
                        <br />
                        {siteConfig.address.line2}
                        <br />
                        {siteConfig.address.line3}
                      </address>
                    </span>
                  </div>
                </li>
              </ul>
            </Reveal>

            <Reveal direction="right" delay={0.12}>
              <MapEmbed />
            </Reveal>
          </div>

          {/* Form */}
          <Reveal direction="left" delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
