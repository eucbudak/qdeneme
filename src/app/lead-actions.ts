"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { GradeLevel, StudyTrack } from "@/lib/db/types";

const VALID_GRADES: GradeLevel[] = [
  "GRADE_9",
  "GRADE_10",
  "GRADE_11",
  "GRADE_12",
  "MEZUN",
];
const VALID_TRACKS: StudyTrack[] = ["SAY", "EA", "DIL", "SOZEL"];

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return null;
  if (digits.length > 15) return null;
  return digits;
}

export async function submitLeadApplication(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const fullName = String(formData.get("full_name") ?? "").trim();
    const grade = String(formData.get("grade") ?? "").trim();
    const track = String(formData.get("track") ?? "").trim();
    const phoneRaw = String(formData.get("phone") ?? "").trim();
    const parentPhoneRaw = String(formData.get("parent_phone") ?? "").trim();
    const institutionId = String(
      formData.get("preferred_institution_id") ?? "",
    ).trim();

    if (fullName.length < 3) {
      return { ok: false, error: "Ad soyad en az 3 karakter olmalı." };
    }
    if (!VALID_GRADES.includes(grade as GradeLevel)) {
      return { ok: false, error: "Sınıf seçimi geçersiz." };
    }
    if (!VALID_TRACKS.includes(track as StudyTrack)) {
      return { ok: false, error: "Bölüm seçimi geçersiz." };
    }
    const phone = normalizePhone(phoneRaw);
    if (!phone) {
      return { ok: false, error: "Geçerli bir telefon numarası gir." };
    }
    let parentPhone: string | null = null;
    if (parentPhoneRaw) {
      const norm = normalizePhone(parentPhoneRaw);
      if (!norm) {
        return { ok: false, error: "Veli telefon numarası geçersiz." };
      }
      parentPhone = norm;
    }
    if (!institutionId) {
      return { ok: false, error: "Lokasyon seç." };
    }

    const supabase = createAdminClient();

    // Lokasyon var mı doğrula (RLS'siz query)
    const { data: inst } = await supabase
      .from("institutions")
      .select("id")
      .eq("id", institutionId)
      .single<{ id: string }>();
    if (!inst) {
      return { ok: false, error: "Geçersiz lokasyon." };
    }

    const { error } = await supabase.from("lead_applications").insert({
      full_name: fullName,
      grade,
      track,
      phone,
      parent_phone: parentPhone,
      preferred_institution_id: institutionId,
    });
    if (error) {
      return { ok: false, error: "Başvuru kaydedilemedi. Tekrar dene." };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: "Beklenmeyen hata. Tekrar dene." };
  }
}
