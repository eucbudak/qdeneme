"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { LeadStatus } from "@/lib/db/types";

const VALID_STATUSES: LeadStatus[] = [
  "NEW",
  "CONTACTING",
  "NOT_REACHED",
  "CONVERTED",
  "REJECTED",
];

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

export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!VALID_STATUSES.includes(status)) {
      return { ok: false, error: "Geçersiz durum." };
    }
    const supabase = await requireAdminClient();
    const { error } = await supabase
      .from("lead_applications")
      .update({ status })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/leads");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Beklenmeyen hata.",
    };
  }
}

export async function updateLeadNotes(
  id: string,
  notes: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await requireAdminClient();
    const trimmed = notes.trim();
    const { error } = await supabase
      .from("lead_applications")
      .update({ notes: trimmed.length > 0 ? trimmed : null })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/leads");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Beklenmeyen hata.",
    };
  }
}

export async function deleteLead(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await requireAdminClient();
    const { error } = await supabase
      .from("lead_applications")
      .delete()
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/leads");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Beklenmeyen hata.",
    };
  }
}
