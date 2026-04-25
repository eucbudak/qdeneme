import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpen, KeyRound, Star, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand-mark";
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
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <BrandMark size="sm" href={null} />
        <Button asChild variant="ghost" size="sm">
          <Link href="/login">Giriş yap</Link>
        </Button>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="mx-auto grid w-full max-w-6xl gap-12 px-4 pb-12 pt-8 lg:grid-cols-2 lg:items-center lg:py-20">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
              <Star className="h-3 w-3 fill-primary text-primary" />
              Haftalık deneme kulübü
            </span>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Her hafta seçtiğin{" "}
              <span className="text-brand-gradient">denemeyle</span> çalış.
            </h1>
            <p className="max-w-md text-base text-muted-foreground sm:text-lg">
              Kurumun açtığı yayınlar arasından sana uygun olanı seç, belirlenen
              gün ve saatte sınavına gir. Şifreni unuttuysan kurumuna başvur.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link href="/login">
                  Giriş yap
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#nasil">Nasıl çalışır?</Link>
              </Button>
            </div>
          </div>

          <HeroDecoration />
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

function HeroDecoration() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      <div className="absolute inset-0 rounded-[40%] bg-brand-gradient opacity-20 blur-3xl" />
      <div className="relative grid h-full place-items-center">
        <div className="absolute left-4 top-8 rotate-[-6deg]">
          <FloatingCard
            label="TYT Toprak"
            sub="Pazar 10:00"
            star
            tone="primary"
          />
        </div>
        <div className="absolute right-2 top-24 rotate-[4deg]">
          <FloatingCard
            label="TYT Hız"
            sub="Cumartesi 14:00"
            tone="accent"
          />
        </div>
        <div className="absolute bottom-10 left-12 rotate-[-2deg]">
          <FloatingCard label="TYT 3D" sub="Pazartesi 18:30" tone="muted" />
        </div>
        <div className="absolute right-10 bottom-6 rounded-2xl bg-card p-4 shadow-xl ring-1 ring-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-primary-foreground">
              <Star className="h-5 w-5 fill-current" />
            </div>
            <div className="text-xs">
              <div className="font-semibold">Seçimin kaydedildi</div>
              <div className="text-muted-foreground">3 Mayıs Pazar</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FloatingCard({
  label,
  sub,
  star,
  tone,
}: {
  label: string;
  sub: string;
  star?: boolean;
  tone: "primary" | "accent" | "muted";
}) {
  const toneClass =
    tone === "primary"
      ? "bg-card ring-primary/30 text-foreground"
      : tone === "accent"
        ? "bg-card ring-accent/40 text-foreground"
        : "bg-card ring-border text-muted-foreground";
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 shadow-lg ring-1 backdrop-blur ${toneClass}`}
    >
      <div className="text-sm">
        <div className="font-semibold">{label}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
      {star ? <Star className="h-4 w-4 fill-primary text-primary" /> : null}
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
