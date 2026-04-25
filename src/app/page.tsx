import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single<{ role: "STUDENT" | "ADMIN" }>();
    redirect(profile?.role === "ADMIN" ? "/admin" : "/student");
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="mx-auto flex max-w-2xl flex-col items-center gap-8 px-6 py-24 text-center">
        <div className="flex flex-col gap-3">
          <h1 className="text-5xl font-semibold tracking-tight">Q Deneme</h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Her hafta yayın seçebildiğin deneme kulübü.
          </p>
        </div>

        <p className="max-w-md text-sm leading-7 text-zinc-500 dark:text-zinc-500">
          Kurumundan aldığın kullanıcı adı ve şifre ile giriş yap, bu haftaki
          denemeni seç. Şifreni unuttuysan kurumuna başvurman gerekir.
        </p>

        <Button asChild size="lg">
          <Link href="/login">Giriş yap</Link>
        </Button>
      </main>
    </div>
  );
}
