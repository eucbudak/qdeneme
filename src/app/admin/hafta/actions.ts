"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeDeadline } from "@/lib/date";
import type { InstitutionType } from "@/lib/db/types";

async function requireAdminClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Yetkisiz");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single<{ role: string; is_active: boolean }>();
  if (!profile || profile.role !== "ADMIN" || !profile.is_active) {
    throw new Error("Yetkisiz");
  }
  return supabase;
}

export async function createExamWeek(
  formData: FormData,
): Promise<{ ok: boolean; error?: string; id?: string }> {
  try {
    const supabase = await requireAdminClient();

    const institutionId = String(formData.get("institution_id") ?? "").trim();
    const examDate = String(formData.get("exam_date") ?? "").trim();
    if (!institutionId || !examDate) {
      return { ok: false, error: "Lokasyon ve tarih gerekli." };
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(examDate)) {
      return { ok: false, error: "Geçersiz tarih." };
    }

    const { data: inst } = await supabase
      .from("institutions")
      .select("id, type, has_capacity")
      .eq("id", institutionId)
      .single<{ id: string; type: InstitutionType; has_capacity: boolean }>();
    if (!inst) return { ok: false, error: "Lokasyon bulunamadı." };

    const deadline = computeDeadline(examDate);

    const { data: week, error: weekErr } = await supabase
      .from("exam_weeks")
      .insert({
        institution_id: institutionId,
        exam_date: examDate,
        selection_deadline: deadline,
      })
      .select("id")
      .single<{ id: string }>();

    if (weekErr || !week) {
      if (weekErr?.code === "23505") {
        return { ok: false, error: "Bu lokasyon için bu tarihte hafta zaten var." };
      }
      return { ok: false, error: weekErr?.message ?? "Hafta oluşturulamadı." };
    }

    // Varsayılan seansı yarat: Pazar 10:00 İstanbul = 07:00 UTC
    const defaultSessionDatetime = new Date(
      `${examDate}T10:00:00+03:00`,
    ).toISOString();

    await supabase.from("sessions").insert({
      exam_week_id: week.id,
      session_datetime: defaultSessionDatetime,
      capacity: inst.has_capacity ? 30 : null,
      is_open: true,
      is_default: true,
    });

    revalidatePath("/admin/hafta");
    return { ok: true, id: week.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Beklenmeyen hata.",
    };
  }
}

export async function deleteExamWeek(id: string) {
  const supabase = await requireAdminClient();
  await supabase.from("exam_weeks").delete().eq("id", id);
  revalidatePath("/admin/hafta");
  redirect("/admin/hafta");
}

// ============ Sessions ============

export async function addSession(
  examWeekId: string,
  datetime: string,
  capacity: number | null,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await requireAdminClient();
    const { error } = await supabase.from("sessions").insert({
      exam_week_id: examWeekId,
      session_datetime: datetime,
      capacity,
      is_open: true,
      is_default: false,
    });
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/admin/hafta/${examWeekId}`);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Beklenmeyen hata.",
    };
  }
}

export async function updateSession(
  sessionId: string,
  patch: { capacity?: number | null; is_open?: boolean },
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await requireAdminClient();
    const { data: row, error } = await supabase
      .from("sessions")
      .update(patch)
      .eq("id", sessionId)
      .select("exam_week_id")
      .single<{ exam_week_id: string }>();
    if (error) return { ok: false, error: error.message };
    if (row) revalidatePath(`/admin/hafta/${row.exam_week_id}`);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Beklenmeyen hata.",
    };
  }
}

export async function setDefaultSession(
  examWeekId: string,
  sessionId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await requireAdminClient();
    // Önce tüm seansları unset
    await supabase
      .from("sessions")
      .update({ is_default: false })
      .eq("exam_week_id", examWeekId);
    const { error } = await supabase
      .from("sessions")
      .update({ is_default: true })
      .eq("id", sessionId);
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/admin/hafta/${examWeekId}`);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Beklenmeyen hata.",
    };
  }
}

export async function deleteSession(
  sessionId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await requireAdminClient();
    const { data: row } = await supabase
      .from("sessions")
      .select("exam_week_id, is_default")
      .eq("id", sessionId)
      .single<{ exam_week_id: string; is_default: boolean }>();
    if (!row) return { ok: false, error: "Seans bulunamadı." };
    if (row.is_default) {
      return {
        ok: false,
        error: "Varsayılan seans silinemez. Önce başka bir seansı varsayılan yap.",
      };
    }
    const { error } = await supabase.from("sessions").delete().eq("id", sessionId);
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/admin/hafta/${row.exam_week_id}`);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Beklenmeyen hata.",
    };
  }
}

// ============ Publishers ============

export async function addPublisher(
  examWeekId: string,
  name: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await requireAdminClient();
    if (!name.trim()) return { ok: false, error: "İsim gerekli." };

    // Eğer bu haftanın ilk yayını ise varsayılan yap
    const { count } = await supabase
      .from("publishers")
      .select("id", { count: "exact", head: true })
      .eq("exam_week_id", examWeekId);

    const { error } = await supabase.from("publishers").insert({
      exam_week_id: examWeekId,
      name: name.trim(),
      is_default: (count ?? 0) === 0,
    });
    if (error) {
      if (error.code === "23505") {
        return { ok: false, error: "Bu yayın zaten eklenmiş." };
      }
      return { ok: false, error: error.message };
    }
    revalidatePath(`/admin/hafta/${examWeekId}`);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Beklenmeyen hata.",
    };
  }
}

export async function setDefaultPublisher(
  examWeekId: string,
  publisherId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await requireAdminClient();
    await supabase
      .from("publishers")
      .update({ is_default: false })
      .eq("exam_week_id", examWeekId);
    const { error } = await supabase
      .from("publishers")
      .update({ is_default: true })
      .eq("id", publisherId);
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/admin/hafta/${examWeekId}`);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Beklenmeyen hata.",
    };
  }
}

export async function deletePublisher(
  publisherId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await requireAdminClient();
    const { data: row } = await supabase
      .from("publishers")
      .select("exam_week_id, is_default")
      .eq("id", publisherId)
      .single<{ exam_week_id: string; is_default: boolean }>();
    if (!row) return { ok: false, error: "Yayın bulunamadı." };
    if (row.is_default) {
      return {
        ok: false,
        error: "Varsayılan yayın silinemez. Önce başka bir yayını varsayılan yap.",
      };
    }
    const { error } = await supabase.from("publishers").delete().eq("id", publisherId);
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/admin/hafta/${row.exam_week_id}`);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Beklenmeyen hata.",
    };
  }
}
