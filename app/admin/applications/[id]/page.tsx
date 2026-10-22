import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, ExternalLink, FileText, Info, MailWarning } from "lucide-react";
import CopyField from "@/components/platform/CopyField";
import ReviewPanel from "@/components/platform/ReviewPanel";
import { resendInvite } from "@/app/admin/actions";
import { cn } from "@/lib/accents";
import {
  APPLICATION_STATUS_LABELS,
  ID_TYPE_LABELS,
  idSummary,
  type ApplicationStatus,
  type FacultyApplication,
} from "@/lib/faculty";
import { CATEGORY_META, MODE_LABELS, formatINR, modulesPdfUrl } from "@/lib/platform";
import { siteOrigin } from "@/lib/site-origin";
import { requireAdmin } from "@/lib/supabase/auth";

const TONE: Record<ApplicationStatus, string> = {
  pending: "border-gold-200 bg-gold-50 text-gold-800",
  approved: "border-well-200 bg-well-50 text-well-800",
  rejected: "border-red-200 bg-red-50 text-red-800",
};

const NOTICES: Record<string, { tone: "ok" | "warn"; text: string }> = {
  approved: {
    tone: "ok",
    text: "Approved. The invitation email with their mail id has been sent to the applicant.",
  },
  "approved-nomail": {
    tone: "warn",
    text: "Approved, but the invitation email could not be sent. Copy the invitation link below and send it to the applicant yourself.",
  },
  rejected: { tone: "ok", text: "Application rejected and the applicant has been notified." },
  "rejected-nomail": {
    tone: "warn",
    text: "Application rejected, but the notification email could not be sent.",
  },
  resent: { tone: "ok", text: "Invitation email sent again." },
  "resend-failed": {
    tone: "warn",
    text: "The invitation email could not be sent. Try again, or copy the link.",
  },
  "resend-unavailable": {
    tone: "warn",
    text: "There is no open invitation to resend (the account may already exist).",
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

/** "Test Person" -> "test.person", used only as a starting suggestion. */
function suggestLocalPart(name: string) {
  const words = name
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  return words.join(".") || "faculty";
}

export default async function ApplicationDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const { id } = await params;
  const { notice } = await searchParams;
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("faculty_applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  const a = (data as FacultyApplication | null) ?? null;
  if (!a) notFound();

  // Short-lived links: the ID bucket is private and these expire in 10 minutes.
  const sign = async (path: string | null) => {
    if (!path) return null;
    const { data } = await supabase.storage.from("applications").createSignedUrl(path, 600);
    return data?.signedUrl ?? null;
  };
  const [frontUrl, backUrl, panUrl] = await Promise.all([
    sign(a.id_front_path),
    sign(a.id_back_path),
    sign(a.pan_path),
  ]);

  const { data: courseRow } = await supabase
    .from("courses")
    .select("slug, status")
    .eq("application_id", a.id)
    .maybeSingle();

  const origin = await siteOrigin();
  const meta = a.category ? CATEGORY_META[a.category] : null;
  const banner = notice ? NOTICES[notice] : undefined;
  const modulesUrl = modulesPdfUrl(a.modules_pdf_path);
  const modules = (a.course_modules ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const idName = ID_TYPE_LABELS[a.id_type];
  const idFiles = [
    ...(a.pan_path ? [{ label: "PAN card", url: panUrl, path: a.pan_path }] : []),
    { label: a.pan_path ? `${idName} — front` : "Front", url: frontUrl, path: a.id_front_path },
    ...(a.id_back_path
      ? [{ label: a.pan_path ? `${idName} — back` : "Back", url: backUrl, path: a.id_back_path }]
      : []),
  ];

  return (
    <>
      <Link
        href="/admin/applications"
        className="group inline-flex items-center gap-2 text-sm font-semibold text-ink-soft transition-colors hover:text-well-700"
      >
        <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
        All applications
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
          <h2 className="text-2xl font-semibold sm:text-3xl">{a.full_name}</h2>
          <p className="mt-1.5 text-sm text-ink-soft">
            Faculty application · submitted{" "}
            {new Date(a.created_at).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <span
          className={cn("rounded-full border px-3.5 py-1.5 text-xs font-semibold", TONE[a.status])}
        >
          {APPLICATION_STATUS_LABELS[a.status]}
        </span>
      </div>

      <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid min-w-0 gap-7">
          <Block title="Applicant">
            <dl className="grid gap-5 sm:grid-cols-2">
              <Fact label="Email">
                <a href={`mailto:${a.contact_email}`} className="text-navy-700 underline">
                  {a.contact_email}
                </a>
              </Fact>
              <Fact label="Phone">{a.phone}</Fact>
              <Fact label="WhatsApp">{a.whatsapp}</Fact>
              <Fact label="Address">{a.address}</Fact>
            </dl>
          </Block>

          <Block title="Qualification">
            <dl className="grid gap-5">
              <Fact label="Qualification">
                <span className="whitespace-pre-wrap">{a.qualification}</span>
              </Fact>
              <Fact label="Teaching experience">
                <span className="whitespace-pre-wrap">{a.experience}</span>
              </Fact>
            </dl>
          </Block>

          <Block title={`Verification — ${idSummary(a)}`}>
            <p className="mb-4 flex items-start gap-2 text-xs leading-relaxed text-ink-soft">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              Private files. These links expire after 10 minutes — reload the page for fresh ones.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {idFiles.map((f) => {
                const isPdf = f.path.endsWith(".pdf");
                return (
                  <div key={f.path}>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-700/60">
                      {f.label}
                    </p>
                    {!f.url ? (
                      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-800">
                        File unavailable
                      </p>
                    ) : isPdf ? (
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 rounded-xl border border-navy-900/10 bg-navy-50/60 px-4 py-10 text-sm font-semibold text-navy-800 hover:bg-navy-50"
                      >
                        <FileText className="size-5" />
                        Open PDF
                      </a>
                    ) : (
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block"
                      >
                        <span className="relative block aspect-[3/2] overflow-hidden rounded-xl border border-navy-900/10 bg-navy-50">
                          <Image
                            src={f.url}
                            alt={f.label}
                            fill
                            unoptimized
                            sizes="(max-width: 640px) 100vw, 360px"
                            className="object-contain"
                          />
                        </span>
                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-navy-700 group-hover:underline">
                          Open full size
                          <ExternalLink className="size-3" />
                        </span>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </Block>

          {a.course_title && (
            <Block title="Proposed course (older application)">
              <dl className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Fact label="Title">
                    <span className="text-base font-semibold">{a.course_title}</span>
                  </Fact>
                </div>
                <Fact label="Category">
                  {meta?.label} · {a.subcategory}
                </Fact>
                <Fact label="Fee">
                  <span className="font-semibold">
                    {a.fee_inr == null ? "—" : formatINR(a.fee_inr)}
                  </span>
                </Fact>
                <Fact label="Mode">{a.mode ? MODE_LABELS[a.mode] : null}</Fact>
                <Fact label="Duration">{a.duration}</Fact>
                <Fact label="Level">{a.level}</Fact>
                <Fact label="Language">{a.language}</Fact>
                {a.course_summary && (
                  <div className="sm:col-span-2">
                    <Fact label="Summary">{a.course_summary}</Fact>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <Fact label="Description">
                    <span className="whitespace-pre-wrap">{a.course_description}</span>
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
                    ) : modules.length > 0 ? (
                      <ol className="mt-1 grid gap-1.5">
                        {modules.map((m, i) => (
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
          )}
        </div>

        {/* Decision rail */}
        <aside className="grid content-start gap-5 lg:sticky lg:top-28 lg:self-start">
          {a.status === "pending" && (
            <ReviewPanel applicationId={a.id} suggestedLocalPart={suggestLocalPart(a.full_name)} />
          )}

          {a.status === "approved" && (
            <div className="rounded-3xl border border-navy-900/7 bg-white/90 p-6 shadow-soft backdrop-blur-sm">
              <p className="flex items-center gap-2 font-semibold text-well-800">
                <CheckCircle2 className="size-5 text-well-600" />
                Approved
              </p>

              <div className="mt-5 grid gap-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-700/60">
                    Faculty mail id
                  </p>
                  <p className="mt-1 break-all text-sm font-semibold text-ink">
                    {a.assigned_email}
                  </p>
                </div>

                {a.faculty_user_id ? (
                  <p className="rounded-xl border border-well-200 bg-well-50 px-4 py-3 text-sm text-well-800">
                    Faculty account created.
                  </p>
                ) : (
                  <>
                    <p className="rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-sm text-gold-800">
                      Waiting for the faculty member to create their account.
                    </p>
                    <CopyField
                      label="Private invitation link"
                      value={`${origin}/faculty/join?token=${a.invite_token}`}
                    />
                    <form action={resendInvite}>
                      <input type="hidden" name="id" value={a.id} />
                      <button
                        type="submit"
                        className="w-full rounded-full border border-navy-200 bg-white px-5 py-2.5 text-sm font-semibold text-navy-800 transition-colors hover:bg-navy-50"
                      >
                        Resend invitation email
                      </button>
                    </form>
                  </>
                )}

                {courseRow && (
                  <Link
                    href={`/courses/${courseRow.slug}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-well-600 to-navy-700 px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    {courseRow.status === "published"
                      ? "View live course"
                      : "View course (unpublished)"}
                    <ExternalLink className="size-3.5" />
                  </Link>
                )}

                {a.admin_note && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-700/60">
                      Your note
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-ink-soft">{a.admin_note}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {a.status === "rejected" && (
            <div className="rounded-3xl border border-navy-900/7 bg-white/90 p-6 shadow-soft backdrop-blur-sm">
              <p className="font-semibold text-red-800">Not approved</p>
              {a.admin_note ? (
                <p className="mt-3 whitespace-pre-wrap text-sm text-ink-soft">{a.admin_note}</p>
              ) : (
                <p className="mt-3 text-sm text-ink-soft">No reason was recorded.</p>
              )}
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
