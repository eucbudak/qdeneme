import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/login/actions";
import type { SessionUser } from "@/lib/auth";

type Props = {
  user: SessionUser;
  nav?: { href: string; label: string }[];
};

export function AppHeader({ user, nav }: Props) {
  return (
    <header className="border-b bg-white dark:bg-zinc-950">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href={user.role === "ADMIN" ? "/admin" : "/student"} className="font-semibold">
            Q Deneme
          </Link>
          {nav && nav.length > 0 ? (
            <nav className="flex gap-4 text-sm">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>

        <div className="flex items-center gap-3 text-sm">
          <div className="text-right">
            <div className="font-medium">{user.full_name}</div>
            <div className="text-xs text-zinc-500">
              {user.role === "ADMIN"
                ? "Kurum yöneticisi"
                : user.institution_name}
            </div>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              Çıkış
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
