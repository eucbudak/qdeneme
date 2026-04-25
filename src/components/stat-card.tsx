import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Tone = "primary" | "accent" | "success" | "warning" | "muted";

const TONE_CLASSES: Record<Tone, { bubble: string; ring: string }> = {
  primary: {
    bubble: "bg-primary/12 text-primary",
    ring: "ring-primary/20",
  },
  accent: {
    bubble: "bg-accent/40 text-accent-foreground",
    ring: "ring-accent/30",
  },
  success: {
    bubble: "bg-success/15 text-success",
    ring: "ring-success/20",
  },
  warning: {
    bubble: "bg-warning/15 text-warning-foreground",
    ring: "ring-warning/30",
  },
  muted: {
    bubble: "bg-muted text-muted-foreground",
    ring: "ring-border",
  },
};

type Props = {
  icon?: LucideIcon;
  tone?: Tone;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
};

export function StatCard({
  icon: Icon,
  tone = "primary",
  title,
  description,
  children,
  className,
}: Props) {
  const t = TONE_CLASSES[tone];
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base">{title}</CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </div>
        {Icon ? (
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1",
              t.bubble,
              t.ring,
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </div>
        ) : null}
      </CardHeader>
      {children ? <CardContent className="space-y-2">{children}</CardContent> : null}
    </Card>
  );
}
