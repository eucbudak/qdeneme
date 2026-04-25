// DB'deki enum ve entity tipleri. SQL schema ile birebir eşleşmeli.

export type InstitutionType = "Q_WORK" | "KNT_EFELER" | "KNT_NAZILLI";
export type UserRole = "STUDENT" | "ADMIN";
export type AlertReason =
  | "DEFAULT_SESSION_FULL"
  | "DEFAULT_SESSION_CLOSED"
  | "NO_DEFAULT_PUBLISHER"
  | "NO_DEFAULT_SESSION";

export type Institution = {
  id: string;
  name: string;
  type: InstitutionType;
  has_capacity: boolean;
};

export type Profile = {
  id: string; // auth.users(id) ile aynı
  username: string;
  role: UserRole;
  institution_id: string | null;
  full_name: string;
  is_active: boolean;
};

export type ExamWeek = {
  id: string;
  institution_id: string;
  exam_date: string; // ISO date (YYYY-MM-DD)
  selection_deadline: string; // ISO timestamp
  is_locked: boolean;
};

export type Session = {
  id: string;
  exam_week_id: string;
  session_datetime: string; // ISO timestamp
  capacity: number | null;
  is_open: boolean;
  is_default: boolean;
};

export type Publisher = {
  id: string;
  exam_week_id: string;
  name: string;
  is_default: boolean;
};

export type Selection = {
  id: string;
  student_id: string;
  exam_week_id: string;
  publisher_id: string;
  session_id: string | null;
  is_default_assigned: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminAlert = {
  id: string;
  exam_week_id: string;
  student_id: string;
  reason: AlertReason;
  created_at: string;
  is_resolved: boolean;
};
