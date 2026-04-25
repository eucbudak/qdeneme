"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { resetStudentPassword, toggleStudentActive } from "./actions";

export function ResetPasswordButton({
  studentId,
  studentName,
}: {
  studentId: string;
  studentName: string;
}) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await resetStudentPassword(studentId, password);
      if (res.ok) {
        toast.success(`${studentName} için şifre değiştirildi`);
        setOpen(false);
        setPassword("");
      } else {
        toast.error(res.error ?? "Hata");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Şifre sıfırla
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Şifre sıfırla</DialogTitle>
            <DialogDescription>
              {studentName} için yeni şifre belirle. Öğrenciye ilet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="new-password">Yeni şifre (en az 8 karakter)</Label>
            <Input
              id="new-password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
              required
              minLength={8}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Kaydediliyor…" : "Kaydet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ToggleActiveButton({
  studentId,
  isActive,
  studentName,
}: {
  studentId: string;
  isActive: boolean;
  studentName: string;
}) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const res = await toggleStudentActive(studentId, !isActive);
      if (res.ok) {
        toast.success(
          isActive
            ? `${studentName} devre dışı bırakıldı`
            : `${studentName} aktif edildi`,
        );
      } else {
        toast.error(res.error ?? "Hata");
      }
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={pending}
    >
      {isActive ? "Devre dışı bırak" : "Aktif et"}
    </Button>
  );
}
