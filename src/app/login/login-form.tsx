"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, type LoginState } from "./actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    signIn,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="username">Kullanıcı adı</Label>
        <Input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          required
          disabled={pending}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Şifre</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={pending}
        />
      </div>

      {state?.error ? (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Giriş yapılıyor…" : "Giriş yap"}
      </Button>

      <p className="text-center text-xs text-zinc-500">
        Şifreni unuttuysan <span className="font-medium">kurumuna başvur</span>.
      </p>
    </form>
  );
}
