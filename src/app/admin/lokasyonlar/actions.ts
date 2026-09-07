"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

/** Boş string'i NULL'a çevirir — DB'de "" yerine NULL tutuluyor. */
function nullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function updateInstitution(
  id: string,
  patch: {
    name: string;
    hasCapacity: boolean;
    address: string;
    phone: string;
    mapsUrl: string;
  },
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await requireAdminClient();

    const name = patch.name.trim();
    if (!name) return { ok: false, error: "Lokasyon adı gerekli." };

    const mapsUrl = nullable(patch.mapsUrl);
    if (mapsUrl && !/^https?:\/\//i.test(mapsUrl)) {
      return { ok: false, error: "Harita linki http:// veya https:// ile başlamalı." };
    }

    const { data, error } = await supabase
      .from("institutions")
      .update({
        name,
        has_capacity: patch.hasCapacity,
        address: nullable(patch.address),
        phone: nullable(patch.phone),
        maps_url: mapsUrl,
      })
      .eq("id", id)
      .select("id")
      .returns<{ id: string }[]>();

    if (error) return { ok: false, error: error.message };
    if (!data || data.length === 0) {
      return { ok: false, error: "Lokasyon bulunamadı veya yetkin yok." };
    }

    // Lokasyon bilgisi ana sayfadaki kartlarda ve admin ekranlarında görünüyor.
    revalidatePath("/");
    revalidatePath("/admin/lokasyonlar");
    revalidatePath("/admin/hafta");
    revalidatePath("/admin/ogrenciler");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Beklenmeyen hata.",
    };
  }
}

export async function deleteInstitution(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await requireAdminClient();

    // profiles.institution_id FK'sinde cascade yok — bağlı öğrenci varsa DB
    // zaten reddeder, ama anlaşılır bir mesaj vermek için önden sayıyoruz.
    const { count: studentCount } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("institution_id", id);

    if ((studentCount ?? 0) > 0) {
      return {
        ok: false,
        error: `Bu lokasyona bağlı ${studentCount} öğrenci var. Önce onları başka lokasyona taşı veya sil.`,
      };
    }

    // exam_weeks cascade: haftalar, seanslar, yayınlar ve seçimler birlikte gider.
    const { data, error } = await supabase
      .from("institutions")
      .delete()
      .eq("id", id)
      .select("id")
      .returns<{ id: string }[]>();

    if (error) return { ok: false, error: error.message };
    if (!data || data.length === 0) {
      return { ok: false, error: "Lokasyon bulunamadı veya yetkin yok." };
    }

    revalidatePath("/");
    revalidatePath("/admin/lokasyonlar");
    revalidatePath("/admin/hafta");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Beklenmeyen hata.",
    };
  }
}
