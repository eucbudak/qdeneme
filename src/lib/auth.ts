import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { InstitutionType, UserRole } from "@/lib/db/types";

export type SessionUser = {
  id: string;
  username: string;
  full_name: string;
  role: UserRole;
  institution_id: string | null;
  institution_name: string | null;
  institution_type: InstitutionType | null;
};

/**
 * Giriş yapmış kullanıcıyı getirir, yoksa /login'e yönlendirir.
 * Ayrıca role kontrolü yaptırılabilir — uygun değilse /login'e atar.
 */
export async function requireUser(role?: UserRole): Promise<SessionUser> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data } = await supabase
    .from("profiles")
    .select(
      "id, username, full_name, role, is_active, institution_id, institutions(name, type)",
    )
    .eq("id", user.id)
    .single<{
      id: string;
      username: string;
      full_name: string;
      role: UserRole;
      is_active: boolean;
      institution_id: string | null;
      institutions: { name: string; type: InstitutionType } | null;
    }>();

  if (!data || !data.is_active) {
    await supabase.auth.signOut();
    redirect("/login");
  }

  if (role && data.role !== role) {
    redirect(data.role === "ADMIN" ? "/admin" : "/student");
  }

  return {
    id: data.id,
    username: data.username,
    full_name: data.full_name,
    role: data.role,
    institution_id: data.institution_id,
    institution_name: data.institutions?.name ?? null,
    institution_type: data.institutions?.type ?? null,
  };
}
