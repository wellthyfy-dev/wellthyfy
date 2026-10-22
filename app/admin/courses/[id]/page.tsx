import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, EyeOff, ExternalLink, FileText, MailWarning } from "lucide-react";
import CourseReviewPanel from "@/components/platform/CourseReviewPanel";
import { setCourseStatusAdmin } from "@/app/admin/actions";
import { cn } from "@/lib/accents";
import {
  CATEGORY_META,
  COURSE_STATUS_LABELS,
  COURSE_STATUS_TONE,
  MODE_LABELS,
  formatINR,
  modulesPdfUrl,
  type Course,
} from "@/lib/platform";
import { requireAdmin } from "@/lib/supabase/auth";

const NOTICES: Record<string, { tone: "ok" | "warn"; text: string }> = {
  approved: { tone: "ok", text: "Approved. The course is live and the faculty has been emailed." },
  "approved-nomail": {
    tone: "warn",
    text: "Approved and live, but the email to the faculty could not be sent.",
  },
  rejected: { tone: "ok", text: "Sent back for changes. The faculty has been emailed your note." },
  "rejected-nomail": {
    tone: "warn",
    text: "Sent back for changes, but the email could not be sent. They will still see your note on their dashboard.",
  },
};

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-navy-900/7 bg-white/90 p-6 shadow-soft backdrop-blur-sm sm:p-7">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-700/60">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm text-ink">{children || "—"}</dd>
    </div>
  );
}

export default async function AdminCourseDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const { id } = await params;
  const { notice } = await searchParams;
  const { supabase } = await requireAdmin();

  const { data } = await supabase.from("courses").select("*").eq("id", id).maybeSingle();
  const c = (data as Course | null) ?? null;
  if (!c) notFound();

  const { data: faculty } = c.faculty_id
    ? await supabase
        .from("profiles")
        .select("full_name, email, phone, whatsapp")
        .eq("id", c.faculty_id)
        .maybeSingle()
    : { data: null };

  const meta = CATEGORY_META[c.category];
  const banner = notice ? NOTICES[notice] : undefined;
  const modulesUrl = modulesPdfUrl(c.modules_pdf_path);
  const legacyModules = (c.modules ?? "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const when = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

  return (
    <>
      <Link
        href="/admin/courses"
        className="group inline-flex items-center gap-2 text-sm font-semibold text-ink-soft transition-colors hover:text-well-700"
      >
        <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
        All courses
      </Link>

      {banner && (
        <p
          role="status"
          className={cn(
            "mt-5 flex items-start gap-2.5 rounded-xl border px-4 py-3.5 text-sm font-medium",
            banner.tone === "ok"
              ? "border-well-200 bg-well-50 text-well-800"
              : "border-gold-200 bg-gold-50 text-gold-800",
          )}
        >
          {banner.tone === "ok" ? (
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-well-600" />
          ) : (
            <MailWarning className="mt-0.5 size-5 shrink-0 text-gold-700" />
          )}
          {banner.text}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold sm:text-3xl">{c.title}</h2>
          <p className="mt-1.5 text-sm text-ink-soft">
            By <span className="font-semibold text-ink">{c.faculty_name ?? "Unknown faculty"}</span>
            {c.submitted_at && <> · submitted {when(c.submitted_at)}</>}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-semibold",
            COURSE_STATUS_TONE[c.status],
          )}
        >
          {COURSE_STATUS_LABELS[c.status]}
        </span>
      </div>

      <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid min-w-0 gap-7">
          {c.cover_url && (
            <div className="overflow-hidden rounded-3xl border border-navy-900/7 shadow-soft">
              <Image
                src={c.cover_url}
                alt={`${c.title} banner`}
                width={1200}
                height={600}
                className="aspect-[2/1] w-full object-cover"
              />
            </div>
          )}

          <Block title="Course details">
            <dl className="grid gap-5 sm:grid-cols-2">
              <Fact label="Category">
                {meta.label} · {c.subcategory}
              </Fact>
              <Fact label="Fee">
                <span className="font-semibold">
                  {c.price_inr === 0 ? "Free" : formatINR(c.price_inr)}
                </span>
              </Fact>
              <Fact label="Mode">{MODE_LABELS[c.mode]}</Fact>
              <Fact label="Duration">{c.duration}</Fact>
              <Fact label="Level">{c.level}</Fact>
              <Fact label="Language">{c.language}</Fact>
              {c.summary && (
                <div className="sm:col-span-2">
                  <Fact label="Summary">{c.summary}</Fact>
                </div>
              )}
              <div className="sm:col-span-2">
                <Fact label="Description">
                  <span className="whitespace-pre-wrap">{c.description}</span>
                </Fact>
              </div>
              <div className="sm:col-span-2">
                <Fact label="Modules">
                  {modulesUrl ? (
                    <a
                      href={modulesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white px-4 py-2 text-sm font-semibold text-navy-800 transition-colors hover:bg-navy-50"
                    >
                      <FileText className="size-4" />
                      Open modules PDF
                      <ExternalLink className="size-3.5" />
                    </a>
                  ) : legacyModules.length > 0 ? (
                    <ol className="mt-1 grid gap-1.5">
                      {legacyModules.map((m, i) => (
                        <li key={`${i}-${m}`} className="flex gap-2.5">
                          <span className="w-5 shrink-0 text-right font-semibold tabular-nums text-navy-700/50">
                            {i + 1}
                          </span>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <span className="text-ink-soft">Not provided</span>
                  )}
                </Fact>
              </div>
            </dl>
          </Block>

          <Block title="Faculty">
            <dl className="grid gap-5 sm:grid-cols-2">
              <Fact label="Name">{faculty?.full_name ?? c.faculty_name}</Fact>
              <Fact label="Mail id">
                {faculty?.email && (
                  <a href={`mailto:${faculty.email}`} className="text-navy-700 underline">
                    {faculty.email}
                  </a>
                )}
              </Fact>
              <Fact label="Phone">{faculty?.phone}</Fact>
              <Fact label="WhatsApp">{faculty?.whatsapp}</Fact>
            </dl>
          </Block>
        </div>

        {/* Decision rail */}
        <aside className="grid content-start gap-5 lg:sticky lg:top-28 lg:self-start">
          {c.status === "pending_review" && <CourseReviewPanel courseId={c.id} />}

          {c.status === "published" && (
            <div className="rounded-3xl border border-navy-900/7 bg-white/90 p-6 shadow-soft backdrop-blur-sm">
              <p className="flex items-center gap-2 font-semibold text-well-800">
                <CheckCircle2 className="size-5 text-well-600" />
                Live on the site
              </p>
              {c.reviewed_at && (
                <p className="mt-2 text-sm text-ink-soft">Approved {when(c.reviewed_at)}</p>
              )}
              <div className="mt-5 grid gap-2.5">
                <Link
                  href={`/courses/${c.slug}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-well-600 to-navy-700 px-5 py-2.5 text-sm font-semibold text-white"
                >
                  View live course
                  <ExternalLink className="size-3.5" />
                </Link>
                <form action={setCourseStatusAdmin}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="status" value="draft" />
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-navy-200 bg-white px-5 py-2.5 text-sm font-semibold text-navy-800 transition-colors hover:bg-navy-50"
                  >
                    <EyeOff className="size-4" />
                    Take off the site
                  </button>
                </form>
              </div>
            </div>
          )}

          {c.status === "rejected" && (
            <div className="rounded-3xl border border-navy-900/7 bg-white/90 p-6 shadow-soft backdrop-blur-sm">
              <p className="font-semibold text-red-800">Changes requested</p>
              <p className="mt-3 whitespace-pre-wrap text-sm text-ink-soft">
                {c.review_note ?? "No note was recorded."}
              </p>
              <p className="mt-4 text-xs text-ink-soft">
                It returns to the review queue when the faculty resubmits.
              </p>
            </div>
          )}

          {(c.status === "draft" || c.status === "archived") && (
            <div className="rounded-3xl border border-navy-900/7 bg-white/90 p-6 shadow-soft backdrop-blur-sm">
              <p className="font-semibold text-ink">{COURSE_STATUS_LABELS[c.status]}</p>
              <p className="mt-2 text-sm text-ink-soft">
                Not submitted for review. It appears in your queue once the faculty submits it.
              </p>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
