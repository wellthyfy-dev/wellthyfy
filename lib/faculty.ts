import type { CourseCategory, CourseMode } from "./platform";

/** Faculty accounts are only ever issued on this mail domain. */
export const FACULTY_DOMAIN = "wellthyfy.in";

/** True only for an address directly on @wellthyfy.in (not info.wellthyfy.in or look-alikes). */
export function isFacultyEmail(email: string | null | undefined) {
  return Boolean(email) && /^[^\s@]+@wellthyfy\.in$/i.test(String(email).trim());
}

export type IdType = "aadhaar" | "pan" | "passport" | "driving_licence" | "voter_id" | "other";

export const ID_TYPES: { value: IdType; label: string; hasBack: boolean }[] = [
  { value: "aadhaar", label: "Aadhaar card", hasBack: true },
  { value: "pan", label: "PAN card", hasBack: false },
  { value: "passport", label: "Passport", hasBack: false },
  { value: "driving_licence", label: "Driving licence", hasBack: true },
  { value: "voter_id", label: "Voter ID", hasBack: true },
  { value: "other", label: "Other government ID", hasBack: true },
];

export const ID_TYPE_LABELS = Object.fromEntries(ID_TYPES.map((t) => [t.value, t.label])) as Record<
  IdType,
  string
>;

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
  experience: string;
  id_type: IdType;
  id_front_path: string;
  id_back_path: string | null;
  course_title: string;
  course_summary: string | null;
  course_description: string;
  /** Legacy typed modules; new applications upload `modules_pdf_path`. */
  course_modules: string | null;
  modules_pdf_path: string | null;
  category: CourseCategory;
  subcategory: string;
  mode: CourseMode;
  level: string | null;
  duration: string | null;
  language: string | null;
  fee_inr: number;
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
