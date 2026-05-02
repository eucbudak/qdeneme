import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  KeyRound,
  Send,
  Star,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand-mark";
import { HeroIllustration } from "@/components/hero-illustration";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { LeadForm } from "./lead-form";

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

  // Anonim ziyaretçiler için institutions RLS okuma izni yok — admin client ile çek.
  // Lokasyon listesi zaten public bir bilgi (dropdown'da gösteriliyor).
  const adminClient = createAdminClient();
  const { data: institutions = [] } = await adminClient
    .from("institutions")
    .select("id, name")
    .order("name")
    .returns<{ id: string; name: string }[]>();

  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <BrandMark size="sm" href={null} />
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="#basvuru">Ön başvuru</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Giriş yap</Link>
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="mx-auto grid w-full max-w-6xl gap-12 px-4 pb-12 pt-8 lg:grid-cols-2 lg:items-center lg:py-20">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
              <Star className="h-3 w-3 fill-primary text-primary" />
              Haftalık deneme kulübü
            </span>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Her Hafta Seçtiğin{" "}
              <span className="text-brand-gradient">Denemeye</span> Gir
            </h1>
            <p className="max-w-md text-base text-muted-foreground sm:text-lg">
              Kurumun açtığı yayınlar arasından sana uygun olanı seç, belirlenen
              gün ve saatte sınavına gir. Henüz kayıtlı değilsen aşağıdan ön
              başvuru bırak — kurum seni arasın.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link href="#basvuru">
                  Ön başvuru yap
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Zaten kayıtlıyım</Link>
              </Button>
            </div>
          </div>

          <HeroIllustration className="mx-auto aspect-square w-full max-w-md" />
        </section>

        <section
          id="nasil"
          className="mx-auto w-full max-w-6xl px-4 py-12 lg:py-16"
        >
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">3 adımda</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sınav haftası şöyle akar
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <StepCard
              n={1}
              icon={KeyRound}
              title="Giriş yap"
              desc="Kurumundan aldığın kullanıcı adı ve şifreyle."
            />
            <StepCard
              n={2}
              icon={BookOpen}
              title="Yayını seç"
              desc="Bu haftanın yayın seçenekleri arasından dilediğini."
            />
            <StepCard
              n={3}
              icon={Trophy}
              title="Sınava gir"
              desc="Belirlenen lokasyon ve saatte denemeni çöz."
            />
          </div>
        </section>

        <section
          id="basvuru"
          className="border-t bg-muted/30 py-14 lg:py-20"
        >
          <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 lg:grid-cols-2 lg:items-start">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
                <Send className="h-3 w-3 text-primary" />
                Ön başvuru
              </span>
              <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                Kayıt olmak istiyor musun? <br />
                <span className="text-brand-gradient">Bilgini bırak</span>,
                seni arayalım.
              </h2>
              <p className="text-sm text-muted-foreground sm:text-base">
                Aşağıdaki formu doldur, ilgili kurum (KNT Akademi Efeler, Q
                Work veya KNT Akademi Nazilli) en kısa sürede sana ulaşsın.
                Yalnızca ön bilgi alıyoruz — kayıt sürecini telefonda
                netleştireceğiz.
              </p>
              <ul className="space-y-2 pt-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                  Sınıf ve bölümünü doğru seç ki sana uygun yayın önerelim.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                  Veli telefonu zorunlu değil; istersen ekleyebilirsin.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                  Tercih ettiğin lokasyon, aramayı yapacak kurumu belirler.
                </li>
              </ul>
            </div>
            <LeadForm institutions={institutions ?? []} />
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 text-xs text-muted-foreground">
          <BrandMark size="sm" href={null} className="opacity-70" />
          <span>© Q Deneme</span>
        </div>
      </footer>
    </div>
  );
}

function StepCard({
  n,
  icon: Icon,
  title,
  desc,
}: {
  n: number;
  icon: typeof BookOpen;
  title: string;
  desc: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card p-6 transition-shadow hover:shadow-md">
      <span className="absolute right-4 top-4 text-xs font-mono font-semibold text-muted-foreground">
        0{n}
      </span>
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/20">
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <h3 className="mb-1 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
