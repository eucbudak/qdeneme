"use client";

import { useActionState } from "react";
import { AlertCircle, ArrowRight } from "lucide-react";
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
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="username" className="text-sm font-semibold">
          Kullanıcı adı
        </Label>
        <Input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          required
          disabled={pending}
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-semibold">
          Şifre
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={pending}
          className="h-11"
        />
      </div>

      {state?.error ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full gap-2"
        size="lg"
      >
        {pending ? "Giriş yapılıyor…" : "Giriş yap"}
        {!pending ? <ArrowRight className="h-4 w-4" /> : null}
      </Button>
    </form>
  );
}
