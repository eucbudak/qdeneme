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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createStudent } from "./actions";

type Institution = { id: string; name: string };

export function NewStudentDialog({
  institutions,
}: {
  institutions: Institution[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createStudent(formData);
      if (res.ok) {
        toast.success("Öğrenci eklendi");
        setOpen(false);
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error(res.error ?? "Hata");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Yeni öğrenci</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Yeni öğrenci</DialogTitle>
            <DialogDescription>
              Öğrenciye vereceğin kullanıcı adı ve şifreyi belirle.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="full_name">Ad Soyad</Label>
            <Input id="full_name" name="full_name" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">
              Kullanıcı adı (küçük harf, rakam, . _ -)
            </Label>
            <Input
              id="username"
              name="username"
              autoCapitalize="none"
              required
              pattern="[a-z0-9._\-]{3,32}"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Şifre (en az 8 karakter)</Label>
            <Input
              id="password"
              name="password"
              type="text"
              autoComplete="off"
              required
              minLength={8}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="institution_id">Lokasyon</Label>
            <Select name="institution_id" required>
              <SelectTrigger id="institution_id">
                <SelectValue placeholder="Seç" />
              </SelectTrigger>
              <SelectContent>
                {institutions.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Ekleniyor…" : "Ekle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
