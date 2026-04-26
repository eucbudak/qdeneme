import Image from "next/image";
import { Star } from "lucide-react";

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
      </div>
    </div>
  );
}
