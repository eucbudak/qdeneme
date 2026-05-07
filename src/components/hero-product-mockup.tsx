import Image from "next/image";
import { CalendarDays, CheckCircle2, Clock, Sparkles } from "lucide-react";

/**
 * Hero için ürün mockup'ı: telefon çerçevesi içinde örnek "yayın seç" ekranı.
 * Stock fotoğraf yerine ürünün kendisini gösteriyor — daha güçlü first impression.
 */
export function HeroProductMockup({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="relative mx-auto aspect-square w-full max-w-md">
        {/* Arka plan blob */}
        <div
          aria-hidden
          className="absolute inset-6 rounded-[40%] bg-brand-gradient opacity-25 blur-3xl"
        />

        {/* Telefon çerçevesi — eğik dur, yumuşak gölge */}
        <div
          className="absolute left-1/2 top-1/2 w-[62%] -translate-x-1/2 -translate-y-1/2 rotate-[-4deg] rounded-[2.4rem] border-4 border-foreground/85 bg-background p-1.5 shadow-2xl ring-1 ring-foreground/15"
          style={{ aspectRatio: "9 / 18" }}
        >
          {/* Çentik */}
          <div className="absolute left-1/2 top-2 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-foreground/85" />

          <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-card to-muted/40">
            {/* Status bar */}
            <div className="flex items-center justify-between px-4 pt-2.5 text-[8px] font-semibold tabular-nums text-foreground/70">
              <span>09:41</span>
              <span className="opacity-70">•••</span>
            </div>

            {/* Header */}
            <div className="px-3 pt-4">
              <div className="flex items-center gap-1.5 text-[8px] font-medium uppercase tracking-wider text-primary">
                <Sparkles className="h-2.5 w-2.5" />
                <span>Bu hafta</span>
              </div>
              <div className="mt-1 text-[11px] font-bold leading-tight">
                Yayınını seç
              </div>
              <div className="mt-1 flex items-center gap-1 text-[7.5px] text-muted-foreground">
                <CalendarDays className="h-2 w-2" />
                <span>Pazar · 10:00</span>
                <span className="mx-1 opacity-50">·</span>
                <Clock className="h-2 w-2" />
                <span>2 gün kaldı</span>
              </div>
            </div>

            {/* Yayın kartları */}
            <div className="mt-3 space-y-1.5 px-3">
              <MockPublisherRow logo="3d" name="3D Yayınları" selected />
              <MockPublisherRow logo="karekok" name="Karekök Yayınları" />
              <MockPublisherRow logo="limit" name="Limit Yayınları" />
              <MockPublisherRow logo="apotemi" name="Apotemi" />
            </div>

            {/* Alt CTA */}
            <div className="absolute inset-x-2.5 bottom-2.5">
              <div className="flex h-7 items-center justify-center gap-1 rounded-xl bg-brand-gradient text-[8.5px] font-semibold text-primary-foreground shadow-md">
                <CheckCircle2 className="h-3 w-3" strokeWidth={2.5} />
                <span>Seçimi onayla</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating accent — sol üstte rozet */}
        <div className="absolute left-3 top-8 rotate-[-6deg] rounded-xl border bg-card px-2.5 py-1.5 shadow-lg">
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-success/20 text-success-foreground">
              <CheckCircle2 className="h-3 w-3 text-success" strokeWidth={2.5} />
            </span>
            <div>
              <div className="text-[9px] font-bold leading-none">+12 öğrenci</div>
              <div className="mt-0.5 text-[7px] uppercase tracking-wider text-muted-foreground">
                bu hafta seçti
              </div>
            </div>
          </div>
        </div>

        {/* Sağ altta yıldız bandı */}
        <div className="absolute right-2 bottom-10 rotate-[5deg] rounded-xl border bg-card px-2.5 py-1.5 shadow-lg">
          <div className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
            Pazar
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-[10px] font-bold">
            <span className="text-brand-gradient">Deneme</span>
            <span>Günü</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockPublisherRow({
  logo,
  name,
  selected = false,
}: {
  logo: string;
  name: string;
  selected?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border p-1.5 transition-all ${
        selected
          ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
          : "border-border/60 bg-background/40"
      }`}
    >
      <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-md bg-white ring-1 ring-border/60">
        <Image
          src={`/publishers/${logo}.png`}
          alt=""
          fill
          sizes="24px"
          className="object-contain p-0.5"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[8.5px] font-semibold leading-tight">
          {name}
        </div>
      </div>
      <div
        className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-full ${
          selected
            ? "bg-primary text-primary-foreground"
            : "border border-border/60 bg-background"
        }`}
      >
        {selected && (
          <CheckCircle2 className="h-2.5 w-2.5" strokeWidth={3} />
        )}
      </div>
    </div>
  );
}
