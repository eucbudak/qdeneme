"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Yetkisiz");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single<{ role: "STUDENT" | "ADMIN"; is_active: boolean }>();
  if (!profile || profile.role !== "ADMIN" || !profile.is_active) {
    throw new Error("Yetkisiz");
  }
}

export async function createStudent(formData: FormData): Promise<{
  ok: boolean;
  error?: string;
}> {
  try {
    await requireAdmin();

    const username = String(formData.get("username") ?? "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") ?? "");
    const fullName = String(formData.get("full_name") ?? "").trim();
    const institutionId = String(formData.get("institution_id") ?? "").trim();

    if (!username || !password || !fullName || !institutionId) {
      return { ok: false, error: "Tüm alanlar gerekli." };
    }
    if (!/^[a-z0-9._-]{3,32}$/.test(username)) {
      return {
        ok: false,
        error: "Kullanıcı adı 3-32 karakter, küçük harf/rakam/._- olabilir.",
      };
    }
    if (password.length < 8) {
      return { ok: false, error: "Şifre en az 8 karakter olmalı." };
    }

    const admin = createAdminClient();

    // 1) Auth user yarat
    const { data: created, error: authErr } = await admin.auth.admin.createUser(
      {
        email: `${username}@qdeneme.local`,
        password,
        email_confirm: true,
      },
    );

    if (authErr || !created.user) {
      if (authErr?.message?.toLowerCase().includes("already")) {
        return { ok: false, error: "Bu kullanıcı adı zaten alınmış." };
      }
      return { ok: false, error: authErr?.message ?? "Kullanıcı oluşturulamadı." };
    }

    // 2) Profile ekle
    const { error: profErr } = await admin.from("profiles").insert({
      id: created.user.id,
      username,
      role: "STUDENT",
      institution_id: institutionId,
      full_name: fullName,
      is_active: true,
    });

    if (profErr) {
      // Rollback auth user
      await admin.auth.admin.deleteUser(created.user.id);
      return { ok: false, error: profErr.message };
    }

    revalidatePath("/admin/ogrenciler");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Beklenmeyen hata.",
    };
  }
}

export async function resetStudentPassword(
  studentId: string,
  newPassword: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
    if (newPassword.length < 8) {
      return { ok: false, error: "Şifre en az 8 karakter olmalı." };
    }
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.updateUserById(studentId, {
      password: newPassword,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Beklenmeyen hata.",
    };
  }
}

export async function toggleStudentActive(
  studentId: string,
  isActive: boolean,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    const { error } = await admin
      .from("profiles")
      .update({ is_active: isActive })
      .eq("id", studentId);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/ogrenciler");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Beklenmeyen hata.",
    };
  }
}
