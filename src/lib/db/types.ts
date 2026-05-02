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
  selection_deadline: string; // ISO timestamp — bu tarihten sonra varsayılana atanır
  change_lock_at: string | null; // ISO timestamp — bu tarihten sonra öğrenci değişiklik yapamaz (NULL ise kullanılmaz)
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

export type GradeLevel = "GRADE_9" | "GRADE_10" | "GRADE_11" | "GRADE_12" | "MEZUN";
export type StudyTrack = "SAY" | "EA" | "DIL" | "SOZEL";
export type LeadStatus = "NEW" | "CONTACTING" | "NOT_REACHED" | "CONVERTED" | "REJECTED";

export type LeadApplication = {
  id: string;
  full_name: string;
  grade: GradeLevel;
  track: StudyTrack;
  phone: string;
  parent_phone: string | null;
  preferred_institution_id: string;
  status: LeadStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export const GRADE_LABELS: Record<GradeLevel, string> = {
  GRADE_9: "9. Sınıf",
  GRADE_10: "10. Sınıf",
  GRADE_11: "11. Sınıf",
  GRADE_12: "12. Sınıf",
  MEZUN: "Mezun",
};

export const TRACK_LABELS: Record<StudyTrack, string> = {
  SAY: "Sayısal",
  EA: "Eşit Ağırlık",
  DIL: "Dil",
  SOZEL: "Sözel",
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Yeni",
  CONTACTING: "Aranıyor",
  NOT_REACHED: "Ulaşılamadı",
  CONVERTED: "Kayıt Oldu",
  REJECTED: "İlgilenmiyor",
};
