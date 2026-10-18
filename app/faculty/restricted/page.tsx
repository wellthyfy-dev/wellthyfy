import type { Metadata } from "next";
import Link from "next/link";
import { MailWarning } from "lucide-react";
import { AuthShell } from "@/components/platform/AuthShell";
import { FACULTY_DOMAIN } from "@/lib/faculty";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Faculty access",
  robots: { index: false, follow: false },
};

/** Shown to a faculty profile whose mail id is not on the Wellthyfy domain. */
export default function FacultyRestrictedPage() {
  return (
    <AuthShell
      role="faculty"
      title="Wellthyfy mail id required"
      subtitle={`Faculty access is limited to @${FACULTY_DOMAIN} accounts.`}
    >
      <div className="rounded-2xl border border-gold-200 bg-gold-50 p-5">
        <MailWarning className="size-6 text-gold-700" />
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          This account is signed in with an address outside @{FACULTY_DOMAIN}, so the faculty
          dashboard is unavailable. Your courses stay live. To regain access, contact{" "}
          <a href={siteConfig.emailHref} className="font-semibold text-navy-800 underline">
            {siteConfig.email}
          </a>{" "}
          and we will move you to a Wellthyfy mail id.
        </p>
      </div>

      <form action="/auth/signout" method="post" className="mt-5">
        <button
          type="submit"
          className="w-full rounded-full border border-navy-200 bg-white px-6 py-3 text-sm font-semibold text-navy-800 transition-colors hover:bg-navy-50"
        >
          Sign out
        </button>
      </form>
      <p className="mt-4 text-center text-xs text-ink-soft">
        <Link href="/" className="underline underline-offset-4 hover:text-navy-800">
          Back to the website
        </Link>
      </p>
    </AuthShell>
  );
}
