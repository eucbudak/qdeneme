"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error?: string } | undefined;

export async function signIn(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Kullanıcı adı ve şifre gereklidir." };
  }

  // Dahili email formatı — kullanıcı asla görmez.
  const email = `${username}@qdeneme.local`;

  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !authData.user) {
    return { error: "Kullanıcı adı veya şifre hatalı." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", authData.user.id)
    .single<{ role: "STUDENT" | "ADMIN"; is_active: boolean }>();

  if (!profile || !profile.is_active) {
    await supabase.auth.signOut();
    return { error: "Hesap aktif değil. Kurumunuza başvurun." };
  }

  redirect(profile.role === "ADMIN" ? "/admin" : "/student");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
