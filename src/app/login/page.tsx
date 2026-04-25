import { Sparkles, Star } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="grid flex-1 lg:grid-cols-[5fr_7fr]">
      {/* Sol: marka paneli (lg+ görünür) */}
      <aside className="hidden flex-col justify-between bg-brand-gradient p-10 text-primary-foreground lg:flex">
        <BrandMark
          size="md"
          href={null}
          className="brightness-0 invert"
        />
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wider opacity-80">
              Bu hafta
            </span>
          </div>
          <h2 className="text-3xl font-bold leading-tight">
            Hangi denemeyi seçersen onunla yarış.
          </h2>
          <p className="max-w-md text-sm text-primary-foreground/80">
            Q Deneme&apos;de her hafta birkaç yayın arasından sen seçersin.
            Klasik tek markalı denemeden kurtulup kendi tarzına uyanı bul.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-primary-foreground/70">
          <Star className="h-4 w-4 fill-current" />
          <span>Q work · KNT Akademi Efeler · KNT Akademi Nazilli</span>
        </div>
      </aside>

      {/* Sağ: form */}
      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-3 text-center lg:hidden">
            <BrandMark size="md" href={null} className="mx-auto" />
          </div>
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-2xl font-bold">Tekrar hoş geldin</h1>
            <p className="text-sm text-muted-foreground">
              Kurumundan aldığın bilgilerle giriş yap.
            </p>
          </div>
          <LoginForm />
          <p className="text-center text-xs text-muted-foreground lg:text-left">
            Şifreni unuttuysan{" "}
            <span className="font-medium text-foreground">
              kurumuna başvur
            </span>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
