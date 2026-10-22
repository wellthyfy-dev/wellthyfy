import type { CourseCategory, CourseMode } from "./platform";

/** Faculty accounts are only ever issued on this mail domain. */
export const FACULTY_DOMAIN = "wellthyfy.in";

/** True only for an address directly on @wellthyfy.in (not info.wellthyfy.in or look-alikes). */
export function isFacultyEmail(email: string | null | undefined) {
  return Boolean(email) && /^[^\s@]+@wellthyfy\.in$/i.test(String(email).trim());
}

export type IdType = "aadhaar" | "pan" | "passport" | "driving_licence" | "voter_id" | "other";

/** IDs accepted on the application form. */
export const ID_TYPES: { value: IdType; label: string; hasBack: boolean }[] = [
  { value: "pan", label: "PAN card", hasBack: false },
  { value: "aadhaar", label: "Aadhaar card", hasBack: true },
  { value: "voter_id", label: "Voter ID", hasBack: true },
];

/** Labels for every type, including ones older applications may carry. */
/** "PAN + Aadhaar" for current applications, the single ID type for older ones. */
export function idSummary(a: { id_type: IdType; pan_path: string | null }) {
  return a.pan_path ? "PAN + Aadhaar" : ID_TYPE_LABELS[a.id_type];
}

export const ID_TYPE_LABELS: Record<IdType, string> = {
  pan: "PAN card",
  aadhaar: "Aadhaar card",
  voter_id: "Voter ID",
  passport: "Passport",
  driving_licence: "Driving licence",
  other: "Other government ID",
};

export type ApplicationStatus = "pending" | "approved" | "rejected";

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: "Awaiting review",
  approved: "Approved",
  rejected: "Not approved",
};

export type FacultyApplication = {
  id: string;
  created_at: string;
  status: ApplicationStatus;
  full_name: string;
  contact_email: string;
  phone: string;
  whatsapp: string | null;
  address: string;
  qualification: string | null;
  /** Optional teaching experience / background. */
  experience: string | null;
  id_type: IdType;
  id_front_path: string;
  id_back_path: string | null;
  /** PAN card upload. Set on every application since PAN + Aadhaar became mandatory. */
  pan_path: string | null;
  // Legacy: applications made before courses were reviewed separately also
  // carried a proposed course. New applications leave these null.
  course_title: string | null;
  course_summary: string | null;
  course_description: string | null;
  course_modules: string | null;
  modules_pdf_path: string | null;
  category: CourseCategory | null;
  subcategory: string | null;
  mode: CourseMode | null;
  level: string | null;
  duration: string | null;
  language: string | null;
  fee_inr: number | null;
  admin_note: string | null;
  assigned_email: string | null;
  invite_token: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  faculty_user_id: string | null;
};

export const ID_UPLOAD = {
  maxBytes: 5 * 1024 * 1024,
  /** mime type -> extension allowed by the storage policy */
  types: { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "application/pdf": "pdf" },
} as const;
