import Link from "next/link";
import { ArrowLeft, GraduationCap, Users } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/accents";
import type { UserRole } from "@/lib/platform";

export const ROLE_META: Record<
  UserRole,
  { label: string; icon: typeof Users; tile: string; blurb: string }
> = {
  faculty: {
    label: "Faculty",
    icon: Users,
    tile: "from-navy-500 to-navy-800",
    blurb: "Create and publish courses, and track every enrolment.",
  },
  student: {
    label: "Student",
    icon: GraduationCap,
    tile: "from-well-400 to-well-600",
    blurb: "Enrol in courses and keep your learning in one place.",
  },
};

export function AuthShell({
  role,
  title,
  subtitle,
  children,
  footer,
}: {
  role: UserRole;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const meta = ROLE_META[role];
  const Icon = meta.icon;

  return (
    <div className="relative flex min-h-svh items-center justify-center px-5 py-28 md:py-32">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="group mb-7 inline-flex items-center gap-2 text-sm font-semibold text-ink-soft transition-colors hover:text-well-700"
        >
          <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Back to home
        </Link>

        <div className="overflow-hidden rounded-3xl border border-navy-900/7 bg-white/90 shadow-lift backdrop-blur-md">
          <div className="h-1 w-full bg-gradient-to-r from-well-600 via-navy-700 to-gold-500" />

          <div className="p-7 sm:p-9">
            <Logo variant="header" />

            <div className="mt-7 flex items-start gap-3.5">
              <span
                className={cn(
                  "grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white",
                  meta.tile,
                )}
              >
                <Icon className="size-5" strokeWidth={2} />
              </span>
              <div>
                <h1 className="text-xl font-semibold sm:text-2xl">{title}</h1>
                <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>
              </div>
            </div>

            <div className="mt-7">{children}</div>
          </div>

          {footer && (
            <div className="border-t border-navy-900/7 bg-well-50/50 px-7 py-5 text-center text-sm text-ink-soft sm:px-9">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
