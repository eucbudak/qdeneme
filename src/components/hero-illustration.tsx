import Image from "next/image";
import { Star } from "lucide-react";

const PUBLISHERS = [
  // [label, position classes, animation delay (s)]
  { label: "Toprak TYT", pos: "top-2 left-0", delay: "0s", tone: "primary" },
  { label: "3D TYT", pos: "top-16 right-0", delay: "0.6s", tone: "accent" },
  { label: "ÖZDEBİR TYT-AYT", pos: "top-1/2 -left-4 -translate-y-1/2", delay: "1.2s", tone: "warning" },
  { label: "Endemik TYT", pos: "top-1/2 -right-2 -translate-y-1/2", delay: "1.8s", tone: "primary" },
  { label: "ÇAP AYT", pos: "bottom-12 left-2", delay: "2.4s", tone: "accent" },
  { label: "APOTEMİ TYT", pos: "bottom-2 right-4", delay: "3s", tone: "warning" },
] as const;

const TONE_CLASS: Record<"primary" | "accent" | "warning", string> = {
  primary: "bg-card ring-primary/30 text-foreground",
  accent: "bg-card ring-accent/40 text-foreground",
  warning: "bg-card ring-warning/40 text-foreground",
};

export function HeroIllustration({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="relative mx-auto aspect-square w-full max-w-md">
        {/* Background gradient blob */}
        <div
          aria-hidden
          className="absolute inset-6 rounded-[40%] bg-brand-gradient opacity-20 blur-3xl"
        />

        {/* Stock photo — yuvarlatılmış, brand çerçeveli */}
        <div className="absolute inset-12 overflow-hidden rounded-[2rem] ring-4 ring-card shadow-2xl">
          <Image
            src="/student.png"
            alt="Çalışan öğrenci"
            fill
            sizes="(min-width: 1024px) 500px, 90vw"
            className="object-cover"
            priority
          />
          {/* Hafif gradient overlay — alttan üste primary tint */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-primary/15 to-transparent"
          />
        </div>

        {/* Yıldız aksesuarları */}
        <Star
          className="absolute right-4 top-4 h-6 w-6 fill-primary text-primary opacity-70"
          aria-hidden
        />
        <Star
          className="absolute bottom-8 left-1 h-4 w-4 fill-accent text-accent opacity-70"
          aria-hidden
        />

        {/* Yayın kartları — yüzen */}
        {PUBLISHERS.map((p) => (
          <div
            key={p.label}
            className={`absolute ${p.pos} animate-float pointer-events-none`}
            style={{ animationDelay: p.delay }}
          >
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg ring-1 backdrop-blur ${TONE_CLASS[p.tone]}`}
            >
              <span
                className="h-1.5 w-1.5 rounded-full bg-current"
                aria-hidden
              />
              {p.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
