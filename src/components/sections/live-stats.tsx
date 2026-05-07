import { CalendarRange, MapPin, Target, Users } from "lucide-react";
import type { HomeStats } from "@/lib/db/home-stats";

type StatItem = {
  icon: typeof Users;
  value: string;
  label: string;
};

function formatCount(n: number, fallback: string): string {
  if (!n || n <= 0) return fallback;
  return n.toLocaleString("tr-TR");
}

export function LiveStats({
  stats,
  locationCount,
}: {
  stats: HomeStats;
  locationCount: number;
}) {
  const items: StatItem[] = [
    {
      icon: Users,
      value: formatCount(stats.studentCount, "—"),
      label: "kayıtlı öğrenci",
    },
    {
      icon: Target,
      value: formatCount(stats.selectionCount, "—"),
      label: "haftalık seçim",
    },
    {
      icon: MapPin,
      value: locationCount.toString(),
      label: "lokasyon",
    },
    {
      icon: CalendarRange,
      value: formatCount(stats.weekCount, "—"),
      label: "deneme haftası",
    },
  ];

  return (
    <section
      aria-label="Q Deneme istatistikleri"
      className="border-y bg-card/40 backdrop-blur"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-2 gap-y-4 px-4 py-5 sm:grid-cols-4 sm:gap-x-6 sm:py-6">
        {items.map(({ icon: Icon, value, label }) => (
          <div
            key={label}
            className="flex items-center gap-3 sm:justify-center"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/20">
              <Icon className="h-4 w-4" strokeWidth={2.2} />
            </span>
            <div className="min-w-0">
              <div className="text-xl font-bold leading-none tracking-tight sm:text-2xl">
                {value}
              </div>
              <div className="mt-1 truncate text-[11px] uppercase tracking-wider text-muted-foreground">
                {label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
