import { Quote, Star } from "lucide-react";
import { Reveal } from "@/components/reveal";

type Testimonial = {
  quote: string;
  name: string;
  role: string; // örn. "12. sınıf · KNT Efeler" veya "Veli"
  initials: string;
  // Avatar arkaplanı için tema rengi
  tone: "primary" | "accent" | "warning";
};

// NOTE: placeholder yorumlar — gerçek öğrenci/veli ifadeleriyle değiştirilecek.
const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Her hafta farklı yayın seçebilmek, gerçek sınava daha hazır hissetmemi sağladı. Pazar günleri artık deneme günü.",
    name: "Elif Y.",
    role: "12. sınıf · KNT Efeler",
    initials: "EY",
    tone: "primary",
  },
  {
    quote:
      "Çocuğumun motivasyonu ciddi şekilde arttı. Üç lokasyon olması da işimize yarıyor — yakın olana gidiyor.",
    name: "Mehmet A.",
    role: "Veli · Aydın",
    initials: "MA",
    tone: "accent",
  },
  {
    quote:
      "Sınav atmosferi okul denemelerinden bambaşka. Süre baskısı altında pratik yapmak için ideal.",
    name: "Berke K.",
    role: "Mezun · Q Work",
    initials: "BK",
    tone: "warning",
  },
];

const TONE_CLASSES: Record<Testimonial["tone"], string> = {
  primary: "bg-primary/12 text-primary ring-primary/20",
  accent: "bg-accent/20 text-accent-foreground ring-accent/40",
  warning: "bg-warning/20 text-warning-foreground ring-warning/40",
};

function TestimonialCard({ t, delay }: { t: Testimonial; delay: number }) {
  return (
    <Reveal delay={delay} className="h-full">
      <figure className="group relative flex h-full flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
        <Quote
          aria-hidden
          className="absolute right-5 top-5 h-8 w-8 text-primary/15 transition-colors group-hover:text-primary/25"
        />
        <div className="flex items-center gap-1 text-amber-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-current" strokeWidth={0} />
          ))}
        </div>
        <blockquote className="relative text-sm leading-relaxed text-foreground/90 sm:text-[15px]">
          “{t.quote}”
        </blockquote>
        <figcaption className="mt-auto flex items-center gap-3 border-t pt-4">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-semibold ring-1 ${TONE_CLASSES[t.tone]}`}
          >
            {t.initials}
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold leading-tight">
              {t.name}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {t.role}
            </div>
          </div>
        </figcaption>
      </figure>
    </Reveal>
  );
}

export function TestimonialsSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 lg:py-16">
      <Reveal className="mb-8 max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
          <Quote className="h-3 w-3 text-primary" />
          Öğrenciler ne diyor?
        </span>
        <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
          <span className="text-brand-gradient">Pazar günleri</span> deneme günü
        </h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Q Deneme&apos;ye giren öğrencilerden ve velilerden kısa kısa.
        </p>
      </Reveal>

      <div className="grid gap-4 md:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <TestimonialCard key={t.name} t={t} delay={i * 100} />
        ))}
      </div>
    </section>
  );
}
