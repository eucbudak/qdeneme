import { BookOpen } from "lucide-react";

type Publisher = {
  name: string;
  // Tailwind text color (text-...)
  color: string;
  initial: string;
};

const PUBLISHERS: Publisher[] = [
  { name: "3D Yayınları", color: "text-rose-500", initial: "3D" },
  { name: "Karekök", color: "text-emerald-600", initial: "K" },
  { name: "Limit", color: "text-blue-600", initial: "L" },
  { name: "Apotemi", color: "text-amber-600", initial: "A" },
  { name: "Esen", color: "text-violet-600", initial: "E" },
  { name: "Bilgi Sarmal", color: "text-cyan-600", initial: "B" },
  { name: "Çap", color: "text-pink-600", initial: "Ç" },
  { name: "Final", color: "text-orange-600", initial: "F" },
  { name: "Hız", color: "text-indigo-600", initial: "H" },
  { name: "Acil", color: "text-red-600", initial: "A" },
];

function PublisherCard({ p }: { p: Publisher }) {
  return (
    <div className="group flex h-20 w-44 shrink-0 items-center gap-3 rounded-xl border bg-card/80 px-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-lg bg-muted font-mono text-lg font-bold ${p.color} grayscale transition-all group-hover:grayscale-0`}
      >
        {p.initial}
      </span>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold">{p.name}</div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Yayınları
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
          Tanıdık yayınlar, her hafta yeni deneme
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          TYT/AYT&apos;ye hazırlanırken tercih ettiğin markalar Q Deneme&apos;de.
        </p>
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
            <PublisherCard key={`${p.name}-${i}`} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
