import type { Accent } from "./site";

/** Mirrors the `public.user_role` enum. */
export type UserRole = "student" | "faculty";

/** Mirrors `public.course_mode`. */
export type CourseMode = "online_live" | "recorded" | "offline" | "hybrid";

/** Mirrors `public.course_category`. Labelled "Health & Wellness" in the UI. */
export type CourseCategory = "wellness" | "wealth" | "happiness";

/** Mirrors `public.course_status`. */
export type CourseStatus = "draft" | "published" | "archived";

/** Mirrors `public.order_status`. */
export type OrderStatus = "pending" | "verified" | "rejected";

export type Profile = {
  id: string;
  role: UserRole;
  is_admin: boolean;
  full_name: string | null;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  aadhaar_front_path: string | null;
  aadhaar_back_path: string | null;
  profile_completed: boolean;
  created_at: string;
};

export type Course = {
  id: string;
  /** Null while an approved course is live but its faculty has no account yet. */
  faculty_id: string | null;
  application_id: string | null;
  /** Legacy typed modules; new courses use `modules_pdf_path`. */
  modules: string | null;
  modules_pdf_path: string | null;
  faculty_name: string | null;
  title: string;
  slug: string;
  summary: string | null;
  description: string;
  mode: CourseMode;
  category: CourseCategory;
  subcategory: string;
  level: string | null;
  duration: string | null;
  language: string | null;
  price_inr: number;
  cover_url: string | null;
  status: CourseStatus;
  published_at: string | null;
  created_at: string;
};

export type Order = {
  id: string;
  course_id: string;
  student_id: string;
  faculty_id: string | null;
  student_name: string | null;
  student_email: string | null;
  student_whatsapp: string | null;
  course_title: string;
  amount_inr: number;
  utr: string;
  payer_note: string | null;
  status: OrderStatus;
  created_at: string;
  reviewed_at: string | null;
};

export const CATEGORY_META: Record<
  CourseCategory,
  { label: string; accent: Accent; icon: string; blurb: string }
> = {
  wellness: {
    label: "Health & Wellness",
    accent: "green",
    icon: "flower",
    blurb: "Live Better • Feel Better • Stay Better",
  },
  wealth: {
    label: "Wealth",
    accent: "navy",
    icon: "wallet",
    blurb: "Learn Money • Manage Money • Grow Money",
  },
  happiness: {
    label: "Happiness",
    accent: "gold",
    icon: "sun",
    blurb: "Think Better • Connect Better • Live Better",
  },
};

export const CATEGORY_ORDER: CourseCategory[] = ["wellness", "wealth", "happiness"];

/** Suggested subcategories. "Other" reveals a free-text field. */
export const SUBCATEGORIES: Record<CourseCategory, string[]> = {
  wellness: [
    "Yoga",
    "Meditation",
    "Nutrition",
    "Diet Plan",
    "Weight Management",
    "Fitness & Movement",
    "Stress Management",
    "Holistic Healing",
    "Family Wellness",
  ],
  wealth: [
    "Investment",
    "Stock Market Trading",
    "Forex Trading",
    "Financial Literacy",
    "Budgeting & Saving",
    "Wealth Creation",
    "Entrepreneurship",
    "Business Finance",
    "Insurance & Protection",
  ],
  happiness: [
    "Mindfulness",
    "Emotional Intelligence",
    "Relationships",
    "Confidence Building",
    "Work-Life Balance",
    "Purpose & Goal Setting",
    "Positive Living",
    "Personal Development",
  ],
};

export const OTHER_SUBCATEGORY = "Other";

export const MODE_LABELS: Record<CourseMode, string> = {
  online_live: "Live online",
  recorded: "Self-paced (recorded)",
  offline: "In person",
  hybrid: "Hybrid",
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Awaiting verification",
  verified: "Verified",
  rejected: "Rejected",
};

/** URL-safe slug with a short random suffix so titles can repeat. */
export function slugify(title: string) {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base || "course"}-${suffix}`;
}

export function formatINR(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise);
}

/**
 * UPI deep link, which is also what the payment QR encodes.
 * `tr` carries our order reference so the payee can reconcile.
 */
export function upiLink({
  amount,
  note,
  ref,
}: {
  amount: number;
  note: string;
  ref?: string;
}) {
  const params = new URLSearchParams({
    pa: process.env.NEXT_PUBLIC_UPI_ID ?? "",
    pn: process.env.NEXT_PUBLIC_UPI_PAYEE_NAME ?? "Wellthyfy",
    am: String(amount),
    cu: "INR",
    tn: note.slice(0, 50),
  });
  if (ref) params.set("tr", ref);
  return `upi://pay?${params.toString()}`;
}

/** Module outlines are uploaded as one PDF to the public `course-modules` bucket. */
export const MODULES_PDF = {
  bucket: "course-modules",
  maxBytes: 10 * 1024 * 1024,
} as const;

export function modulesPdfUrl(path: string | null | undefined) {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = path.split("/").map(encodeURIComponent).join("/");
  return `${base}/storage/v1/object/public/${MODULES_PDF.bucket}/${key}`;
}
