import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BRAND, ORGANIZATION_ID, SITE_URL, breadcrumbJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";
import QRCode from "qrcode";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Clock,
  Download,
  FileText,
  Globe,
  GraduationCap,
  Layers,
  MapPin,
  MessageCircle,
  User,
  Users,
  Video,
} from "lucide-react";
import EnrollPanel, { type BatchChoice } from "@/components/platform/EnrollPanel";
import { Icon } from "@/components/ui/Icon";
import { accentStyles, cn } from "@/lib/accents";
import {
  CATEGORY_META,
  COURSE_STATUS_LABELS,
  MODE_LABELS,
  STATUS_LABELS,
  formatINR,
  modulesPdfUrl,
  upiLink,
  type Course,
  type Order,
} from "@/lib/platform";
import {
  BATCH_MODE_LABELS,
  formatStartDate,
  isOnline,
  mapsLink,
  scheduleSummary,
  type Batch,
} from "@/lib/batches";
import { whatsappUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

async function loadCourse(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("courses").select("*").eq("slug", slug).maybeSingle();
  return (data as Course | null) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await loadCourse(slug);
  if (!course) return { title: "Course not found", robots: { index: false, follow: false } };

  const description = (course.summary ?? course.description).replace(/\s+/g, " ").slice(0, 160);
  return pageMetadata({
    title: course.title,
    description,
    path: `/courses/${course.slug}`,
    image: course.cover_url
      ? { url: course.cover_url, width: 1200, height: 600, alt: course.title }
      : undefined,
    // Only the owner or an admin can open an unpublished course; never index it.
    noindex: course.status !== "published",
  });
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await loadCourse(slug);
  if (!course) notFound();

  const { profile } = await getSessionProfile();
  const meta = CATEGORY_META[course.category];
  const a = accentStyles[meta.accent];
  const modulesUrl = modulesPdfUrl(course.modules_pdf_path);

  // Does this signed-in student already have an order?
  let existing: Order | null = null;
  if (profile) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("course_id", course.id)
      .eq("student_id", profile.id)
      .maybeSingle();
    existing = (data as Order | null) ?? null;
  }

  // Open batches students can pick, with live seat counts.
  const db = await createClient();
  const { data: batchRows } = await db
    .from("batches")
    .select("*")
    .eq("course_id", course.id)
    .eq("status", "open")
    .order("start_date");
  const batches = (batchRows ?? []) as Batch[];
  const { data: takenRows } = batches.length
    ? await db.rpc("batch_seats_taken", { p_batches: batches.map((b) => b.id) })
    : { data: [] };
  const taken = new Map(
    ((takenRows ?? []) as { batch_id: string; taken: number }[]).map((r) => [r.batch_id, r.taken]),
  );
  const choices: BatchChoice[] = batches.map((b) => ({
    id: b.id,
    name: b.name,
    schedule: scheduleSummary(b),
    starts: formatStartDate(b.start_date),
    mode: BATCH_MODE_LABELS[b.mode],
    online: isOnline(b.mode),
    seatsLeft: Math.max(0, b.seats - (taken.get(b.id) ?? 0)),
  }));
  const allFull = choices.length > 0 && choices.every((c) => c.seatsLeft === 0);
  const notifyUrl = `${whatsappUrl}?text=${encodeURIComponent(
    `Hi Wellthyfy, please tell me when the next batch of "${course.title}" opens.`,
  )}`;

  const upiId = process.env.NEXT_PUBLIC_UPI_ID ?? "";
  const qrSvg = await QRCode.toString(
    upiLink({ amount: course.price_inr, note: course.title }),
    { type: "svg", margin: 1, color: { dark: "#0E2233", light: "#FFFFFF" } },
  );

  const facts = [
    { icon: Layers, label: "Mode", value: MODE_LABELS[course.mode] },
    course.duration && { icon: Clock, label: "Duration", value: course.duration },
    course.level && { icon: GraduationCap, label: "Level", value: course.level },
    course.language && { icon: Globe, label: "Language", value: course.language },
  ].filter(Boolean) as { icon: typeof Layers; label: string; value: string }[];

  const isOwner = profile?.id === course.faculty_id;

  return (
    <div className="relative pb-24 pt-32 md:pt-40">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd([
            breadcrumbJsonLd([
              { name: "Courses", path: "/courses" },
              { name: course.title, path: `/courses/${course.slug}` },
            ]),
            {
              "@context": "https://schema.org",
              "@type": "Course",
              name: course.title,
              description: (course.summary ?? course.description).slice(0, 300),
              url: `${SITE_URL}/courses/${course.slug}`,
              ...(course.cover_url ? { image: course.cover_url } : {}),
              inLanguage: course.language ?? "en",
              provider: { "@type": "Organization", "@id": ORGANIZATION_ID, name: BRAND, url: SITE_URL },
              offers: {
                "@type": "Offer",
                category: course.price_inr === 0 ? "Free" : "Paid",
                price: course.price_inr,
                priceCurrency: "INR",
                availability: "https://schema.org/InStock",
                url: `${SITE_URL}/courses/${course.slug}`,
              },
            },
          ]),
        }}
      />
      <div className="container-page">
        <Link
          href="/courses"
          className="group inline-flex items-center gap-2 text-sm font-semibold text-ink-soft transition-colors hover:text-well-700"
        >
          <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
          All courses
        </Link>

        <div className="mt-7 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
          {/* Main */}
          <div className="min-w-0">
            {course.cover_url && (
              <div className="relative mb-7 aspect-[2/1] w-full overflow-hidden rounded-3xl border border-navy-900/7 shadow-soft">
                <Image
                  src={course.cover_url}
                  alt={`${course.title} banner`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold",
                  a.softBg,
                  a.border,
                  a.text,
                )}
              >
                <Icon name={meta.icon} className="size-3.5" />
                {meta.label}
              </span>
              <span className="rounded-full border border-navy-900/10 bg-white px-3 py-1.5 text-[11px] font-medium text-ink-soft">
                {course.subcategory}
              </span>
              {course.status !== "published" && (
                <span className="rounded-full border border-gold-200 bg-gold-50 px-3 py-1.5 text-[11px] font-semibold text-gold-800">
                  {COURSE_STATUS_LABELS[course.status]} — not visible to the public

                </span>
              )}
            </div>

            <h1 className="mt-5 text-3xl font-semibold leading-[1.12] sm:text-4xl lg:text-[2.9rem]">
              {course.title}
            </h1>

            {course.summary && (
              <p className="mt-4 text-lg leading-relaxed text-ink-soft">{course.summary}</p>
            )}

            {course.faculty_name && (
              <p className="mt-5 inline-flex items-center gap-2 text-sm text-ink-soft">
                <User className="size-4 text-navy-600" strokeWidth={2.2} />
                Taught by <span className="font-semibold text-ink">{course.faculty_name}</span>
              </p>
            )}

            {facts.length > 0 && (
              <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {facts.map((f) => (
                  <li
                    key={f.label}
                    className="flex items-center gap-3 rounded-2xl border border-navy-900/7 bg-white/85 px-4 py-3 shadow-soft backdrop-blur-sm"
                  >
                    <f.icon className="size-4.5 shrink-0 text-navy-600" strokeWidth={2} />
                    <span className="min-w-0">
                      <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-700/60">
                        {f.label}
                      </span>
                      <span className="block text-sm font-medium text-ink">{f.value}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {batches.length > 0 && (
              <div className="mt-10">
                <h2 className="text-xl font-semibold sm:text-2xl">Upcoming batches</h2>
                <p className="mt-1.5 text-sm text-ink-soft">
                  Learn live with a small group. Every class is recorded and shared with your batch
                  as a recap.
                </p>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {batches.map((b, i) => {
                    const left = choices[i].seatsLeft;
                    return (
                      <li
                        key={b.id}
                        className="rounded-2xl border border-navy-900/7 bg-white/85 p-4 shadow-soft backdrop-blur-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-semibold text-ink">{b.name}</p>
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                              left === 0
                                ? "bg-red-50 text-red-700"
                                : left <= 5
                                  ? "bg-gold-50 text-gold-800"
                                  : "bg-well-50 text-well-800",
                            )}
                          >
                            {left === 0 ? "Full" : `${left} of ${b.seats} seats left`}
                          </span>
                        </div>
                        <p className="mt-2 flex items-center gap-2 text-sm text-ink-soft">
                          <CalendarDays className="size-4 shrink-0 text-navy-600" />
                          {scheduleSummary(b)}
                        </p>
                        <p className="mt-1 flex items-center gap-2 text-sm text-ink-soft">
                          <Users className="size-4 shrink-0 text-navy-600" />
                          {b.session_count} classes · starts {formatStartDate(b.start_date)}
                        </p>
                        <p className="mt-1 flex items-start gap-2 text-sm text-ink-soft">
                          {isOnline(b.mode) ? (
                            <Video className="mt-0.5 size-4 shrink-0 text-navy-600" />
                          ) : (
                            <MapPin className="mt-0.5 size-4 shrink-0 text-navy-600" />
                          )}
                          <span>
                            {BATCH_MODE_LABELS[b.mode]}
                            {b.venue && (
                              <>
                                {" · "}
                                <a
                                  href={mapsLink(b.venue)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-navy-700 underline-offset-2 hover:underline"
                                >
                                  {b.venue}
                                </a>
                              </>
                            )}
                          </span>
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div className="mt-10">
              <h2 className="text-xl font-semibold sm:text-2xl">About this course</h2>
              <div className="mt-4 whitespace-pre-wrap text-[0.98rem] leading-relaxed text-ink-soft">
                {course.description}
              </div>
            </div>

            {modulesUrl && (
              <div className="mt-10">
                <h2 className="text-xl font-semibold sm:text-2xl">Modules</h2>
                <a
                  href={modulesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-4 flex items-center gap-4 rounded-2xl border border-navy-900/7 bg-white/85 px-5 py-4 shadow-soft backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-well-300 hover:shadow-lift"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-well-400 to-navy-700 text-white">
                    <FileText className="size-5" strokeWidth={2} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink">Course modules (PDF)</span>
                    <span className="block text-sm text-ink-soft">
                      See every module and what it covers
                    </span>
                  </span>
                  <Download className="size-5 shrink-0 text-navy-700 transition-transform duration-300 group-hover:translate-y-0.5" />
                </a>
              </div>
            )}

            {!modulesUrl && course.modules && (
              <div className="mt-10">
                <h2 className="text-xl font-semibold sm:text-2xl">Modules</h2>
                <ol className="mt-4 grid gap-2.5">
                  {course.modules
                    .split(/\r?\n/)
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .map((line, i) => (
                      <li
                        key={`${i}-${line}`}
                        className="flex items-start gap-3.5 rounded-2xl border border-navy-900/7 bg-white/85 px-4 py-3.5 shadow-soft backdrop-blur-sm"
                      >
                        <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-well-400 to-well-600 text-[11px] font-bold text-white">
                          {i + 1}
                        </span>
                        <span className="text-[0.95rem] leading-relaxed text-ink">{line}</span>
                      </li>
                    ))}
                </ol>
              </div>
            )}
          </div>

          {/* Enrolment rail */}
          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-navy-900/7 bg-white/90 shadow-lift backdrop-blur-md">
              <div className={cn("h-1.5 w-full", a.bar)} />
              <div className="p-6">
                <p className="font-display text-3xl font-semibold text-ink">
                  {course.price_inr === 0 ? "Free" : formatINR(course.price_inr)}
                </p>

                {isOwner ? (
                  <p className="mt-4 rounded-xl border border-navy-900/10 bg-navy-50/60 px-4 py-3 text-sm text-ink-soft">
                    This is your course. Manage it from your{" "}
                    <Link href="/dashboard/faculty" className="font-semibold text-navy-800 underline">
                      faculty dashboard
                    </Link>
                    .
                  </p>
                ) : existing ? (
                  <div className="mt-4 rounded-xl border border-well-200 bg-well-50 px-4 py-4">
                    <BadgeCheck className="size-5 text-well-600" />
                    <p className="mt-2 text-sm font-semibold text-ink">
                      {STATUS_LABELS[existing.status]}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                      UTR <span className="font-mono">{existing.utr}</span>
                    </p>
                    <Link
                      href="/dashboard/student"
                      className="mt-3 inline-block text-xs font-semibold text-navy-800 underline underline-offset-4"
                    >
                      View in my dashboard
                    </Link>
                  </div>
                ) : !profile ? (
                  <div className="mt-4">
                    <p className="text-sm leading-relaxed text-ink-soft">
                      Create a free student account to enrol. It takes a minute.
                    </p>
                    <Link
                      href={`/signup?role=student&next=${encodeURIComponent(`/courses/${course.slug}`)}`}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-well-600 via-well-500 to-navy-700 px-6 py-3.5 text-base font-semibold text-white shadow-glow-green transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
                    >
                      Sign up to enrol
                    </Link>
                    <Link
                      href={`/login?role=student&next=${encodeURIComponent(`/courses/${course.slug}`)}`}
                      className="mt-3 block text-center text-xs font-medium text-ink-soft underline underline-offset-4 hover:text-navy-800"
                    >
                      I already have an account
                    </Link>
                  </div>
                ) : !profile.profile_completed ? (
                  <div className="mt-4">
                    <p className="text-sm leading-relaxed text-ink-soft">
                      Finish your profile before enrolling.
                    </p>
                    <Link
                      href="/onboarding"
                      className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-well-600 to-navy-700 px-6 py-3.5 text-base font-semibold text-white"
                    >
                      Complete profile
                    </Link>
                  </div>
                ) : allFull ? (
                  <div className="mt-4 rounded-xl border border-gold-200 bg-gold-50 px-4 py-4">
                    <p className="text-sm font-semibold text-ink">All current batches are full</p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                      Message us and we&apos;ll tell you as soon as the next batch opens.
                    </p>
                    <a
                      href={notifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-xs font-semibold text-white"
                    >
                      <MessageCircle className="size-3.5" />
                      Notify me on WhatsApp
                    </a>
                  </div>
                ) : (
                  <div className="mt-4">
                    <EnrollPanel
                      courseId={course.id}
                      slug={course.slug}
                      amount={course.price_inr}
                      upiId={upiId}
                      qrSvg={qrSvg}
                      batches={choices}
                    />
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
