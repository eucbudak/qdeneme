"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveSelection(
  examWeekId: string,
  publisherId: string,
  sessionId: string | null,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Oturum yok." };

    // Hafta geçerli mi ve deadline?
    const { data: week } = await supabase
      .from("exam_weeks")
      .select("id, institution_id, selection_deadline, is_locked")
      .eq("id", examWeekId)
      .single<{
        id: string;
        institution_id: string;
        selection_deadline: string;
        is_locked: boolean;
      }>();
    if (!week) return { ok: false, error: "Hafta bulunamadı." };
    if (week.is_locked || new Date(week.selection_deadline).getTime() < Date.now()) {
      return { ok: false, error: "Seçim süresi doldu." };
    }

    // Öğrencinin lokasyonu haftayla eşleşiyor mu?
    const { data: profile } = await supabase
      .from("profiles")
      .select("institution_id, is_active")
      .eq("id", user.id)
      .single<{ institution_id: string | null; is_active: boolean }>();
    if (!profile?.is_active || profile.institution_id !== week.institution_id) {
      return { ok: false, error: "Bu sınava erişim yok." };
    }

    // Publisher doğru hafta mı?
    const { data: pub } = await supabase
      .from("publishers")
      .select("id")
      .eq("id", publisherId)
      .eq("exam_week_id", examWeekId)
      .maybeSingle<{ id: string }>();
    if (!pub) return { ok: false, error: "Yayın geçersiz." };

    // Seans doğru hafta + açık + kapasite uygun mu?
    if (sessionId) {
      const { data: sess } = await supabase
        .from("sessions")
        .select("id, is_open, capacity")
        .eq("id", sessionId)
        .eq("exam_week_id", examWeekId)
        .maybeSingle<{ id: string; is_open: boolean; capacity: number | null }>();
      if (!sess) return { ok: false, error: "Seans geçersiz." };
      if (!sess.is_open) return { ok: false, error: "Seçtiğin seans kapalı." };

      if (sess.capacity !== null) {
        const { count = 0 } = await supabase
          .from("selections")
          .select("id", { count: "exact", head: true })
          .eq("session_id", sessionId)
          .neq("student_id", user.id);
        if ((count ?? 0) >= sess.capacity) {
          return { ok: false, error: "Seçtiğin seans dolu." };
        }
      }
    }

    // Upsert: aynı (student, week) için tek kayıt
    const { error } = await supabase
      .from("selections")
      .upsert(
        {
          student_id: user.id,
          exam_week_id: examWeekId,
          publisher_id: publisherId,
          session_id: sessionId,
          is_default_assigned: false,
        },
        { onConflict: "student_id,exam_week_id" },
      );

    if (error) return { ok: false, error: error.message };

    revalidatePath("/student");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Beklenmeyen hata.",
    };
  }
}
