"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/accents";

export type AdminTab = { href: string; label: string; badge?: number };

/** Admin navigation with a live "needs attention" count on each tab. */
export default function AdminTabs({ tabs }: { tabs: AdminTab[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin sections" className="mt-6 flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const active =
          tab.href === "/admin" ? pathname === "/admin" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-well-50 text-navy-800 ring-1 ring-well-200"
                : "text-ink-soft hover:bg-white/70 hover:text-navy-800",
            )}
          >
            {tab.label}
            {tab.badge ? (
              <span className="grid min-w-5 place-items-center rounded-full bg-gold-500 px-1.5 text-[11px] font-bold leading-5 text-white">
                {tab.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
