import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-muted/30 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl" aria-hidden />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Icon className="h-8 w-8" strokeWidth={1.75} />
        </div>
      </div>
      <div className="max-w-sm space-y-1">
        <h3 className="text-base font-semibold">{title}</h3>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
