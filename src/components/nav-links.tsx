"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavItem = {
  href: string;
  label: string;
  icon?: LucideIcon;
  match?: "exact" | "prefix";
};

export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-1 sm:flex">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.match === "exact"
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {Icon ? <Icon className="h-4 w-4" strokeWidth={2} /> : null}
            <span>{item.label}</span>
            {isActive ? (
              <span
                aria-hidden
                className="absolute -bottom-px left-3 right-3 h-0.5 rounded-full bg-primary"
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
