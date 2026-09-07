"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin(): Promise<{ userId: string }> {
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
  return { userId: user.id };
}

const USERNAME_RE = /^[a-z0-9._-]{3,32}$/;

/** Hedefin gerçekten öğrenci olduğunu doğrular — admin kayıtları bu ekrandan yönetilmez. */
async function requireStudentTarget(
  admin: ReturnType<typeof createAdminClient>,
  studentId: string,
) {
  const { data } = await admin
    .from("profiles")
    .select("id, username, role")
    .eq("id", studentId)
    .single<{ id: string; username: string; role: "STUDENT" | "ADMIN" }>();
  if (!data) return { error: "Öğrenci bulunamadı." as const, student: null };
  if (data.role !== "STUDENT") {
    return { error: "Bu kayıt öğrenci değil." as const, student: null };
  }
  return { error: null, student: data };
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

export async function updateStudent(
  studentId: string,
  patch: { fullName: string; username: string; institutionId: string },
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();

    const fullName = patch.fullName.trim();
    const username = patch.username.trim().toLowerCase();
    const institutionId = patch.institutionId.trim();

    if (!fullName || !username || !institutionId) {
      return { ok: false, error: "Ad, kullanıcı adı ve lokasyon gerekli." };
    }
    if (!USERNAME_RE.test(username)) {
      return {
        ok: false,
        error: "Kullanıcı adı 3-32 karakter, küçük harf/rakam/._- olabilir.",
      };
    }

    const admin = createAdminClient();
    const { error: targetErr, student } = await requireStudentTarget(
      admin,
      studentId,
    );
    if (targetErr || !student) return { ok: false, error: targetErr! };

    // Kullanıcı adı değiştiyse auth e-postası da taşınmalı — giriş onunla yapılıyor.
    if (username !== student.username) {
      // email_confirm olmadan yeni adres doğrulanmamış kalır ve giriş bozulur.
      const { error: authErr } = await admin.auth.admin.updateUserById(
        studentId,
        { email: `${username}@qdeneme.local`, email_confirm: true },
      );
      if (authErr) {
        if (authErr.message?.toLowerCase().includes("already")) {
          return { ok: false, error: "Bu kullanıcı adı zaten alınmış." };
        }
        return { ok: false, error: authErr.message };
      }
    }

    const { error } = await admin
      .from("profiles")
      .update({
        full_name: fullName,
        username,
        institution_id: institutionId,
      })
      .eq("id", studentId);

    if (error) {
      // Profil yazılamadıysa auth e-postasını geri al, ikisi ayrışmasın.
      if (username !== student.username) {
        await admin.auth.admin.updateUserById(studentId, {
          email: `${student.username}@qdeneme.local`,
          email_confirm: true,
        });
      }
      if (error.code === "23505") {
        return { ok: false, error: "Bu kullanıcı adı zaten alınmış." };
      }
      return { ok: false, error: error.message };
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

export async function deleteStudent(
  studentId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { userId } = await requireAdmin();
    if (userId === studentId) {
      return { ok: false, error: "Kendi hesabını silemezsin." };
    }

    const admin = createAdminClient();
    const { error: targetErr, student } = await requireStudentTarget(
      admin,
      studentId,
    );
    if (targetErr || !student) return { ok: false, error: targetErr! };

    // auth.users silinince profiles → selections/admin_alerts cascade ile temizlenir.
    const { error } = await admin.auth.admin.deleteUser(studentId);
    if (error) return { ok: false, error: error.message };

    revalidatePath("/admin/ogrenciler");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Beklenmeyen hata.",
    };
  }
}
