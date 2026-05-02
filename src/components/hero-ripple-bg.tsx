import { cn } from "@/lib/utils";

type Drop = {
  size: number;
  left: string;
  bottom: string;
  delay: string;
  duration: string;
  opacity: string;
  tone: "primary" | "accent";
};

const DROPS: Drop[] = [
  { size: 220, left: "8%", bottom: "10%", delay: "0s", duration: "11s", opacity: "0.35", tone: "primary" },
  { size: 140, left: "22%", bottom: "30%", delay: "2.5s", duration: "9s", opacity: "0.4", tone: "accent" },
  { size: 90, left: "40%", bottom: "8%", delay: "1s", duration: "8s", opacity: "0.5", tone: "primary" },
  { size: 180, left: "55%", bottom: "55%", delay: "3.5s", duration: "12s", opacity: "0.3", tone: "accent" },
  { size: 110, left: "72%", bottom: "20%", delay: "0.8s", duration: "10s", opacity: "0.45", tone: "primary" },
  { size: 70, left: "85%", bottom: "60%", delay: "4s", duration: "7s", opacity: "0.55", tone: "accent" },
  { size: 130, left: "92%", bottom: "12%", delay: "2s", duration: "9.5s", opacity: "0.35", tone: "primary" },
];

export function HeroRippleBg({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      {DROPS.map((d, i) => (
        <span
          key={i}
          className={cn(
            "animate-ripple absolute rounded-full blur-2xl",
            d.tone === "primary" ? "bg-primary/30" : "bg-accent/40",
          )}
          style={
            {
              width: d.size,
              height: d.size,
              left: d.left,
              bottom: d.bottom,
              "--ripple-delay": d.delay,
              "--ripple-duration": d.duration,
              "--ripple-opacity": d.opacity,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
