import Image from "next/image";
import { BookOpen } from "lucide-react";

type Publisher = {
  name: string;
  // /public/publishers/<slug>.png — Canva grid'inden kırpıldı
  slug: string;
};

const PUBLISHERS: Publisher[] = [
  { name: "3D Yayınları", slug: "3d" },
  { name: "Acil Yayınları", slug: "acil" },
  { name: "Ankara Yayıncılık", slug: "ankara" },
  { name: "Apotemi Yayınları", slug: "apotemi" },
  { name: "Barış Yayınları", slug: "baris" },
  { name: "Bilgi Sarmal", slug: "bilgi-sarmal" },
  { name: "Çap Yayınları", slug: "cap" },
  { name: "Endemik Yayınları", slug: "endemik" },
  { name: "Ephesus Yayınları", slug: "ephesus" },
  { name: "Esen Yayınları", slug: "esen" },
  { name: "Hız ve Renk", slug: "hiz-ve-renk" },
  { name: "Karekök Yayınları", slug: "karekok" },
  { name: "Limit Yayınları", slug: "limit" },
  { name: "Miray Yayınları", slug: "miray" },
  { name: "Okyanus Yayınları", slug: "okyanus" },
  { name: "Orbital Yayınları", slug: "orbital" },
  { name: "Origami Yayınları", slug: "origami" },
  { name: "Orijinal Matematik", slug: "orijinal-matematik" },
  { name: "Özdebir Yayınları", slug: "ozdebir" },
  { name: "Palme Yayınevi", slug: "palme" },
  { name: "Paraf Yayınları", slug: "paraf" },
  { name: "Paylaşım Yayınları", slug: "paylasim" },
  { name: "Proba Yayınları", slug: "proba" },
  { name: "Sonuç Yayınları", slug: "sonuc" },
  { name: "Supara Yayınları", slug: "supara" },
  { name: "Tammat Yayıncılık", slug: "tammat" },
  { name: "Toprak Yayıncılık", slug: "toprak" },
  { name: "ÜçDörtBeş Yayınları", slug: "ucdortbes" },
  { name: "VIP Yayınları", slug: "vip" },
];

function PublisherCard({ p }: { p: Publisher }) {
  return (
    <div className="group flex h-24 w-44 shrink-0 items-center gap-3 rounded-2xl border bg-card/90 px-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-border/60">
        <Image
          src={`/publishers/${p.slug}.png`}
          alt={`${p.name} logosu`}
          fill
          sizes="64px"
          className="object-contain p-1 grayscale opacity-80 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100"
        />
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold leading-tight">
          {p.name}
        </div>
        <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
          Yayınevi
        </div>
      </div>
    </div>
  );
}

export function PublishersStrip() {
  // İki defa renderla, yatay sonsuz akış efekti için
  const doubled = [...PUBLISHERS, ...PUBLISHERS];

  return (
    <section className="border-y bg-muted/20 py-12">
      <div className="mx-auto mb-6 max-w-6xl px-4 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
          <BookOpen className="h-3 w-3 text-primary" />
          Yayınlarımız
        </span>
        <h2 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">
          Türkiye Geneli Seçkin Yayınlar
        </h2>
      </div>
      <div
        className="group/strip relative overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div className="flex w-max animate-marquee gap-3">
          {doubled.map((p, i) => (
            <PublisherCard key={`${p.slug}-${i}`} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
