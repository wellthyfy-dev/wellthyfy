import { BookOpen, Eye, Sparkles, Sprout, Target, Users } from "lucide-react";
import TiltCard from "@/components/ui/TiltCard";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/accents";

const statements = [
  {
    icon: Target,
    eyebrow: "Our Mission",
    tile: "from-well-400 to-well-700",
    glow: "bg-well-200/60",
    body: "Our mission is to empower individuals and families with practical knowledge, professional guidance, and community support to improve their well-being, strengthen financial confidence, and pursue continuous personal and professional growth. We strive to deliver accessible, people-centred programs that encourage healthier choices, responsible decision-making, meaningful connections, and sustainable progress.",
  },
  {
    icon: Eye,
    eyebrow: "Our Vision",
    tile: "from-navy-500 to-navy-800",
    glow: "bg-navy-200/60",
    body: "Our vision is to build a trusted and inclusive lifestyle community that inspires people to achieve lasting wellness, financial well-being, and happiness. We aspire to create an ecosystem where individuals from diverse backgrounds can access learning, expert support, and opportunities to thrive — contributing to stronger families, empowered communities, and a better quality of life.",
  },
];

const values = [
  { word: "Learn", icon: BookOpen, tile: "from-well-400 to-well-600" },
  { word: "Grow", icon: Sprout, tile: "from-well-500 to-navy-700" },
  { word: "Connect", icon: Users, tile: "from-navy-500 to-navy-700" },
  { word: "Thrive", icon: Sparkles, tile: "from-gold-400 to-gold-600" },
];

/** Mission and vision statements, then the four-word promise. */
export default function MissionVision() {
  return (
    <section className="relative py-20 sm:py-24 lg:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Mission & Vision"
          title="What drives"
          highlight="everything we do"
        />

        <StaggerGroup className="mt-14 grid gap-7 lg:mt-16 lg:grid-cols-2">
          {statements.map((st) => (
            <StaggerItem key={st.eyebrow} className="h-full">
              <TiltCard className="h-full rounded-[2rem]" max={5}>
                <article className="relative h-full overflow-hidden rounded-[2rem] border border-navy-900/7 bg-white/90 p-8 shadow-soft backdrop-blur-sm transition-shadow duration-500 hover:shadow-lift sm:p-10">
                  <span
                    aria-hidden="true"
                    className={cn("absolute -right-16 -top-16 size-52 rounded-full blur-3xl", st.glow)}
                  />
                  <span
                    className={cn(
                      "relative grid size-16 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lift transition-transform duration-500 group-hover/tilt:-rotate-6 group-hover/tilt:scale-110",
                      st.tile,
                    )}
                  >
                    <st.icon className="size-8" strokeWidth={1.8} />
                  </span>
                  <h3 className="relative mt-7 font-display text-2xl font-semibold sm:text-3xl">
                    {st.eyebrow}
                  </h3>
                  <p className="relative mt-4 text-base leading-relaxed text-ink-soft sm:text-[1.05rem]">
                    {st.body}
                  </p>
                </article>
              </TiltCard>
            </StaggerItem>
          ))}
        </StaggerGroup>

        {/* Learn • Grow • Connect • Thrive */}
        <Reveal>
          <ul
            aria-label="Learn, Grow, Connect, Thrive"
            className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4 lg:mt-16"
          >
            {values.map((v, i) => (
              <li
                key={v.word}
                className="group relative flex flex-col items-center gap-3 rounded-3xl border border-navy-900/7 bg-white/80 px-4 py-7 text-center shadow-soft backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-lift"
              >
                <span
                  className={cn(
                    "grid size-14 place-items-center rounded-2xl bg-gradient-to-br text-white transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110",
                    v.tile,
                  )}
                >
                  <v.icon className="size-7" strokeWidth={1.8} />
                </span>
                <span className="font-display text-xl font-semibold text-ink">{v.word}</span>
                {i < values.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-3 top-1/2 hidden size-2 -translate-y-1/2 rounded-full bg-gold-400 sm:block"
                  />
                )}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
