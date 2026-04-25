import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/login/actions";
import type { SessionUser } from "@/lib/auth";
import { BrandMark } from "@/components/brand-mark";
import { NavLinks, type NavItem } from "@/components/nav-links";

type Props = {
  user: SessionUser;
  nav?: NavItem[];
};

export function AppHeader({ user, nav }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex min-w-0 items-center gap-6">
          <BrandMark
            size="sm"
            href={user.role === "ADMIN" ? "/admin" : "/student"}
          />
          {nav && nav.length > 0 ? <NavLinks items={nav} /> : null}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-sm font-semibold leading-tight">
              {user.full_name}
            </div>
            <div className="text-xs text-muted-foreground">
              {user.role === "ADMIN" ? "Yönetici" : user.institution_name}
            </div>
          </div>
          <form action={signOut}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <LogOut className="h-4 w-4" strokeWidth={2} />
              <span className="hidden sm:inline">Çıkış</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
