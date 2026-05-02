import { Calendar, Lightbulb, MapPin, Sparkles } from "lucide-react";

const ITEMS = [
  {
    icon: Calendar,
    title: "Her hafta yeni yayın",
    desc: "Pazar gününe özel, yayın seçim özgürlüğü. Tek bir kaynağa bağlı kalmadan zenginleş.",
  },
  {
    icon: Sparkles,
    title: "Profesyonel sınav atmosferi",
    desc: "Gerçek sınava en yakın koşullar — süre, sessizlik, salon düzeni.",
  },
  {
    icon: Lightbulb,
    title: "Hızlı geri bildirim",
    desc: "Cevap anahtarı ve değerlendirmen gecikmeden eline geçer.",
  },
  {
    icon: MapPin,
    title: "Lokasyon esnekliği",
    desc: "Üç farklı merkez. Sana uygun olanı seç, hafta hafta değiştirebilirsin.",
  },
];

export function WhyQSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 lg:py-16">
      <div className="mb-8 max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
          <Sparkles className="h-3 w-3 text-primary" />
          Neden Q Deneme?
        </span>
        <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
          Sınav haftana hazır bir sistem
        </h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Tek tip deneme yerine, her hafta seçtiğin yayınla denemeni çöz. Kurum
          seansı ayarlasın, sen sadece gel, otur, çöz.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-2xl border bg-card p-5 transition-shadow hover:shadow-md"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/20">
              <Icon className="h-5 w-5" strokeWidth={2} />
            </div>
            <h3 className="mb-1 font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
