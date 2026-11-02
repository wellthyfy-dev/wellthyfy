import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/SectionHeading";

/**
 * Top of an inner page: breadcrumb, eyebrow, H1 and intro, with an optional
 * photo alongside. Children render under the intro (e.g. jump links).
 */
export default function PageHeader({
  crumb,
  eyebrow,
  title,
  highlight,
  intro,
  image,
  children,
}: {
  crumb: string;
  eyebrow: string;
  title: string;
  highlight?: string;
  intro: string;
  image?: { src: string; alt: string; position?: string };
  children?: React.ReactNode;
}) {
  return (
    <header className="relative overflow-hidden pb-12 pt-32 md:pt-40 lg:pb-16">
      <div className="container-page">
        <div className={image ? "grid items-center gap-12 lg:grid-cols-2 lg:gap-14" : "mx-auto max-w-3xl text-center"}>
          <div>
            <nav aria-label="Breadcrumb" className={image ? "" : "flex justify-center"}>
              <ol className="flex items-center gap-1.5 text-sm text-ink-soft">
                <li>
                  <Link href="/" className="font-medium transition-colors hover:text-well-700">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="size-3.5" />
                </li>
                <li aria-current="page" className="font-semibold text-navy-800">
                  {crumb}
                </li>
              </ol>
            </nav>

            <Reveal>
              <div className="mt-6">
                <Eyebrow>{eyebrow}</Eyebrow>
              </div>
            </Reveal>
            <Reveal delay={0.06}>
              <h1 className="mt-6 text-4xl font-semibold leading-[1.1] sm:text-5xl lg:text-[3.4rem]">
                {title} {highlight && <span className="text-gradient-brand">{highlight}</span>}
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-5 text-base leading-relaxed text-ink-soft sm:text-lg">{intro}</p>
            </Reveal>
            {children && <Reveal delay={0.18}>{children}</Reveal>}
          </div>

          {image && (
            <Reveal direction="left" delay={0.1}>
              <div className="group relative">
                <div
                  aria-hidden="true"
                  className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-well-100 via-white to-gold-100 opacity-80 blur-2xl"
                />
                <div className="relative aspect-video overflow-hidden rounded-[2rem] border-[6px] border-white shadow-lift">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 600px"
                    className={`object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105 ${image.position ?? "object-center"}`}
                  />
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </header>
  );
}
