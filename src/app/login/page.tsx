import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl">Q Deneme</CardTitle>
            <CardDescription>
              Kurumundan aldığın kullanıcı adı ve şifre ile giriş yap.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-zinc-500">
          <Link href="/" className="hover:underline">
            Ana sayfa
          </Link>
        </p>
      </div>
    </div>
  );
}
