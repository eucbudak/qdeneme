import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { w: 110, h: 26, className: "h-6" },
  md: { w: 150, h: 36, className: "h-8" },
  lg: { w: 220, h: 52, className: "h-12" },
} as const;

type Props = {
  size?: keyof typeof SIZES;
  href?: string | null;
  className?: string;
};

export function BrandMark({ size = "md", href = "/", className }: Props) {
  const s = SIZES[size];
  const inner = (
    <Image
      src="/logo.png"
      alt="Q Deneme"
      width={s.w}
      height={s.h}
      priority
      className={cn(s.className, "w-auto", className)}
    />
  );
  if (!href) return inner;
  return (
    <Link href={href} className="inline-flex items-center" aria-label="Q Deneme ana sayfa">
      {inner}
    </Link>
  );
}
